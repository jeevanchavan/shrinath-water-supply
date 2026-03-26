const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: [true, "Name is required"], trim: true },
    phone:    { type: String, required: [true, "Phone is required"], unique: true, trim: true },
    password: { type: String, required: [true, "Password is required"], minlength: 6, select: false },
    role:     { type: String, enum: ["owner", "driver"], required: true },
    // Owner ref — only set for drivers
    owner:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    // Driver fields
    vehicle:  { type: String, trim: true, default: "" },
    license:  { type: String, trim: true, default: "" },
    address:  { type: String, trim: true, default: "" },
    rating:   { type: Number, default: 5.0, min: 1, max: 5 },
    status:   { type: String, enum: ["active", "on-trip", "inactive"], default: "active" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ role: 1, owner: 1, isActive: 1 });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
