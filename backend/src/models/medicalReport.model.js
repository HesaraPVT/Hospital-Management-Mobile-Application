const mongoose = require("mongoose");

const medicalReportSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        patientID: {
            type: String,
            required: true
        },
        reportType: {
            type: String,
            enum: ["X-ray", "ECG", "MRI", "CT scan", "Blood test", "Ultrasound", "Other"],
            required: true
        },
        scanDate: {
            type: Date,
            required: true
        },
        doctorName: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ""
        },
        reportFile: {
            type: String,
            required: true
        },
        fileType: {
            type: String,
            enum: ["pdf", "image"],
            required: true
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        isViewed: {
            type: Boolean,
            default: false
        },
        viewedAt: {
            type: Date
        }
    },
    { timestamps: true }
);

// Index for faster searches
medicalReportSchema.index({ patient: 1, createdAt: -1 });
medicalReportSchema.index({ patientID: 1 });

module.exports = mongoose.model("MedicalReport", medicalReportSchema);
