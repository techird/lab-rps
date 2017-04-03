const express = require('express');
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

app.listen(config.serverPort);
console.log(`Server listening at http://127.0.0.1:${config.serverPort}`);