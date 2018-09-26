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
              // host: 'http://www.uxinyue.com:81',
              // host: 'http://10.255.1.23:7777',
              // host: 'http://106.14.134.19',
              // host: 'http://111.231.106.53',
              host: 'https://www.uxinyue.com',
              // host: 'http://111.231.109.140:81',
              code: res.code,
              codeSrc: '',
              // token: 'MzA4ZmQ5ZjViYzI4YzkzZjhkZGY5OWEzNzZlMDRjMTQ5OGQyNDhlNjU2M2I1ZDRlOTFmYjNlOWIwN2RjNGFjMA==',
              // login_id: 210
            })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
 

  },
})