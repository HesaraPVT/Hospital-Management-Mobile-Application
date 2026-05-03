const MedicalReport = require("../models/medicalReport.model");
const User = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");

// Search patients by Patient ID, name, phone, or NIC
exports.searchPatients = asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query || query.trim() === "") {
        return res.status(400).json({ message: "Search query is required" });
    }

    const searchQuery = {
        role: "patient",
        $or: [
            { patientID: new RegExp(query, "i") },
            { name: new RegExp(query, "i") },
            { phone: new RegExp(query, "i") },
            { nic: new RegExp(query, "i") }
        ]
    };

    const patients = await User.find(searchQuery).select(
        "name email phone profileImage patientID nic dateOfBirth"
    ).limit(20);

    res.status(200).json(patients);
});

// Get patient details
exports.getPatientDetails = asyncHandler(async (req, res) => {
    const { patientId } = req.params;

    const patient = await User.findById(patientId).select(
        "name email phone address profileImage patientID nic dateOfBirth"
    );

    if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
    }

    if (patient.role !== "patient") {
        return res.status(400).json({ message: "User is not a patient" });
    }

    res.status(200).json(patient);
});

// Upload medical report
exports.uploadMedicalReport = asyncHandler(async (req, res) => {
    const { patientId, reportType, scanDate, doctorName, description, reportFile, fileType } = req.body;

    // Validate required fields
    if (!patientId || !reportType || !scanDate || !doctorName || !reportFile || !fileType) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== "patient") {
        return res.status(404).json({ message: "Patient not found" });
    }

    // Create medical report
    const medicalReport = new MedicalReport({
        patient: patientId,
        patientID: patient.patientID,
        reportType,
        scanDate,
        doctorName,
        description: description || "",
        reportFile,
        fileType,
        uploadedBy: req.user._id
    });

    await medicalReport.save();

    // Populate references
    await medicalReport.populate([
        { path: "patient", select: "name email phone profileImage" },
        { path: "uploadedBy", select: "name email" }
    ]);

    res.status(201).json(medicalReport);
});

// Get patient's reports
exports.getPatientReports = asyncHandler(async (req, res) => {
    const { patientId } = req.params;

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== "patient") {
        return res.status(404).json({ message: "Patient not found" });
    }

    // Check permissions - patient can only view their own reports
    if (req.user.role === "patient" && req.user._id.toString() !== patientId) {
        return res.status(403).json({ message: "Forbidden: cannot access other patient's reports" });
    }

    const reports = await MedicalReport.find({ patient: patientId })
        .populate("uploadedBy", "name email")
        .sort({ createdAt: -1 });

    res.status(200).json(reports);
});

// Get single medical report
exports.getMedicalReportById = asyncHandler(async (req, res) => {
    const { reportId } = req.params;

    const report = await MedicalReport.findById(reportId)
        .populate("patient", "name email phone profileImage")
        .populate("uploadedBy", "name email");

    if (!report) {
        return res.status(404).json({ message: "Report not found" });
    }

    // Check permissions
    const isPatient = report.patient._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isPatient && !isAdmin) {
        return res.status(403).json({ message: "Forbidden: cannot access this report" });
    }

    // Mark as viewed if patient is accessing
    if (isPatient && !report.isViewed) {
        report.isViewed = true;
        report.viewedAt = new Date();
        await report.save();
    }

    res.status(200).json(report);
});

// Update medical report details
exports.updateMedicalReport = asyncHandler(async (req, res) => {
    const { reportId } = req.params;
    const { reportType, scanDate, doctorName, description, reportFile, fileType } = req.body;

    // Only admin can update reports
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: only admin can update reports" });
    }

    const report = await MedicalReport.findById(reportId);
    if (!report) {
        return res.status(404).json({ message: "Report not found" });
    }

    // Update fields
    if (reportType) report.reportType = reportType;
    if (scanDate) report.scanDate = scanDate;
    if (doctorName) report.doctorName = doctorName;
    if (description !== undefined) report.description = description;
    if (reportFile) report.reportFile = reportFile;
    if (fileType) report.fileType = fileType;

    await report.save();

    await report.populate([
        { path: "patient", select: "name email phone profileImage" },
        { path: "uploadedBy", select: "name email" }
    ]);

    res.status(200).json(report);
});

// Delete medical report
exports.deleteMedicalReport = asyncHandler(async (req, res) => {
    const { reportId } = req.params;

    // Only admin can delete reports
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: only admin can delete reports" });
    }

    const report = await MedicalReport.findByIdAndDelete(reportId);
    if (!report) {
        return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({ message: "Report deleted successfully" });
});

// Get all patient reports by search criteria
exports.getAllPatientReportsBySearch = asyncHandler(async (req, res) => {
    // Only admin can search all reports
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: only admin can search patient reports" });
    }

    const { patientID, patientName, phone, nic } = req.query;

    let query = {};

    if (patientID) {
        query.patientID = new RegExp(patientID, "i");
    }

    if (patientName || phone || nic) {
        // Search patients first
        const patientQuery = {};
        if (patientName) patientQuery.name = new RegExp(patientName, "i");
        if (phone) patientQuery.phone = new RegExp(phone, "i");
        if (nic) patientQuery.nic = new RegExp(nic, "i");

        const patients = await User.find({ ...patientQuery, role: "patient" }).select("_id");
        const patientIds = patients.map(p => p._id);

        if (patientIds.length === 0) {
            return res.status(200).json([]);
        }

        query.patient = { $in: patientIds };
    }

    const reports = await MedicalReport.find(query)
        .populate("patient", "name email phone profileImage patientID nic dateOfBirth")
        .populate("uploadedBy", "name email")
        .sort({ createdAt: -1 });

    res.status(200).json(reports);
});
