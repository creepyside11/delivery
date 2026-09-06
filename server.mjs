import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json'};
http.createServer(async(req,res)=>{try{const p=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!p.startsWith(root+path.sep))throw Error();const data=await readFile(p);res.writeHead(200,{'Content-Type':types[path.extname(p)]||'application/octet-stream'});res.end(data)}catch{res.writeHead(404);res.end('Not found')}}).listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('Game ready on port '+(process.env.PORT||3000)));
