const mongoose = require("mongoose");

const schema = new mongoose.Schema({
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
});

module.exports = mongoose.models.users || mongoose.model("users", schema);
