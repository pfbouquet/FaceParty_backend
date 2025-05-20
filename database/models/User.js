const mongoose = require("mongoose");

const schema = new mongoose.Schema({
	name: { type: String, required: true, unique: true },
	// email: { type: String, required: true, unique: true },
	// password: { type: String, required: true },
});

module.exports = mongoose.models.users || mongoose.model("users", schema);
