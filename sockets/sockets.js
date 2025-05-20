const sockets = async (io, socket) => {
  
  // Écoute du socket via l'identifier "helloMessage"
  socket.on("helloMessage", (data, callback) => {
    console.log("Data from front : ", data); // Réception de la data envoyée par le front : { message: "Hello world from the front" }
    callback("Hello back from the server"); // Retourne une réponse au front : "Hello back from the server"
  });
  
};

module.exports = sockets;
