const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const {
    searchPatients,
    getPatientDetails,
    uploadMedicalReport,
    getPatientReports,
    getMedicalReportById,
    updateMedicalReport,
    deleteMedicalReport,
    getAllPatientReportsBySearch
} = require("../controllers/medicalReport.controller");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Search patients (admin only)
router.get("/search/patients", roleMiddleware("admin"), searchPatients);

// Get patient details
router.get("/patient/:patientId/details", getPatientDetails);

// Upload medical report (admin only)
router.post("/upload", roleMiddleware("admin"), uploadMedicalReport);

// Get patient's reports (patient can view own, admin can view all)
router.get("/patient/:patientId", getPatientReports);

// Get single medical report
router.get("/:reportId", getMedicalReportById);

// Update medical report (admin only)
router.put("/:reportId", roleMiddleware("admin"), updateMedicalReport);

// Delete medical report (admin only)
router.delete("/:reportId", roleMiddleware("admin"), deleteMedicalReport);

// Search all patient reports (admin only)
router.get("/search/all", roleMiddleware("admin"), getAllPatientReportsBySearch);

module.exports = router;
