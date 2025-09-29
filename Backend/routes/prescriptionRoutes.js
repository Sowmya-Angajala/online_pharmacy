// routes/prescriptionRoutes.js
const express = require('express');
const {
  createPrescriptionRequest,
  getPatientRequests,
  getPharmacistRequests,
  updatePrescriptionRequest,
  getPrescriptionRequest,
  updateRequestStatus
} = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload, handleUploadErrors } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Patient routes
router.post('/requests', 
  protect, 
  authorize('patient'),
  upload.array('images', 5),
  handleUploadErrors,
  createPrescriptionRequest
);

router.get('/patient/requests', 
  protect, 
  authorize('patient'), 
  getPatientRequests
);

// Pharmacist routes
router.get('/pharmacist/requests', 
  protect, 
  authorize('pharmacist', 'admin'), 
  getPharmacistRequests
);

router.put('/requests/:id', 
  protect, 
  authorize('pharmacist', 'admin'), 
  updatePrescriptionRequest
);

router.patch('/requests/:id/status', 
  protect, 
  authorize('pharmacist', 'admin'), 
  updateRequestStatus
);

// Common routes (accessible by both patient and pharmacist for their respective requests)
router.get('/requests/:id', 
  protect, 
  getPrescriptionRequest
);

module.exports = router;