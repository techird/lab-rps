const http = require('http');
const express = require('express');
const ws = require('ws');
const waferSession = require('wafer-node-session');
const MongoStore = require('connect-mongo')(waferSession);
const config = require('./config');

const app = express();

app.use(waferSession({
    appId: config.appId,
    appSecret: config.appSecret,
    loginPath: '/login',
    store: new MongoStore({
        url: `mongodb://${config.mongoUser}:${config.mongoPass}@${config.mongoHost}:${config.mongoPort}/${config.mongoDb}`
    })
}));

app.use('/me', (request, response, next) => {
    response.json(request.session ? request.session.userInfo : { noBody: true });
});

app.use((request, response, next) => {
    response.write('Response from express');
    response.end();
});

// 创建 HTTP Server 而不是直接使用 express 监听
const server = http.createServer(app);

// 使用 HTTP Server 创建 WebSocket 服务，使用 path 参数指定需要升级为 WebSocket 的路径
const wss = new ws.Server({ server, path: '/ws', perMessageDeflate: false });

// 监听 WebSocket 连接建立
wss.on('connection', (ws) => {
    console.log('Websocket client connected');

    // 监听客户端发来的消息
    ws.on('message', (message) => {
        console.log(`WebSocket received: ${message}`);
        ws.send(`Server: Received(${message})`);
    });

    // 监听关闭事件
    ws.on('close', (code, message) => {
        console.log(`WebSocket client closed (code: ${code}, message: ${message || 'none'})`);
    });

    // 连接后马上发送 hello 消息
    ws.send(`Server: Hello`);
});

wss.on('error', (err) => {
    console.log(err);
});

server.listen(config.serverPort);
console.log(`Server listening at http://127.0.0.1:${config.serverPort}`);