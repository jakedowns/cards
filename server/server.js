const http = require('http');
const fs = require('fs').promises;

const hostname = '127.0.0.1';
const port = 3090;

const ROOT = __dirname + '/../';

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
            console.error(err);
            res.statusCode = 404;
            res.end(JSON.stringify(err));
        });
}

const server = http.createServer((req, res) => {
    res = res;
    // basic routing
    switch(req.url){
        case '/':
            loadFile('client/index.html',res);
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