const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    owner:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:          { type: String, required: [true, "Name is required"], trim: true },
    phone:         { type: String, required: [true, "Phone is required"], trim: true },
    address:       { type: String, required: [true, "Address is required"], trim: true },
    tankSize:      { type: String, default: "1000 Litre" },
    preferredTime: { type: String, default: "" },
    totalDue:      { type: Number, default: 0, min: 0 },
    isActive:      { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes
customerSchema.index({ owner: 1, isActive: 1 });
customerSchema.index({ owner: 1, name: 1 });

module.exports = mongoose.model("Customer", customerSchema);
