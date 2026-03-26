const authService  = require("../services/authService");
const sendResponse = require("../utils/sendResponse");

const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const { token, user }     = await authService.login(phone, password);
    sendResponse(res, 200, true, "Login successful", { token, user });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id);
    sendResponse(res, 200, true, "Success", { user });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe };
