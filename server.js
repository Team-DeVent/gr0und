let player = {

}

export async function socket (io) {
    io.on("connection", (socket) => {

        socket.emit("connected", player)
        console.log(player)

        socket.on("disconnect", () => {
            try {
                console.log(socket.id);
                io.emit('remove', player[socket.id].uuid)
                delete player[socket.id]
            } catch (error) {
                console.log('error')
            }

        })


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
            try {
                console.log(data)
                player[socket.id].position = data.position
                console.log(player)
                io.emit("stop", data)
            } catch (error) {
                console.log('error')

            }

        });

        socket.on('rotation', (data) => {
            //console.log(data)
            io.emit("rotation", data)
        });
    });
}
