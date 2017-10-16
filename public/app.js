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

    wx.login({
      success: function(res) {
        console.log(res)
        if (res.code) {

          wx.setStorage({
            key:"app",
            data: {
              email: '',
              token: '',
              loginId: '',
              sessionid: '',
              host: 'http://10.255.1.76',
              code: res.code
            }
          })
          //发起网络请求
          wx.request({
            url: 'http://10.255.1.76/wxapi/init',
            data: {
              code: res.code,
              appid: 'wx97c95abd0c52aaa9',
              secret: '68e4da8144a28c05e057964b209f91dc',
              // grant_type: ' authorization_code'
            },
            success(res) {
                console.log(res, 887766)
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
    

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                  this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null
  }
})