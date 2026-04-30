const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["patient", "doctor", "admin"],
            default: "patient",
        },
        phone: {
            type: String,
            validate: {
                validator: function (value) {
                    return !value || /^\d{10}$/.test(value);
                },
                message: 'Phone must be exactly 10 digits.',
            },
        },
        birthday: {
            type: Date,
        },
        address: {
            type: String,
            trim: true,
        },
        profileImage: {
            type: String,
            trim: true,
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

userSchema.virtual('age').get(function () {
    if (!this.birthday) {
        return undefined;
    }

    const today = new Date();
    const birthDate = new Date(this.birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age -= 1;
    }

    return age;
});

module.exports = mongoose.model("User", userSchema);