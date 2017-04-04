const EventEmitter = require('events');
const Player = require('./Player');

let nextRobotId = 0;

// 等待多久之后增加机器人，单位秒
const TIME_TO_ADD_ROBOT = 1;

/**
 * 机器人玩家实现，使用 EventEmitter 接收和发送消息
 */
module.exports = class ComputerPlayer extends Player {
    /**
     * 指定时间后，房间还没满，自动加入
     */
    static autoJoin(room) {
        setTimeout(() => {
            if (room.isFull()) {
                return;
            }
            const cup = new ComputerPlayer();
            cup.online(room);
            cup.simulate();
        }, TIME_TO_ADD_ROBOT * 1000);
    }

    constructor() {
        const robotId = `robot-${++nextRobotId}`;
        super({
            uid: robotId,
            uname: robotId,
            uavatar: 'http://www.scoutiegirl.com/wp-content/uploads/2015/06/Blue-Robot.png'
        });
        this.emitter = new EventEmitter();
    }

    /**
     * 模拟玩家行为
     */
    simulate() {
        this.receive('start', () => this.play());
        this.receive('result', () => this.stop());
        this.send('join');
    }

    /**
     * 游戏开始后，随机时间后随机选择
     */
    play() {
        this.playing = true;
        const randomTime = () => Math.floor(100 + Math.random() * 2000);
        const randomChoice = () => {
            if (!this.playing) return;
            this.send("choice", {
                choice: Math.floor(Math.random() * 10000) % 3 + 1
            });
            setTimeout(randomChoice, randomTime());
        }
        setTimeout(randomChoice, 10);
    }

    /**
     * 游戏结束后，标记起来，阻止继续随机选择
     */
    stop() {
        this.playing = false;
    }

    /**
     * 发送消息给当前玩家，直接转发到 emitter
     */
    send(message, data) {
        this.emitter.emit(message, data);
    }

    /**
     * 从当前的 emitter 处理消息
     */
    receive(message, handle) {
        this.emitter.on(message, handle);
    }
}