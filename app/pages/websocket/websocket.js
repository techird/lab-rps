var app = getApp();
var config = app.config;

Page({
  data: {
    status: 'waiting',
    url: 'wss://' + config.host + '/ws',
    connecting: false,
    hintLine1: '完成服务器开发，',
    hintLine2: '让服务器支持 WebSocket 连接'
  },

  /**
   * WebSocket 是否已经连接
   */
  socketOpen: false,

  /**
   * 开始连接 WebSocket
   */
  connect() {
    this.setData({
      status: 'waiting',
      connecting: true,
      hintLine1: '正在连接',
      hintLine2: '...'
    });
    this.listen();
    wx.connectSocket({
      url: this.data.url
    });
  },

  /**
   * 监听 WebSocket 事件
   */
  listen() {
    wx.onSocketOpen(() => {
      this.socketOpen = true;
      this.setData({
        status: 'success',
        connecting: false,
        hintLine1: '连接成功',
        hintLine2: '现在可以通过 WebSocket 发送接收消息了'
      });
      console.info('WebSocket 已连接');
    });
    wx.onSocketMessage((message) => {
      this.setData({
        hintLine2: message.data
      });
      console.info(message.data);
    });
    wx.onSocketClose(() => {
      this.setData({
        status: 'waiting',
        hintLine1: 'WebSocket 已关闭',
        hintLine2: '点击连接重新建立 WebSocket 连接'
      });
      console.info('WebSocket 已关闭');
    });
    wx.onSocketError(() => {
      this.setData({
        status: 'warn',
        connecting: false,
        hintLine1: '发生错误',
        hintLine2: 'WebSocket 连接建立失败'
      });
      console.error('WebSocket 错误');
    });
  },

  /**
   * 发送一个包含当前时间信息的消息
   */
  send() {
    wx.sendSocketMessage({
      data: new Date().toTimeString().split(' ').shift() + '.' + (new Date().getMilliseconds())
    });
  },
  
  /**
   * 关闭 WebSocket 连接
   */
  close() {
    this.socketOpen = false;
    wx.closeSocket();
  }
});