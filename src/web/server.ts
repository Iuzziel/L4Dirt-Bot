import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';

export const server: http.Server = http.createServer((req, res) => {
    if (!req.url) return res.end();

    const parsedUrl = url.parse(req.url);
    console.log(parsedUrl.pathname);
    if (!parsedUrl.pathname) return res.end();

    if (parsedUrl.pathname === "/api/status") {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ isAlive: true, name: 'Left4Dirt-Bot', fetched: new Date().toUTCString() }));
    } else {
        const sanitizedPath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
        let pathname = path.join(path.resolve(__dirname, '../../static'), sanitizedPath);
        pathname = (pathname === '' || pathname === '/') ? 'index.html' : pathname;
        if (!fs.existsSync(pathname)) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Page not found!` }));
        } else {
            fs.readFile(pathname, (err, data) => {
                if (err) {
                    res.statusCode = 500;
                    res.end(`Error in getting the file.`);
                } else {
                    const ext = path.parse(pathname).ext;
                    res.setHeader('Content-type', mimeType[ext] || 'text/plain');
                    res.end(data);
                }
            });
        }
    }
}).on('clientError', (err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

const mimeType: any = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.eot': 'appliaction/vnd.ms-fontobject',
    '.ttf': 'aplication/font-sfnt'
};