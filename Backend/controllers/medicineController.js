const Medicine = require("../models/Medicine");

// Get all medicines
exports.getAllMedicines = async (req, res) => {

  try {
    const medicines = await Medicine.find();
    res.json({ medicines });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single medicine by ID
exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine)
      return res.status(404).json({ message: "Medicine not found" });
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new medicine
exports.addMedicine = async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    const savedMedicine = await medicine.save();
    res.status(201).json(savedMedicine);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
