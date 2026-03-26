const customerService = require("../services/customerService");
const sendResponse    = require("../utils/sendResponse");

const getAll = async (req, res, next) => {
  try {
    const customers = await customerService.getAllCustomers(req.user._id, req.query.search);
    sendResponse(res, 200, true, "Success", { customers });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id, req.user._id);
    sendResponse(res, 200, true, "Success", { customer });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const customer = await customerService.createCustomer(req.body, req.user._id);
    sendResponse(res, 201, true, "Customer added successfully", { customer });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body, req.user._id);
    sendResponse(res, 200, true, "Customer updated", { customer });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await customerService.deleteCustomer(req.params.id, req.user._id);
    sendResponse(res, 200, true, "Customer removed", {});
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
