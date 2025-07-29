const mongoose = require("mongoose");
const { Schema } = mongoose;
const { createHmac, randomBytes } = require("crypto");

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, // ensures no duplicates
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageURL: {
        type: String,
        default: '/image/default.png',
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    }
}, { timestamps: true });

userSchema.pre('save', function (next) {
    const user = this;

    if (!user.isModified("password")) return next();

    const salt = randomBytes(16).toString('hex');
    const hashedPass = createHmac("sha256", salt)
        .update(user.password)
        .digest("hex");

    user.salt = salt;
    user.password = hashedPass;

    next();
});

userSchema.statics.matchPassword = async function (email, plainPassword) {
    const user = await this.findOne({ email });
    if (!user) return false;

    const userProvidedHash = createHmac("sha256", user.salt)
        .update(plainPassword)
        .digest("hex");

    if (userProvidedHash === user.password) {
        const { password, salt, ...safeUser } = user.toObject();
        return safeUser;
    }

    return false;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
