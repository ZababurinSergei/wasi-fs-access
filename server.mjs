import express from 'express';
import cors from "cors";
import Enqueue from "express-enqueue";
import compression from "compression";
import corsOptions from './config/cors/index.mjs';
import shouldCompress from './config/compression/index.mjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __page = path.join(dirname(fileURLToPath(import.meta.url)), '/');
const __dirname = path.join(path.dirname(process.argv[1]), './');
import notFound from './config/page_not_found/index.mjs';
import YAML from 'yaml';
import proxy from "express-http-proxy";

const app = express();

app.use(await express.json());
app.use(await compression({ filter: shouldCompress }));
app.use(await cors({ credentials: true }));

const queue = new Enqueue({
    concurrentWorkers: 4,
    maxSize: 200,
    timeout: 30000
});

app.use(queue.getMiddleware());

app.use((req, res, next) => {
    console.log(`namespace: ${req.path}`);
    next();
});


console.log('======== root ========', {
    'page': __page,
    'dirname': path.join(__dirname)
})

const file = fs.readFileSync(path.join(__dirname, `config.namespace.yml`), 'utf8');
const config = YAML.parse(file);

console.log('======== config ========', {
    'config': config,
})
// pathNode.api.some(path => req.path.includes(path, 0))
// app.use(proxy(config.proxy.url,  {
//     limit: '5mb',
//     filter: (req) => {
//         return false
//     }
// }));
app.use('/node', express.static(__dirname + 'node'));
app.use('/modules', express.static(__dirname + 'modules'));
app.use('/static', express.static(__dirname + 'static'));
app.use('/service', express.static(__dirname + 'service'));
app.use('/worker', express.static(__dirname + 'worker'));
app.use('/tests', express.static(__dirname + 'tests'));

for(let item of config.scope) {
    for(let page of item.scope) {
        console.log(`${item.namespace} :`, {
            'index': path.join(__page, `${item.namespace}${page}`),
            'assets': path.join(__page, `${item.namespace}${page}/assets`),
            'manifest': path.join(__page, `${item.namespace}${page}/manifest`),
            'path': `/${item.namespace !== 'io'? item.namespace: ''}`,
            'type': `${item.type.toLowerCase() === 'spa' ? `/${item.namespace !== 'io'? item.namespace: ''}/*`: 'mvp'}`
        });
        app.use(`/${item.namespace !== 'io'? item.namespace: ''}`, express.static(path.join(__page, `${item.namespace}${page}`)));
        app.use(`/${item.namespace !== 'io'? item.namespace: ''}`, express.static(path.join(__page, `${item.namespace}${page}/interface`)));
        app.use(`/${item.namespace !== 'io'? item.namespace: ''}`, express.static(path.join(__page, `${item.namespace}${page}/modules`)));
        app.use(`/${item.namespace !== 'io'? item.namespace: ''}`, express.static(path.join(__page, `${item.namespace}${page}/manifest`)));

        if(item.type.toLowerCase() === 'spa') {
            app.options(`/${item.namespace !== 'io'? item.namespace: ''}/*`, await cors(corsOptions))
            app.get(`/${item.namespace !== 'io'? item.namespace: ''}/*`, async (req, res) => {
                res.sendFile(path.join(`${__page}${item.namespace}${item.scope}`, '/index.html'));
            })
        }
    }
}

app.use(queue.getErrorMiddleware())

export default app
