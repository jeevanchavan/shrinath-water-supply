const User     = require("../models/User");
const Trip     = require("../models/Trip");
const AppError = require("../utils/AppError");

const getAllDrivers = async (ownerId) => {
  const drivers = await User.find({ role: "driver", owner: ownerId }).lean();

  if (drivers.length === 0) return [];

  // Fix N+1: single aggregation instead of per-driver queries
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const driverIds = drivers.map(d => d._id);

  const tripCounts = await Trip.aggregate([
    { $match: { driver: { $in: driverIds } } },
    {
      $group: {
        _id: "$driver",
        total:     { $sum: 1 },
        thisMonth: {
          $sum: {
            $cond: [{ $gte: ["$createdAt", monthStart] }, 1, 0],
          },
        },
      },
    },
  ]);

  const countMap = Object.fromEntries(
    tripCounts.map(t => [t._id.toString(), t])
  );

  return drivers.map(d => ({
    ...d,
    totalTrips: countMap[d._id.toString()]?.total     || 0,
    monthTrips: countMap[d._id.toString()]?.thisMonth || 0,
  }));
};

const getDriverById = async (id, ownerId) => {
  const driver = await User.findOne({ _id: id, role: "driver", owner: ownerId }).lean();
  if (!driver) throw new AppError("Driver not found", 404);
  return driver;
};

const createDriver = async (data, ownerId) => {
  const exists = await User.findOne({ phone: data.phone });
  if (exists) throw new AppError("Phone number already registered", 409);
  const driver = await User.create({ ...data, role: "driver", owner: ownerId });
  return driver;
};

const updateDriver = async (id, data, ownerId) => {
  // Never let this update password or role
  const { password, role, owner: _owner, ...safe } = data;
  const driver = await User.findOneAndUpdate(
    { _id: id, role: "driver", owner: ownerId },
    { $set: safe },
    { new: true, runValidators: true }
  ).lean();
  if (!driver) throw new AppError("Driver not found", 404);
  return driver;
};

const deactivateDriver = async (id, ownerId) => {
  const driver = await User.findOneAndUpdate(
    { _id: id, role: "driver", owner: ownerId },
    { isActive: false },
    { new: true }
  ).lean();
  if (!driver) throw new AppError("Driver not found", 404);
  return driver;
};

module.exports = {
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deactivateDriver,
};
