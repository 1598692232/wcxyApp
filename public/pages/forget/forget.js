const app = getApp()

Page({
	data: {
		email: app.data.staticImg.email,
		logo: app.data.staticImg.logo,
		emailText: '',
		emailFocus: false,
		hiddenEmailClear: true,
        scrollHeight: 0,
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
	
	handleNext() {
		wx.navigateTo({
			url: '/pages/forget_next/forget_next'
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