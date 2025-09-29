const express = require("express");
const router = express.Router();
const medicineController = require("../controllers/medicineController");

// GET all medicines
router.get("/", medicineController.getAllMedicines);

// GET single medicine by ID
router.get("/:id", medicineController.getMedicineById);

// POST add new medicine
router.post("/", medicineController.addMedicine);

module.exports = router;
