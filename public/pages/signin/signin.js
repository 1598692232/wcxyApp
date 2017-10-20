const app = getApp()

const exp = new RegExp('^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$'); //邮箱正则

Page({
	data: {
		password: app.data.staticImg.password,
		email: app.data.staticImg.email,
		clear: app.data.staticImg.clear,
        logo: app.data.staticImg.logo,
        code: app.data.staticImg.code,
		emailText: '',
		passwordText: '',
		emailFocus: false,
		passwordFocus: false,
		scrollHeight: 0,
		hiddenEmailClear: true,
		hiddenPasswordClear: true,
        errMsg: '',
        hiddenErr: true,
        animationData: {},
        scrollHeight: 0,
        codeSrc: '',
        codeWidth: '',
        sessionid: ''
	},

	onLoad(options) {
        let self = this
        let store = wx.getStorageSync('app')

        wx.getSystemInfo({
            success: function (res) {
            	self.setData({
                    scrollHeight: res.windowHeight,
                    codeWidth: res.windowWidth - 100,
                    codeSrc: store.host + '/wxapi/vercode?t=' + new Date().getTime() + '&sessionid=' + options.sessionid
                })
                wx.setNavigationBarTitle({title: '登录'})
            }
        })

    },

    onShow() {
        this.animation = wx.createAnimation({
          duration: 500,
          timingFunction: "cubic-bezier(0.4, 0, 0.2, 1)"
        })
    },

    consoleLoginError(errText) {
        this.setData({
            hiddenErr: false,
            errMsg: errText
        })
        this.animation.opacity(1).step()
        this.setData({
            animationData: this.animation.export()
        })

        setTimeout(() => {
            this.animation.opacity(0).step({duration: 1000})
            this.setData({
                animationData: this.animation.export(),
            })
            setTimeout(() => {
                this.setData({
                    hiddenErr: true,
                })
            }, 1000)
        }, 2000)
    },

    getCode() {
        let store = wx.getStorageSync('app')
        this.setData({
            codeSrc: store.host + '/wxapi/vercode?t=' + new Date().getTime() + '&sessionid='+ store.sessionid
        })
    },

    handleLogin(e) {

        let self = this

        if (self.data.emailText.trim() == '' || !exp.test(self.data.emailText)) {
            self.consoleLoginError('邮箱格式不正确！！')
            return
        }

        if (self.data.passwordText.trim() == '') {
            self.consoleLoginError('请填写密码！！')
            return
        }

        // ajax处理登录，成功后存储本地信息
        // 本地存储用户信息
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, e.detail.value, {sessionid: store.sessionid})
        reqData.login_id = parseInt(reqData.login_id)
        wx.request({
            url: store.host + '/wxapi/authentication', //仅为示例，并非真实的接口地址
            data: reqData,
            header: {
                'content-type': 'application/json' // 默认值
            },
            method: 'post',
            success: function(res) {
                if (res.data.status == 1) {
                    let stores = wx.getStorageSync('app')
                    // stores.sessionId = res.data.data.sessionid
                    let newStorage = Object.assign({}, stores, res.data.data)
                    newStorage.login_id = parseInt(newStorage.login_id)
                    wx.setStorage({
                      key:"app",
                      data: newStorage
                    })


                    wx.request({
                          url: store.host + '/wxapi/user/info',
                          data: res.data.data,
                          success(res) {
                            if (res.data.status == 1) {
                                wx.setStorage({
                                    key: 'user_info',
                                    data: res.data.data
                                })

                               
                            } else {
                                wx.showModal({
                                  title: '提示',
                                  content: '未获取到当前用户信息',
                                })
                            }
                          }
                    })
                    wx.reLaunch({
                        url: '/pages/list/list?id=' + newStorage.login_id
                    })

                } else {
                    self.consoleLoginError(res.data.msg)
                    self.getCode()
                }
            }
        })

        // wx.setStorageSync('app', data)

    },

    clearInput(e) {
    	if (e.target.dataset.name == 'email') {
			this.setData({
				emailText: '',
				emailFocus: true,
			})
    	} else {
    		this.setData({
				passwordText: '',
				passwordFocus: true
			})
    	}
    },

    setShowClear(inputTextData, clearData) {
    	let o = {}

		if (this.data[inputTextData] != '') {
			o[clearData] = false
		} else {
			o[clearData] = true
		}

		this.setData(o)
    },

    handleInput(e) {
    	if (e.target.dataset.name == 'email') {
    		this.setData({
				emailText: e.detail.value,
			})
 			this.setShowClear('emailText', 'hiddenEmailClear')
    	} else {
    		this.setData({
				passwordText: e.detail.value,
			})
    		this.setShowClear('passwordText', 'hiddenPasswordClear')
    	}
    },

    handleFocus(e) {
    	if (e.target.dataset.name == 'email') {
 			this.setShowClear('emailText', 'hiddenEmailClear')
    	} else {
    		this.setShowClear('passwordText', 'hiddenPasswordClear')
    	}
    },

    handleBlur(e) {
    	if (e.target.dataset.name == 'email') {
			this.setData({
				hiddenEmailClear: true,
			})
    	} else {
    		this.setData({
				hiddenPasswordClear: true
			})
    	}
    }





})