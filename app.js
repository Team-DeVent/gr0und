import express from 'express';

import * as loaderExpress from './loaders/express.js';
import * as loaderSocket from './loaders/socket.js';
import * as serverSocket from './server.js';


async function startExpressServer() {
    const app = express();
  
    await loaderExpress.init(app);
  
    return app.listen(9007, err => {
        console.log(`[ + ] The server is running.`);
    });
}

async function startSocketServer(server) {
  
    let io = await loaderSocket.init(server);
    await serverSocket.socket(io)
}
    
let server = await startExpressServer();
if (process.env.NODE_ENV != "nonrealtime") {
    console.log("[ + ] enable realtime")
    let io_server = await startSocketServer(server);
}

export { server }