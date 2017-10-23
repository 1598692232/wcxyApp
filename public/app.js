//app.js
let img = require('./img/index.js')

App({
  data: {
    staticImg: img
  },
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    wx.setStorage({
      key:"app",
      data: {
        email: '',
        token: '',
        login_id: '',
        sessionid: '',
        // host: 'http://10.255.1.20',
        // host: 'http://111.231.106.53',
        host: 'https://www.uxinyue.com',
        // host: 'http://111.231.109.140:81',
        code:'',
        codeSrc: ''
      }
    })
  },
  globalData: {
    userInfo: null
  }
})