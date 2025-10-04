import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  prn: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  branch: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    enum: ["FE", "SE", "TE", "BE"],
    required: true,
  },
  role: {
    type: String,
    enum: ["Member", "Coordinator", "Club Head"],
    default: "Member",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Admin who created this member
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Member", memberSchema);
