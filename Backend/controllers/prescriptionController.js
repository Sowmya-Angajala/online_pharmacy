// controllers/prescriptionController.js
const PrescriptionRequest = require('../models/PrescriptionRequest');
const User = require('../models/User');

// @desc    Create prescription request (Patient)
// @route   POST /api/prescription/requests
// @access  Private (Patient only)
const createPrescriptionRequest = async (req, res) => {
  try {
    // Check if user is a patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can create prescription requests'
      });
    }

    const { symptoms, description } = req.body;
    
    // Validate required fields
    if (!symptoms || !description) {
      return res.status(400).json({
        success: false,
        message: 'Symptoms and description are required'
      });
    }

    // Handle file uploads (if using multer)
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => {
        // Return the file path or cloud storage URL
        return `/uploads/${file.filename}`; // Adjust based on your storage setup
      });
    }

    const prescriptionRequest = await PrescriptionRequest.create({
      patient: req.user.id,
      symptoms: symptoms.trim(),
      description: description.trim(),
      images,
      status: 'pending'
    });

    // Populate patient details for response
    await prescriptionRequest.populate('patient', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Prescription request submitted successfully',
      data: prescriptionRequest
    });

  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating prescription request',
      error: error.message
    });
  }
};

// @desc    Get patient's prescription requests
// @route   GET /api/prescription/patient/requests
// @access  Private (Patient only)
const getPatientRequests = async (req, res) => {
  try {
    // Check if user is a patient
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const requests = await PrescriptionRequest.find({ patient: req.user.id })
      .populate('respondedBy', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });

  } catch (error) {
    console.error('Get patient requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prescription requests',
      error: error.message
    });
  }
};

// @desc    Get all prescription requests for pharmacist
// @route   GET /api/prescription/pharmacist/requests
// @access  Private (Pharmacist only)
const getPharmacistRequests = async (req, res) => {
  try {
    // Check if user is a pharmacist
    if (req.user.role !== 'pharmacist') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Pharmacist role required'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status && ['pending', 'in_review', 'completed'].includes(status)) {
      filter.status = status;
    }

    const requests = await PrescriptionRequest.find(filter)
      .populate('patient', 'name email phone dateOfBirth')
      .populate('respondedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PrescriptionRequest.countDocuments(filter);

    res.json({
      success: true,
      count: requests.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: requests
    });

  } catch (error) {
    console.error('Get pharmacist requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prescription requests',
      error: error.message
    });
  }
};

// @desc    Update prescription request (Pharmacist response)
// @route   PUT /api/prescription/requests/:id
// @access  Private (Pharmacist only)
const updatePrescriptionRequest = async (req, res) => {
  try {
    // Check if user is a pharmacist
    if (req.user.role !== 'pharmacist') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Pharmacist role required'
      });
    }

    const { pharmacistNotes, suggestedMedicines } = req.body;

    // Validate required fields
    if (!pharmacistNotes || !suggestedMedicines || !Array.isArray(suggestedMedicines)) {
      return res.status(400).json({
        success: false,
        message: 'Pharmacist notes and suggested medicines are required'
      });
    }

    // Validate each medicine object
    for (let medicine of suggestedMedicines) {
      if (!medicine.name || !medicine.dosage || !medicine.frequency || !medicine.duration) {
        return res.status(400).json({
          success: false,
          message: 'Each medicine must have name, dosage, frequency, and duration'
        });
      }
    }

    const request = await PrescriptionRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Prescription request not found'
      });
    }

    // Check if request is already completed
    if (request.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been completed'
      });
    }

    // Update the request
    request.pharmacistNotes = pharmacistNotes.trim();
    request.suggestedMedicines = suggestedMedicines;
    request.respondedBy = req.user.id;
    request.respondedAt = new Date();
    request.status = 'completed';

    const updatedRequest = await request.save();
    
    // Populate all fields for response
    await updatedRequest.populate('patient', 'name email phone');
    await updatedRequest.populate('respondedBy', 'name email');

    res.json({
      success: true,
      message: 'Prescription request updated successfully',
      data: updatedRequest
    });

  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating prescription request',
      error: error.message
    });
  }
};

// @desc    Get single prescription request
// @route   GET /api/prescription/requests/:id
// @access  Private
const getPrescriptionRequest = async (req, res) => {
  try {
    const request = await PrescriptionRequest.findById(req.params.id)
      .populate('patient', 'name email phone')
      .populate('respondedBy', 'name email');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Prescription request not found'
      });
    }

    // Check if user has access to this request
    if (req.user.role === 'patient' && request.patient._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this prescription request'
      });
    }

    res.json({
      success: true,
      data: request
    });

  } catch (error) {
    console.error('Get prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching prescription request',
      error: error.message
    });
  }
};

// @desc    Update request status (for internal use)
// @route   PATCH /api/prescription/requests/:id/status
// @access  Private (Pharmacist/Admin)
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'in_review', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const request = await PrescriptionRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Prescription request not found'
      });
    }

    request.status = status;
    const updatedRequest = await request.save();

    res.json({
      success: true,
      message: 'Request status updated successfully',
      data: updatedRequest
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating request status',
      error: error.message
    });
  }
};

module.exports = {
  createPrescriptionRequest,
  getPatientRequests,
  getPharmacistRequests,
  updatePrescriptionRequest,
  getPrescriptionRequest,
  updateRequestStatus
};