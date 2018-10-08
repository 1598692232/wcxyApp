//app.js
let Util = require('./utils/util.js')
let img = require('./img/index.js')

App({
  data: {
    staticImg: img
  },
  onLaunch: function (options) {
    // console.log(options,'app_options')
    wx.login({
      success: function(res) {
        if (res.code) {
            Util.setStorage('app', {
              // email: '',
              // token: '',
              // login_id: '',
              // sessionid: '',
              // host: 'https://www.uxinyue.com',
              host: 'http://www.uxinyue.com:81',
              // host: 'http://10.255.1.23:7777',
              // host: 'http://106.14.134.19',
              // host: 'http://111.231.106.53',
              // host: 'https://www.uxinyue.com',
              // host: 'http://111.231.109.140:81',
              code: res.code,
              codeSrc: '',
              // token: 'M2UwM2I1ZWFhOGE4NjU3YzJjY2I0YmNmNjViZTU1MTliMWI2Nzk1YmNkMWFlZmZiM2FiNWEyNDJkMjgxYTJjZQ==',
              // login_id: 210
            })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
 

  },
})