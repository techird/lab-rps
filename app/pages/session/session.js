var mps = require('../../vendors/wafer-client-sdk/index');
var app = getApp();
var config = app.config;

mps.setLoginUrl(`https://` + config.host + '/login');

Page({
  data: {
    status: 'waiting',
    url: 'https://' + config.host + '/me',
    requesting: false,
    hintLine1: '完成服务器开发，',
    hintLine2: '让服务器可以识别小程序会话'
  },
  request() {
    this.setData({
      requesting: true,
      status: 'waiting',
      hintLine1: '正在发送',
      hintLine2: '...'
    });
    mps.request({
      login: true,
      url: this.data.url,
      method: 'GET',
      success: (res) => {
        if (+res.statusCode == 200) {
          if (res.data.openId) {
            this.setData({
              status: 'success',
              hintLine1: '成功获取会话',
              hintLine2: res.data.nickName,
              avatarUrl: res.data.avatarUrl
            });
          } else {
            this.setData({
              status: 'warn',
              hintLine1: '会话获取失败',
              hintLine2: '未获取到 openId'
            });
            console.error('会话获取失败', res.data);
          }
        } else {
          this.setData({
            status: 'warn',
            hintLine1: '响应错误',
            hintLine2: '响应码：' + res.statusCode
          });
        }
      },
      fail: (res) => {
        console.log(res);
        this.setData({
          status: 'fail'
        });
      },
      complete: () => {
        this.setData({
          requesting: false
        });
      }
    });
  }
});