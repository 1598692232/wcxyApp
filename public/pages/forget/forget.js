const app = getApp()
const exp = new RegExp('^[\.A-Za-z0-9_-\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$'); //邮箱正则

Page({
	data: {
		email: app.data.staticImg.email,
		logo: app.data.staticImg.logo,
		clear: app.data.staticImg.clear,
		emailText: '',
		emailFocus: false,
		hiddenEmailClear: true,
		scrollHeight: 0,
		sendEmail: false
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
	
	handleNext(e) {

		// wx.navigateTo({
		// 	url: '/pages/forget_next/forget_next'
		// })

		// return
		if (e.detail.value.email.trim() == '' || !exp.test(e.detail.value.email)){
			wx.showModal({
				title: '提示',
				content: '邮箱不能为空',
				showCancel: false
			})
			return
		}
		let store = wx.getStorageSync('app')

		wx.setStorage({
			key: 'forget_email',
			data: e.detail.value.email
		})

		if(this.data.sendEmail) return
		this.setData({
			sendEmail: true
		})
		let self = this

		wx.request({
			url: store.host + '/wxapi/sendvalidate',
			data: {
				sessionid: store.sessionid,
				email: e.detail.value.email
			},
			method: 'post',
			header: {
					'content-type': 'application/json' // 默认
			},
			success(res) {
				self.setData({
					sendEmail: false
				})
				if (res.data.status == 1) {
					wx.navigateTo({
						url: '/pages/forget_next/forget_next'
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
				self.setData({
					sendEmail: false
				})
				wx.showModal({
					title: '提示',
					content: '邮箱验证码发送失败！',
					showCancel: false
				})
			}

		})

	},

	clearInput(e) {
		this.setData({
			emailText: '',
			emailFocus: true,
		})
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
		this.setData({
			emailText: e.detail.value,
		})
		this.setShowClear('emailText', 'hiddenEmailClear')
	},

	handleFocus(e) {
		this.setShowClear('emailText', 'hiddenEmailClear')
	},

	handleBlur(e) {
			this.setData({
				hiddenEmailClear: true,
			})
	}

})