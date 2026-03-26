const Payment  = require("../models/Payment");
const Customer = require("../models/Customer");
const Trip     = require("../models/Trip");
const AppError = require("../utils/AppError");
const mongoose = require("mongoose");

const collectPayment = async ({ customerId, amount, mode, note, tripId, ownerId, collectedBy }) => {
  if (!mongoose.isValidObjectId(customerId)) throw new AppError("Invalid customer ID", 400);

  const customer = await Customer.findOne({ _id: customerId, owner: ownerId });
  if (!customer) throw new AppError("Customer not found", 404);
  if (Number(amount) > customer.totalDue) throw new AppError("Amount exceeds outstanding balance", 400);

  // Atomic transaction — all-or-nothing
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [payment] = await Payment.create(
      [{
        owner: ownerId,
        customer: customerId,
        trip: tripId || undefined,
        amount: Number(amount),
        mode,
        note: note || "",
        collectedBy,
      }],
      { session }
    );

    // Atomically reduce customer due — never below 0
    await Customer.findByIdAndUpdate(
      customerId,
      { $inc: { totalDue: -Number(amount) } },
      { session }
    );

    // Mark trip as paid if provided
    if (tripId && mongoose.isValidObjectId(tripId)) {
      await Trip.findByIdAndUpdate(
        tripId,
        { isPaid: true, paymentMode: mode },
        { session }
      );
    }

    await session.commitTransaction();

    return Payment.findById(payment._id)
      .populate({ path: "customer", select: "name phone" })
      .lean();

  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

const getPaymentSummary = async (ownerId) => {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [collectedAgg, pendingAgg, billedAgg] = await Promise.all([
    Payment.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(ownerId), createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Customer.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(ownerId), isActive: true } },
      { $group: { _id: null, total: { $sum: "$totalDue" } } },
    ]),
    Trip.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(ownerId) } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  return {
    collectedThisMonth: collectedAgg[0]?.total || 0,
    totalPending:       pendingAgg[0]?.total   || 0,
    totalBilled:        billedAgg[0]?.total    || 0,
  };
};

const getPaymentHistory = async (ownerId, page = 1, limit = 20) => {
  const skip = (Number(page) - 1) * Number(limit);
  const [payments, total] = await Promise.all([
    Payment.find({ owner: ownerId })
      .populate({ path: "customer", select: "name phone" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Payment.countDocuments({ owner: ownerId }),
  ]);
  return { payments, total, page: Number(page), limit: Number(limit) };
};

module.exports = { collectPayment, getPaymentSummary, getPaymentHistory };
