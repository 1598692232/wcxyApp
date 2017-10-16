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
              code: res.code,
              codeSrc: ''
            }
          })

          // 用于开发环境测试
          // wx.setStorage({
          //   key:"app",
          //   data:{
          //     host: 'http://10.255.1.76',
          //     '3rd_session':"7b02ce75b8c256b78fbd140b3b12ed85933898f5042b50d85950967a3e55b264",
          //     login_id:37,
          //     openid:"ozOIQ0UTvqCT0KmHMwU3Gr96-XwI",
          //     sessionid:"a30ffe6b7b4360b276ca49cfdaf847ecd7cb2dee",
          //     token:"ZmEyYTIxYmM5OTQ1ZGFiNDUzNzJkMjhhMDI5OWY3NDNhNmQ1MjQ1NjczZTk0NzI1NWNjNTdjZGNkNjE0Y2M2Mw==",
          //   }
          // })
          ///////////////////

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