const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  usage: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  dosage: { type: String },
  manufacturer: { type: String },
  expiry_date: { type: Date },
  side_effects: { type: [String] },
  category: { type: String }
}, { timestamps: true });


module.exports = mongoose.model("Medicine", medicineSchema);
