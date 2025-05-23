const sockets = async (io, socket) => {

    // question en dur qui sera remplacé plus tard
    socket.on("question", (data) => {
        setTimeout(() => {
            io.emit("game-cycle", data)
        }, 500);
    })

    // lancement de la partie par l'admin
    socket.on("start-game", (roomID) => {
        setTimeout(() => {
            io.to(roomID).emit("lets-go")
        }, 500);
    })

    // MàJ du nom du joueur
    socket.on("playerUpdate", (roomID) => {
        setTimeout(() => {
            io.to(roomID).emit("playerUpdate")
        }, 500);
    })
};

module.exports = sockets;
