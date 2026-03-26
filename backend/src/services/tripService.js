const mongoose = require("mongoose");
const Trip     = require("../models/Trip");
const Customer = require("../models/Customer");
const User     = require("../models/User");
const AppError = require("../utils/AppError");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const POPULATE = [
  { path: "customer", select: "name phone address" },
  { path: "driver",   select: "name phone vehicle status" },
];

const ALLOWED_TRANSITIONS = {
  pending:   ["on-way", "cancelled"],
  "on-way":  ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const getAllTrips = async (ownerId, filters) => {
  const { status, search, page = 1, limit = 15 } = filters;
  const query = { owner: ownerId };
  if (status && status !== "all") query.status = status;

  // Server-side search support (by tripNumber)
  if (search) {
    const tripNumMatch = search.replace(/^T-/i, "");
    const num = parseInt(tripNumMatch, 10);
    if (!isNaN(num)) query.tripNumber = num;
  }

  const skip  = (Number(page) - 1) * Number(limit);
  const [trips, total] = await Promise.all([
    Trip.find(query)
      .populate(POPULATE)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Trip.countDocuments(query),
  ]);

  return { trips, total, page: Number(page), limit: Number(limit) };
};

const getTripById = async (id, ownerId) => {
  if (!mongoose.isValidObjectId(id)) throw new AppError("Invalid trip ID", 400);
  const trip = await Trip.findOne({ _id: id, owner: ownerId }).populate(POPULATE).lean();
  if (!trip) throw new AppError("Trip not found", 404);
  return trip;
};

const createTrip = async (body, ownerId) => {
  const { customer, driver, tanks, amount, scheduledTime, note } = body;

  if (!mongoose.isValidObjectId(customer)) throw new AppError("Invalid customer ID", 400);
  if (!mongoose.isValidObjectId(driver))   throw new AppError("Invalid driver ID", 400);

  const [cust, drv] = await Promise.all([
    Customer.findOne({ _id: customer, owner: ownerId }).lean(),
    User.findOne({ _id: driver, role: "driver", owner: ownerId }).lean(),
  ]);

  if (!cust) throw new AppError("Customer not found", 404);
  if (!drv)  throw new AppError("Driver not found", 404);

  const trip = await Trip.create({
    owner: ownerId,
    customer,
    driver,
    address: cust.address,
    tanks:  Number(tanks),
    amount: Number(amount),
    scheduledTime: scheduledTime || "",
    note:          note          || "",
  });

  return Trip.findById(trip._id).populate(POPULATE).lean();
};

const updateTripStatus = async (id, status, userId, role) => {
  if (!mongoose.isValidObjectId(id)) throw new AppError("Invalid trip ID", 400);

  const query = role === "owner" ? { _id: id, owner: userId } : { _id: id, driver: userId };
  const trip  = await Trip.findOne(query);
  if (!trip) throw new AppError("Trip not found", 404);

  const allowed = ALLOWED_TRANSITIONS[trip.status] || [];
  if (!allowed.includes(status)) {
    throw new AppError(`Cannot change status from '${trip.status}' to '${status}'`, 400);
  }

  if (status === "on-way")    trip.startedAt   = new Date();
  if (status === "delivered") trip.deliveredAt = new Date();

  trip.status = status;
  await trip.save();

  // Update driver status
  if (status === "on-way") {
    await User.findByIdAndUpdate(trip.driver, { status: "on-trip" });
  } else if (status === "delivered" || status === "cancelled") {
    const activeTrip = await Trip.findOne({ driver: trip.driver, status: "on-way", _id: { $ne: trip._id } });
    if (!activeTrip) await User.findByIdAndUpdate(trip.driver, { status: "active" });
  }

  return Trip.findById(trip._id).populate(POPULATE).lean();
};

const deleteTrip = async (id, ownerId) => {
  if (!mongoose.isValidObjectId(id)) throw new AppError("Invalid trip ID", 400);
  const trip = await Trip.findOneAndDelete({ _id: id, owner: ownerId });
  if (!trip) throw new AppError("Trip not found", 404);
};

const getDriverTodayTrips = async (driverId) => {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const end   = new Date(); end.setHours(23, 59, 59, 999);

  return Trip.find({
    driver: driverId,
    createdAt: { $gte: start, $lte: end },
  })
    .populate({ path: "customer", select: "name phone address" })
    .sort({ createdAt: 1 })
    .lean();
};

const getDriverHistory = async (driverId, page = 1, limit = 15) => {
  const skip = (Number(page) - 1) * Number(limit);
  const [trips, total, earnedAgg] = await Promise.all([
    Trip.find({ driver: driverId })
      .populate({ path: "customer", select: "name address" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Trip.countDocuments({ driver: driverId }),
    // Fix: total earned across ALL trips, not just current page
    Trip.aggregate([
      { $match: { driver: new mongoose.Types.ObjectId(driverId), status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);
  return {
    trips,
    total,
    totalEarned: earnedAgg[0]?.total || 0,
    page: Number(page),
    limit: Number(limit),
  };
};

module.exports = {
  getAllTrips,
  getTripById,
  createTrip,
  updateTripStatus,
  deleteTrip,
  getDriverTodayTrips,
  getDriverHistory,
};
