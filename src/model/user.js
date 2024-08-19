import { Schema, model } from "mongoose";

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'standard'], default: 'standard' },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

const User = model("user", userSchema);

export default User;
