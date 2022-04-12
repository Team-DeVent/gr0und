let player = {

}

export async function socket (io) {
    io.on("connection", (socket) => {

        socket.emit("connected", player)
        console.log(player)


        socket.on('init', (data) => {
            player[socket.id] = {
                uuid: data.uuid,
                position: {
                    x:0,
                    y:0,
                    z:0
                }
            }
            io.emit("init", data)
        });

        socket.on('move', (data) => {
            //console.log(data)
            io.emit("move", data)
        });

        socket.on('stop', (data) => {
            console.log(data)
            player[socket.id].position = data.position
            console.log(player)
            io.emit("stop", data)
        });

        socket.on('rotation', (data) => {
            //console.log(data)
            io.emit("rotation", data)
        });
    });
}
