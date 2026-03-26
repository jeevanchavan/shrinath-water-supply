const Customer = require("../models/Customer");
const Trip     = require("../models/Trip");
const AppError = require("../utils/AppError");
const mongoose = require("mongoose");

// Sanitize user input for regex to prevent ReDoS
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getAllCustomers = async (ownerId, search = "") => {
  const query = { owner: ownerId, isActive: true };
  if (search) query.name = { $regex: escapeRegex(search), $options: "i" };

  const customers = await Customer.find(query).sort({ createdAt: -1 }).lean();

  if (customers.length === 0) return [];

  // Fix N+1: single aggregation for all trip stats
  const customerIds = customers.map(c => c._id);

  const tripStats = await Trip.aggregate([
    { $match: { customer: { $in: customerIds } } },
    {
      $group: {
        _id:        "$customer",
        orderCount: { $sum: 1 },
        totalBilled:{ $sum: "$amount" },
      },
    },
  ]);

  const statsMap = Object.fromEntries(
    tripStats.map(s => [s._id.toString(), s])
  );

  return customers.map(c => ({
    ...c,
    orderCount:  statsMap[c._id.toString()]?.orderCount  || 0,
    totalBilled: statsMap[c._id.toString()]?.totalBilled || 0,
  }));
};

const getCustomerById = async (id, ownerId) => {
  const customer = await Customer.findOne({ _id: id, owner: ownerId }).lean();
  if (!customer) throw new AppError("Customer not found", 404);
  return customer;
};

const createCustomer = async (data, ownerId) => {
  const customer = await Customer.create({ ...data, owner: ownerId });
  return customer;
};

const updateCustomer = async (id, data, ownerId) => {
  const customer = await Customer.findOneAndUpdate(
    { _id: id, owner: ownerId },
    { $set: data },
    { new: true, runValidators: true }
  ).lean();
  if (!customer) throw new AppError("Customer not found", 404);
  return customer;
};

const deleteCustomer = async (id, ownerId) => {
  const customer = await Customer.findOneAndUpdate(
    { _id: id, owner: ownerId },
    { isActive: false },
    { new: true }
  );
  if (!customer) throw new AppError("Customer not found", 404);
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
