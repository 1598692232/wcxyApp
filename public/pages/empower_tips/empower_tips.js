// let Util = require('../../utils/util.js')
const app = getApp()


Page({
	data: {
        scrollHeight: 0,
        realName: 'name',
        avatar: '',
        content: ''
    },
	onLoad(options) {
        console.log(options,'0000')
        let self = this
        wx.getSystemInfo({
            success(res) {
                self.setData({
                    scrollHeight: res.windowHeight ,
                    realName: wx.getStorageSync('user_info').realname?wx.getStorageSync('user_info').realname:wx.getStorageSync('empower').nickName,
                    avatar:  wx.getStorageSync('user_info').avatar?wx.getStorageSync('user_info').avatar:wx.getStorageSync('empower').avatarUrl,
                })
            }
        })
        self.setData({
            content: options.tips==1?'你拒绝了授权，账号需要实名认证。请退出并删除小程序重新进入，再次点击授权。': '你拒绝了授权，项目分享者无法获取您的信息。请退出并删除小程序重新进入，再次点击授权。'
        })
        wx.setNavigationBarTitle({title: '授权失败'})
    }
})