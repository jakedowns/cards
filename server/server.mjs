import https from 'https';
import http from 'http';
import {promises as fs} from 'fs';
import {readFileSync} from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from "dotenv"
dotenv.config();
const HTTP_PORT = process.env?.HTTP_PORT ?? 80;
const WS_PORT = process.env?.WS_PORT ?? 81;
const HMR_PORT = process.env?.HMR_PORT ?? 82;
const HOSTNAME = process.env?.HOSTNAME ?? '0.0.0.0';
const SSL_CERT_PATH = process.env?.SSL_CERT_PATH ?? '../ssl/server.crt';
const SSL_KEY_PATH = process.env?.SSL_KEY_PATH ?? '../ssl/server.key';
const SSL_CA_CERT_PATH = process.env?.SSL_CA_CERT_PATH ?? '../ssl/ca.crt';
const LOCAL = process.env?.LOCAL ?? false;
const SERVER_ID = process.env?.SERVER_ID ?? 1;

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('__dirname',__dirname);

import ServerAPI from './shared/server-api.mjs';
const SERVER_API = new ServerAPI(SERVER_ID);

const hostname = HOSTNAME;
const port = HTTP_PORT;

const ROOT = __dirname + '/..';

const server_options = {
    key: readFileSync(SSL_KEY_PATH),
    cert: readFileSync(SSL_CERT_PATH),
    requestCert: false,
    rejectUnauthorized: false,
    ca: readFileSync(SSL_CA_CERT_PATH),
    // intermediate: readFileSync(SSL_INTERMEDIATE_PATH),
}; //

const loadFile = function(path,res){
    return fs.readFile(ROOT + path)
        .then(data => {
            res.statusCode = 200;
            console.log(path);
            let path_lower = path.toLowerCase();//
            if(path_lower.endsWith('.js')||path_lower.endsWith('.mjs')){
                res.setHeader('Content-Type', 'application/javascript');
            }else if(path_lower.endsWith('.html')){
                res.setHeader('Content-Type', 'text/html');
            }else if(path_lower.endsWith('.png')){
                res.setHeader('Content-Type', 'image/png');
            }else if(path_lower.endsWith('.jpg')||path_lower.endsWith('.jpeg')){
                res.setHeader('Content-Type', 'image/jpg');
            }else if(path_lower.endsWith('.fbx')){
                res.setHeader('Content-Type', 'application/octet-stream');
            }
            res.end(data);
        })
        .catch(err => {
            //console.error(err);
            res.statusCode = 404;
            res.end(JSON.stringify(err));
        });
}

if(!LOCAL){
    try{
        const http_server = http.createServer((req,res)=>{
            console.log('redirect http->https',`https://${req.headers.host}${req.url}`);
            res.writeHead(302, {
            'Location': `https://${req.headers.host}${req.url}`,
            //add other headers here...
            });
            res.end();
        });
        http_server.listen(80,hostname,()=>{
            console.log('http fallback started',hostname);
        });
    }catch(e){
        console.warn('failed to start http->https redirect server');
    }
}

const server = https.createServer(server_options,(req, res) => {
    res = res;
    // basic routing
    console.log('loading',req.url);
    if(req.url.startsWith('/api/')){
        return SERVER_API.request(req, res);
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
    // confirm startup
  console.log(`Server running at https://${hostname}:${port}/`);
});

// todo: split websocket into separate file
// Importing the required modules
import {WebSocketServer} from 'ws';

let wss = null;
server.on('upgrade', function upgrade(request, socket, head) {
    // const { pathname } = parse(request.url);
    console.log('on upgrade');
    wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request);
    });
});

// Creating a new websocket server
wss = new WebSocketServer({ noServer: true })

// TODO: rename to WorldServer
import WorldServer from './3d-client/WorldServer.mjs';
global.worldServer = new WorldServer();
global.worldServer.attachAPI_andBoot(SERVER_API);


import {
    performance
} from 'perf_hooks';

// Creating connection using websocket
wss.on("connection", ws => {
    let client_id = `client_${performance.now()}`;
    // TODO: prevent client id collisions

    // register client
    global.worldServer.onClientJoin(client_id,ws);


    // listen to client messages
    ws.on("message", data => {
        //console.log(`Client has sent us: ${data}`)
        global.worldServer.onClientMessage(client_id,data);
        //ws.send('server says thanks!');
    });


    // handle disconnects
    ws.on("close", () => {
        //console.log("the client has disconnected");
        global.worldServer.onClientLeave(client_id);
    });


    // handling client connection error
    ws.onerror = function (err) {
        //console.log("Some Error occurred")
        global.worldServer.onClientError(client_id,err);
    }
});
console.log(`The WebSocket server is running on port ${WS_PORT}`);

export default server;