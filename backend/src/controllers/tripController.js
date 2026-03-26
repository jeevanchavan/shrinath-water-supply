const tripService  = require("../services/tripService");
const sendResponse = require("../utils/sendResponse");

const getAll = async (req, res, next) => {
  try {
    const result = await tripService.getAllTrips(req.user._id, req.query);
    sendResponse(res, 200, true, "Success", result);
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const trip = await tripService.getTripById(req.params.id, req.user._id);
    sendResponse(res, 200, true, "Success", { trip });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const trip = await tripService.createTrip(req.body, req.user._id);
    sendResponse(res, 201, true, "Trip assigned successfully", { trip });
  } catch (err) { next(err); }
};

const updateStatus = async (req, res, next) => {
  try {
    const trip = await tripService.updateTripStatus(
      req.params.id,
      req.body.status,
      req.user._id,
      req.user.role
    );
    sendResponse(res, 200, true, "Status updated", { trip });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await tripService.deleteTrip(req.params.id, req.user._id);
    sendResponse(res, 200, true, "Trip deleted", {});
  } catch (err) { next(err); }
};

const getDriverToday = async (req, res, next) => {
  try {
    const trips = await tripService.getDriverTodayTrips(req.user._id);
    sendResponse(res, 200, true, "Success", { trips });
  } catch (err) { next(err); }
};

const getDriverHistory = async (req, res, next) => {
  try {
    const result = await tripService.getDriverHistory(req.user._id, req.query.page, req.query.limit);
    sendResponse(res, 200, true, "Success", result);
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, updateStatus, remove, getDriverToday, getDriverHistory };
