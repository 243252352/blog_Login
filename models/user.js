const { Schema, model } = require("mongoose");
const { createTokenForUser } = require("../services/authentication");
const { createHmac, randomBytes } = require("crypto");

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
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

// ✅ Correct way to define static method
userSchema.statics.MatchPasswordandGenerateToken = async function (email, plainPassword) {
    const user = await this.findOne({ email });
    if (!user) return false;

    const userProvidedHash = createHmac("sha256", user.salt)
        .update(plainPassword)
        .digest("hex");

    if (userProvidedHash !== user.password) {
        throw new Error("Incorrect password");
    }

    const token = createTokenForUser(user);
    return token;
};

const User = model("User", userSchema);  // ✅ using model()

module.exports = User;
