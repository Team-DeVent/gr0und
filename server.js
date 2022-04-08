export async function socket (io) {
    io.on("connection", (socket) => {

        socket.on('init', (data) => {
            console.log(data)
            io.emit("init", data)
        });

        socket.on('move', (data) => {
            console.log(data)
            io.emit("move", data)
        });

        socket.on('stop', (data) => {
            console.log(data)
            io.emit("stop", data)
        });

        socket.on('rotation', (data) => {
            console.log(data)
            io.emit("rotation", data)
        });
    });
}
