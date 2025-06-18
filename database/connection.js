const mongoose = require("mongoose");
// Connexion MongoDB avec timeout + log success/erreur
mongoose
	.connect(process.env.MONGODB_URI, { connectTimeoutMS: 10000 })
	.then(() => console.log("Connected to the MongoDB database"))
	.catch((err) => console.error("MongoDB connection error:", err));
