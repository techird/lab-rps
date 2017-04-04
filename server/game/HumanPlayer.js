const Player = require('./Player');
const Tunnel = require('./Tunnel');

/**
 * 人类玩家实现，通过 WebSocket 信道接收和发送消息
 */
module.exports = class HumanPlayer extends Player {
    constructor(user, ws) {
        super(user);
        this.ws = ws;
        this.tunnel = new Tunnel(ws);
        this.send('id', user);
    }

    /**
     * 人类玩家上线后，还需要监听信道关闭，让玩家下线
     */
    online(room) {
        const onlinePromise = super.online(room);
        this.ws.on('close', () => this.offline());
        return onlinePromise;
    }

    /**
     * 下线后关闭信道
     */
    offline() {
        super.offline();
        if (this.ws && this.ws.readyState == this.ws.OPEN) {
            this.ws.close();
        }
        this.ws = null;
        this.tunnel = null;
    }

    /**
     * 通过 WebSocket 信道发送消息给玩家
     */
    send(message, data) {
        this.tunnel.emit(message, data);
    }

    /**
     * 从 WebSocket 信道接收玩家的消息
     */
    receive(message, callback) {
        this.tunnel.on(message, callback);
    }
}