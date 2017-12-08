//app.js
let Util = require('./utils/util.js')
let img = require('./img/index.js')

App({
  data: {
    staticImg: img
  },
  onLaunch: function () {
    
    Util.setStorage('app', {
      email: '',
      token: '',
      login_id: '',
      sessionid: '',
      // host: 'http://10.255.1.97:8989',
      // host: 'http://111.231.106.53',
      host: 'https://www.uxinyue.com',
      // host: 'http://111.231.109.140:81',
      code:'',
      codeSrc: ''
    })

  },
})