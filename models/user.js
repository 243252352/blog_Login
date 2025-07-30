const { Schema, model } = require("mongoose");
const { createTokenForUser } = require("../services/authentication");
const { createHmac, randomBytes } = require("crypto");

const userSchema = new Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    salt: { type: String, required: true },
    password: { type: String, required: true },
    profileImageURL: { type: String, default: "/image/default.png" },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
}, { timestamps: true });

userSchema.pre("save", function (next) {
    if (!this.isModified("password")) return next();
    const salt = randomBytes(16).toString("hex");
    const hashed = createHmac("sha256", salt).update(this.password).digest("hex");
    this.salt = salt;
    this.password = hashed;
    next();
});

userSchema.statics.matchPasswordAndGenerateToken = async function (email, plainPassword) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("User not found");

    const hashed = createHmac("sha256", user.salt).update(plainPassword).digest("hex");
    if (hashed !== user.password) throw new Error("Invalid password");

    const token = createTokenForUser(user);
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.salt;

    return token;
};

module.exports = model("User", userSchema);
