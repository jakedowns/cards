import http from 'http';
import {promises as fs} from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from "dotenv"
dotenv.config();
const HTTP_PORT = process.env?.HTTP_PORT ?? 80;
const WS_PORT = process.env?.WS_PORT ?? 81;
const HOSTNAME = process.env?.HOSTNAME ?? '0.0.0.0';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('__dirname',__dirname);

import ServerAPI from './server-api.mjs';
const SERVER_API = new ServerAPI();

const hostname = HOSTNAME;
const port = HTTP_PORT;

const ROOT = __dirname + '/..';

const loadFile = function(path,res){
    return fs.readFile(ROOT + path)
        .then(data => {
            res.statusCode = 200;
            console.log(path);
            let path_lower = path.toLowerCase();
            if(path_lower.endsWith('.js')||path_lower.endsWith('.mjs')){
                res.setHeader('Content-Type', 'application/javascript');
            }else if(path_lower.endsWith('.html')){
                res.setHeader('Content-Type', 'text/html');
            }else if(path_lower.endsWith('.png')){
                res.setHeader('Content-Type', 'image/png');
            }else if(path_lower.endsWith('.jpg')||path_lower.endsWith('.jpeg')){
                res.setHeader('Content-Type', 'image/jpg');
            }
            res.end(data);
        })
        .catch(err => {
            //console.error(err);
            res.statusCode = 404;
            res.end(JSON.stringify(err));
        });
}

const server = http.createServer((req, res) => {
    res = res;
    // basic routing
    console.log('loading',req.url);
    if(req.url.startsWith('/api/')){
        SERVER_API.request(req, res);
        return
    }
    switch(req.url){
        case '/':
            // loadFile('/client/index.html',res); // index 2d
            loadFile('/public/index.html',res); // index 3d
            break;

        default:
            // static asseets
            loadFile(req.url,res);
            break;
    }

});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

// todo: split websocket into separate file
// Importing the required modules
import {WebSocketServer} from 'ws';

// Creating a new websocket server
const wss = new WebSocketServer({ port: WS_PORT })

import ServerGame from './server-game.mjs';
const game = new ServerGame();

import {
    performance
} from 'perf_hooks';

// Creating connection using websocket
wss.on("connection", ws => {
    let client_id = `client_${performance.now()}`;
    // TODO: prevent client id collisions

    game.onClientJoin(client_id,ws);
    // sending message
    ws.on("message", data => {
        //console.log(`Client has sent us: ${data}`)
        game.onClientMessage(client_id,data);
        //ws.send('server says thanks!');
    });
    // handling what to do when clients disconnects from server
    ws.on("close", () => {
        //console.log("the client has disconnected");
        game.onClientLeave(client_id);
    });
    // handling client connection error
    ws.onerror = function (err) {
        //console.log("Some Error occurred")
        game.onClientError(client_id,err);
    }
});
console.log(`The WebSocket server is running on port ${WS_PORT}`);

export default server;