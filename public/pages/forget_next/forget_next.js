let Util = require('../../utils/util.js')
const app = getApp()

Page({
	data: {
        code: app.data.staticImg.code,
		codeText: '',
        scrollHeight: 0,
        canSendCode: false,
        sec: 60,
        logined: false
	},

	onLoad(options) {
        let self = this

        wx.getSystemInfo({
            success: function (res) {
            	self.setData({
                    scrollHeight: res.windowHeight
                })
                wx.setNavigationBarTitle({title: '忘记密码'})
            }
        })

    },
    
    onShow() {
        this.handleSendCodeTime()
    },

    handleSendCodeTime() {
        let self = this
        self.setData({
            canSendCode: false,
            sec: 59
        })
        let t = setInterval(() => {
            self.setData({
                sec: --self.data.sec
            })
            if (self.data.sec <= 0) {
                self.setData({
                    canSendCode: true,
                    sec: 0
                })
                clearInterval(t)
                return
            }
        }, 1000)
    },

    sendCode() {
        if (!this.data.canSendCode) return
        this.handleSendCodeTime()
        let store = wx.getStorageSync('app')
        Util.ajax('sendvalidate', 'post', {
            sessionid: store.sessionid,
            email: wx.getStorageSync('forget_email')
        }).then(json => {}, () => {
            wx.showModal({
                title: '提示',
                content: '验证码发送失败!',
                showCancel: false
            })
        })
    },

    handleLogin(e) {
        let self = this
      
        let store = wx.getStorageSync('app')
        if ( e.detail.value.code.trim() == '') {
            wx.showModal({
                title: '提示',
                content: '验证码不能为空！',
                showCancel: false
            })
            return 
        }

        if (self.data.logined) return
        self.data.logined = true
        wx.showLoading()

        Util.ajax('validatelogin', 'post',  {
            sessionid: store.sessionid,
            code: e.detail.value.code
        }).then(json => {
            let data = Object.assign({}, store, json)
            Util.setStorage('app', data).then(() => {
                Util.ajax('user/info', 'get', data).then(json => {
                    wx.setStorage({
                        key: 'user_info',
                        data: json
                    })
                    wx.reLaunch({
                        url: '/pages/list/list'
                    })
                }, res => {
                    wx.showModal({
                        title: '提示',
                        content: '未获取到当前用户信息',
                        showCancel: false
                    })
                })
            })

        }, res => {
            wx.showModal({
                title: '提示',
                content: res.data.msg,
                showCancel: false
            })
        }).then(() => {
            self.data.logined = false
        })
    }

})












