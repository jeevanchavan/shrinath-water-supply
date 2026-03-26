const mongoose = require("mongoose");
const Trip     = require("../models/Trip");
const Customer = require("../models/Customer");
const Payment  = require("../models/Payment");
const User     = require("../models/User");

const getOwnerDashboard = async (ownerId) => {
  const oid        = new mongoose.Types.ObjectId(ownerId);
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

  const [
    todayTrips, deliveredToday, pendingDueAgg,
    monthRevenueAgg, drivers, totalCustomers, recentTrips,
  ] = await Promise.all([
    Trip.countDocuments({ owner: oid, createdAt: { $gte: todayStart, $lte: todayEnd } }),
    Trip.countDocuments({ owner: oid, status: "delivered", deliveredAt: { $gte: todayStart } }),
    Customer.aggregate([
      { $match: { owner: oid, isActive: true } },
      { $group: { _id: null, total: { $sum: "$totalDue" } } },
    ]),
    Payment.aggregate([
      { $match: { owner: oid, createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    // Fix: only fetch drivers belonging to this owner
    User.find({ role: "driver", owner: oid, isActive: true }).select("name status vehicle rating").lean(),
    Customer.countDocuments({ owner: oid, isActive: true }),
    Trip.find({ owner: oid, createdAt: { $gte: todayStart, $lte: todayEnd } })
      .populate({ path: "customer", select: "name" })
      .populate({ path: "driver",   select: "name" })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  return {
    kpi: {
      todayTrips,
      deliveredToday,
      pendingDue:    pendingDueAgg[0]?.total    || 0,
      monthRevenue:  monthRevenueAgg[0]?.total  || 0,
      totalDrivers:  drivers.length,
      totalCustomers,
    },
    recentTrips,
    drivers,
  };
};

const getOwnerReports = async (ownerId) => {
  const oid   = new mongoose.Types.ObjectId(ownerId);
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();

  const weekRanges = [0, 1, 2, 3].map((w) => {
    const start = new Date(year, month, w * 7 + 1);
    const end   = new Date(year, month, w * 7 + 7, 23, 59, 59, 999);
    return { label: `Wk ${w + 1}`, start, end };
  });

  const weeklyData = await Promise.all(
    weekRanges.map(async (wk) => {
      const [revAgg, tripsCount] = await Promise.all([
        Payment.aggregate([
          { $match: { owner: oid, createdAt: { $gte: wk.start, $lte: wk.end } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Trip.countDocuments({ owner: oid, createdAt: { $gte: wk.start, $lte: wk.end } }),
      ]);
      return { label: wk.label, revenue: revAgg[0]?.total || 0, trips: tripsCount };
    })
  );

  const monthStart = new Date(year, month, 1);

  const [topCustomers, driverPerf, monthRevAgg, monthTrips, pendingAgg, activeCustomers] =
    await Promise.all([
      Trip.aggregate([
        { $match: { owner: oid } },
        { $group: { _id: "$customer", totalAmount: { $sum: "$amount" }, orderCount: { $sum: 1 } } },
        { $sort: { totalAmount: -1 } },
        { $limit: 5 },
        { $lookup: { from: "customers", localField: "_id", foreignField: "_id", as: "customer" } },
        { $unwind: "$customer" },
        { $project: { name: "$customer.name", totalAmount: 1, orderCount: 1 } },
      ]),
      Trip.aggregate([
        { $match: { owner: oid } },
        { $group: { _id: "$driver", totalTrips: { $sum: 1 }, delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } } } },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "driver" } },
        { $unwind: "$driver" },
        { $project: { name: "$driver.name", rating: "$driver.rating", totalTrips: 1, delivered: 1 } },
      ]),
      Payment.aggregate([
        { $match: { owner: oid, createdAt: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Trip.countDocuments({ owner: oid, createdAt: { $gte: monthStart } }),
      Customer.aggregate([
        { $match: { owner: oid, isActive: true } },
        { $group: { _id: null, total: { $sum: "$totalDue" } } },
      ]),
      Customer.countDocuments({ owner: oid, isActive: true }),
    ]);

  return {
    weeklyData,
    topCustomers,
    driverPerf,
    summary: {
      monthRevenue:    monthRevAgg[0]?.total || 0,
      monthTrips,
      monthPending:    pendingAgg[0]?.total  || 0,
      activeCustomers,
    },
  };
};

const getDriverDashboard = async (driverId) => {
  const did       = new mongoose.Types.ObjectId(driverId);
  const now       = new Date();
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay()); weekStart.setHours(0,0,0,0);
  const monthStart= new Date(now.getFullYear(), now.getMonth(), 1);

  const dayNames  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dailyEarnings = await Promise.all(
    dayNames.map(async (day, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const start = new Date(d); start.setHours(0, 0, 0, 0);
      const end   = new Date(d); end.setHours(23, 59, 59, 999);
      const agg   = await Trip.aggregate([
        { $match: { driver: did, status: "delivered", deliveredAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      return { day, amount: agg[0]?.total || 0 };
    })
  );

  const [totalTrips, weekTrips, monthEarnAgg, totalEarnAgg] = await Promise.all([
    Trip.countDocuments({ driver: did }),
    Trip.countDocuments({ driver: did, createdAt: { $gte: weekStart } }),
    Trip.aggregate([
      { $match: { driver: did, status: "delivered", deliveredAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Trip.aggregate([
      { $match: { driver: did, status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const totalDelivered = await Trip.countDocuments({ driver: did, status: "delivered" });
  const onTimeRate     = totalTrips > 0 ? Math.round((totalDelivered / totalTrips) * 100) : 0;

  return {
    kpi: {
      totalTrips,
      weekTrips,
      monthEarnings: monthEarnAgg[0]?.total  || 0,
      totalEarnings: totalEarnAgg[0]?.total   || 0,
      onTimeRate,
    },
    dailyEarnings,
  };
};

module.exports = { getOwnerDashboard, getOwnerReports, getDriverDashboard };
