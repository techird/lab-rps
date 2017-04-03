const http = require('http');
const express = require('express');
const ws = require('ws');
const waferSession = require('wafer-node-session');
const MongoStore = require('connect-mongo')(waferSession);
const config = require('./config');

const app = express();

// 独立出会话中间件给 express 和 ws 使用
const sessionMiddleware = waferSession({
    appId: config.appId,
    appSecret: config.appSecret,
    loginPath: '/login',
    store: new MongoStore({
        url: `mongodb://${config.mongoUser}:${config.mongoPass}@${config.mongoHost}:${config.mongoPort}/${config.mongoDb}`
    })
});
app.use(sessionMiddleware);

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
    // 要升级到 WebSocket 协议的 HTTP 连接
    const request = ws.upgradeReq;

    // 被升级到 WebSocket 的请求不会被 express 处理，
    // 需要使用会话中间节获取会话
    sessionMiddleware(request, null, () => {
        const session = request.session;
        if (!session) {
            // 没有获取到会话，强制断开 WebSocket 连接
            ws.send(JSON.stringify(request.sessionError) || "No session avaliable");
            ws.close();
            return;
        }

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

        // 连接后马上发送 hello 消息给会话对应的用户
        ws.send(`Server: 恭喜，${session.userInfo.nickName}`);
    });
});

wss.on('error', (err) => {
    console.log(err);
});

server.listen(config.serverPort);
console.log(`Server listening at http://127.0.0.1:${config.serverPort}`);