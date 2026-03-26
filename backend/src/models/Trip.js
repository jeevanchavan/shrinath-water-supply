const mongoose = require("mongoose");
const Counter  = require("./Counter");

const tripSchema = new mongoose.Schema(
  {
    tripNumber:    { type: Number, unique: true },
    owner:         { type: mongoose.Schema.Types.ObjectId, ref: "User",     required: true },
    driver:        { type: mongoose.Schema.Types.ObjectId, ref: "User",     required: true },
    customer:      { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    address:       { type: String, required: true, trim: true },
    tanks:         { type: Number, required: true, min: 1 },
    amount:        { type: Number, required: true, min: 0 },
    status:        { type: String, enum: ["pending", "on-way", "delivered", "cancelled"], default: "pending" },
    isPaid:        { type: Boolean, default: false },
    paymentMode:   { type: String, default: "" },
    scheduledTime: { type: String, default: "" },
    note:          { type: String, default: "", trim: true },
    startedAt:     { type: Date },
    deliveredAt:   { type: Date },
  },
  { timestamps: true }
);

// Indexes for performance
tripSchema.index({ owner: 1, createdAt: -1 });
tripSchema.index({ driver: 1, status: 1 });
tripSchema.index({ customer: 1 });
tripSchema.index({ owner: 1, status: 1 });

// Atomic auto-increment using Counter model (race-condition safe)
tripSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.tripNumber = await Counter.next("trip");
  }
  next();
});

// Virtual tripId like T-001
tripSchema.virtual("tripId").get(function () {
  return `T-${String(this.tripNumber).padStart(3, "0")}`;
});

tripSchema.set("toJSON",   { virtuals: true });
tripSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Trip", tripSchema);
