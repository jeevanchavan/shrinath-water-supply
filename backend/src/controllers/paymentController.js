const paymentService = require("../services/paymentService");
const sendResponse   = require("../utils/sendResponse");

const collect = async (req, res, next) => {
  try {
    const payment = await paymentService.collectPayment({
      ...req.body,
      ownerId:     req.user._id,
      collectedBy: req.user._id,
    });
    sendResponse(res, 201, true, "Payment collected", { payment });
  } catch (err) { next(err); }
};

const getSummary = async (req, res, next) => {
  try {
    const summary = await paymentService.getPaymentSummary(req.user._id);
    sendResponse(res, 200, true, "Success", { summary });
  } catch (err) { next(err); }
};

const getHistory = async (req, res, next) => {
  try {
    const result = await paymentService.getPaymentHistory(req.user._id, req.query.page, req.query.limit);
    sendResponse(res, 200, true, "Success", result);
  } catch (err) { next(err); }
};

module.exports = { collect, getSummary, getHistory };
