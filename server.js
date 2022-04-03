export async function socket (io) {
    io.on("connection", (socket) => {
        socket.on('move', (data) => {
            io.emit("move", data)
        });
    });
}
