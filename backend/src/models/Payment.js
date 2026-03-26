const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    owner:       { type: mongoose.Schema.Types.ObjectId, ref: "User",     required: true },
    customer:    { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    trip:        { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
    amount:      { type: Number, required: true, min: 1 },
    mode:        { type: String, enum: ["cash", "upi", "bank_transfer"], required: true },
    note:        { type: String, default: "" },
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Indexes
paymentSchema.index({ owner: 1, createdAt: -1 });
paymentSchema.index({ customer: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
