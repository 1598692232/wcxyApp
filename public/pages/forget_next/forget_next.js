const app = getApp()

Page({
	data: {
        code: app.data.staticImg.code,
		codeText: '',
        scrollHeight: 0,
        canSendCode: false,
        sec: 60,
	},

	onLoad(options) {
        let self = this

        wx.getSystemInfo({
            success: function (res) {
            	self.setData({
                    scrollHeight: res.windowHeight
                })
                wx.setNavigationBarTitle({title: '登录'})
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
        wx.request({
			url: store.host + '/wxapi/sendvalidate',
			data: {
				sessionid: store.sessionid,
				email: wx.getStorageSync('forget_email')
			},
			method: 'post',
			header: {
                'content-type': 'application/json' // 默认
			},
            success(res) {

                if (res.data.status == 1) {
                    let store = wx.getStorageSync('app')
                    let data = Object.assign({}, store, res.data.data)
                     //如果已经登录，设置storage，初始化列表页
                     wx.setStorage({
                        key:"app",
                        data: data,
                        success() {
                            wx.request({
                                url: store.host + '/wxapi/user/info',
                                data: res.data,
                                success(res) {
                                      if (res.data.status == 1) {
                                          wx.setStorage({
                                              key: 'user_info',
                                              data: res.data.data
                                          })
                                          wx.reLaunch({
                                              url: '/pages/list/list?sessionid=' + sessionid
                                          })
                                      } else {
                                          wx.showModal({
                                            title: '提示',
                                            content: '未获取到当前用户信息',
                                            showCancel: false
                                          })
                                      }
                                }
                            })
                        }
                    })
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.data.msg,
                        showCancel: false
                    })
                }

            },


            fail() {
                wx.showModal({
                    title: '提示',
                    content: '登录失败！',
                    showCancel: false
                })
            }
        })
    },

    handleLogin(e) {
        let store = wx.getStorageSync('app')
        if ( e.detail.value.code.trim() == '') {
            wx.showModal({
                title: '提示',
                content: '验证码不能为空！',
                showCancel: false
            })
            return 
        }

        wx.request({
			url: store.host + '/wxapi/validatelogin',
			data: {
                sessionid: store.sessionid,
                code: e.detail.value.code
			},
			method: 'post',
			header: {
                'content-type': 'application/json' // 默认
			},
			success(res) {
                if (res.data.status == 1) {
                    let data = Object.assign({}, store, res.data.data)
                    wx.setStorage({
                        key:"app",
                        data: data,
                        success() {
                            wx.request({
                                url: store.host + '/wxapi/user/info',
                                data: data,
                                success(res) {
                                    if (res.data.status == 1) {
                                        wx.setStorage({
                                            key: 'user_info',
                                            data: res.data.data
                                        })
                                        wx.reLaunch({
                                            url: '/pages/list/list?sessionid=' + data.sessionid
                                        })
                                    } else {
                                        wx.showModal({
                                        title: '提示',
                                        content: '未获取到当前用户信息',
                                        showCancel: false
                                        })
                                    }
                                }
                              })
                        }
                    })

                } else {

                    wx.showModal({
						title: '提示',
						content: res.data.msg,
						showCancel: false
					})
                }
            },
            fail() {
				wx.showModal({
					title: '提示',
					content: '登录失败！',
					showCancel: false
				})
			}
        })
    }

})