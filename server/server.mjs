import http from 'http';
import {promises as fs} from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('__dirname',__dirname);

import ServerAPI from './server-api.mjs';
const SERVER_API = new ServerAPI();

const hostname = '0.0.0.0'// '127.0.0.1';
const port = 3090;

const ROOT = __dirname + '/..';

const loadFile = function(path,res){
    return fs.readFile(ROOT + path)
        .then(data => {
            res.statusCode = 200;
            console.log(path);
            if(path.endsWith('.js')||path.endsWith('.mjs')){
                res.setHeader('Content-Type', 'application/javascript');
            }else if(path.endsWith('.html')){
                res.setHeader('Content-Type', 'text/html');
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
            loadFile('/client/index.html',res);
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
const WS_PORT = 8083;
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

    game.onClientJoin(client_id,ws);
    // sending message
    ws.on("message", data => {
        console.log(`Client has sent us: ${data}`)
        game.onClientMessage(client_id,data);
        ws.send('server says thanks!');
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