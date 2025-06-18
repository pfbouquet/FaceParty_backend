// Import modèle User et exporte dans un objet db
const db = {
	users: require("./models/User"),
};

module.exports = { db };
