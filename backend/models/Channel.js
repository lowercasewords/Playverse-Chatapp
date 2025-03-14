const mongoose = require("mongoose");

const ChannelSchema = new mongoose.Schema({
    // email: { type: String, required: true, unique: true },
    // password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Channel", ChannelSchema);
