const dashboardService = require("../services/dashboardService");
const sendResponse     = require("../utils/sendResponse");

const ownerStats = async (req, res, next) => {
  try {
    const data = await dashboardService.getOwnerDashboard(req.user._id);
    sendResponse(res, 200, true, "Success", data);
  } catch (err) { next(err); }
};

const ownerReports = async (req, res, next) => {
  try {
    const data = await dashboardService.getOwnerReports(req.user._id);
    sendResponse(res, 200, true, "Success", data);
  } catch (err) { next(err); }
};

const driverStats = async (req, res, next) => {
  try {
    const data = await dashboardService.getDriverDashboard(req.user._id);
    sendResponse(res, 200, true, "Success", data);
  } catch (err) { next(err); }
};

module.exports = { ownerStats, ownerReports, driverStats };
