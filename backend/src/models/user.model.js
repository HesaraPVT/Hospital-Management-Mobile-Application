const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["patient", "doctor", "admin"],
            default: "patient"
        },
        phone: {
            type: String
        },
        address: {
            type: String
        },
        profileImage: {
            type: String
        },
        patientID: {
            type: String,
            unique: true,
            sparse: true
        },
        nic: {
            type: String,
            sparse: true
        },
        dateOfBirth: {
            type: Date,
            sparse: true
        }
    },
    { timestamps: true }
);

// Generate unique Patient ID for patients during registration
userSchema.pre("save", async function () {
    if (this.role === "patient" && !this.patientID) {
        let patientID;
        let exists = true;
        while (exists) {
            patientID = "PAT-" + crypto.randomBytes(6).toString("hex").toUpperCase();
            const found = await mongoose.model("User").findOne({ patientID });
            exists = !!found;
        }
        this.patientID = patientID;
    }
});

module.exports = mongoose.model("User", userSchema);