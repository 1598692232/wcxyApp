const app = getApp()

Page({
	data: {
        code: app.data.staticImg.code,
		codeText: '',
        scrollHeight: 0
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

})