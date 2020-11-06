import http from 'http';

export const server: http.Server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify({ isAlive: true, name: 'Left4Dirt-Bot', fetched: new Date().toUTCString() }));
    res.end();
}).on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});