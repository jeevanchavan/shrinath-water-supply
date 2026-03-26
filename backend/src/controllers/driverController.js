const driverService = require("../services/driverService");
const sendResponse  = require("../utils/sendResponse");

const getAll = async (req, res, next) => {
  try {
    const drivers = await driverService.getAllDrivers(req.user._id);
    sendResponse(res, 200, true, "Success", { drivers });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const driver = await driverService.getDriverById(req.params.id, req.user._id);
    sendResponse(res, 200, true, "Success", { driver });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const driver = await driverService.createDriver(req.body, req.user._id);
    sendResponse(res, 201, true, "Driver registered successfully", { driver });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const driver = await driverService.updateDriver(req.params.id, req.body, req.user._id);
    sendResponse(res, 200, true, "Driver updated", { driver });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await driverService.deactivateDriver(req.params.id, req.user._id);
    sendResponse(res, 200, true, "Driver deactivated", {});
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
