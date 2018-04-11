let Util = require('../../utils/util.js')
const app = getApp()

Page({
	data: {
		scrollHeight: 0
	},

	onLoad(options) {
        let self = this
        wx.getSystemInfo({
            success: function (res) {
            	self.setData({
                    scrollHeight: res.windowHeight
                })
                wx.setNavigationBarTitle({title: '扫码登录'})
            }
        })
    },
    scanSignin() {

    },
    scanQuit() {

    }
})