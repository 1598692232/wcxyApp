//app.js
let Util = require('./utils/util.js')
let img = require('./img/index.js')

App({
  data: {
    staticImg: img
  },
  onLaunch: function () {
    // console.log(wx.getStorageSync('app'), 'local')
    wx.login({
      success: function(res) {
        if (res.code) {
            Util.setStorage('app', {
              // email: '',
              // token: '',
              // login_id: '',
              // sessionid: '',
              // host: 'http://10.255.1.28:8989',
              // host: 'http://111.231.106.53',
              host: 'https://www.uxinyue.com',
              // host: 'http://111.231.109.140:81',
              code: res.code,
              codeSrc: ''
            })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
 

  },
})