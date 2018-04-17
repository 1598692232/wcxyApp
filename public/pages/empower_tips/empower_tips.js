// let Util = require('../../utils/util.js')
const app = getApp()


Page({
	data: {
        scrollHeight: 0,
        realName: 'name',
        avatar: '',
        content: '',
        backIndex: false
    },
	onLoad(options) {
        console.log(options,'options')
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
        if(options.tips==1) {
            self.setData({
                content: '你拒绝了授权，账号需要实名认证。请退出并删除小程序重新进入，再次点击授权。'
            })
        } else if (options.tips==2) {
            self.setData({
                content: '你拒绝了授权，项目分享者无法获取您的信息。请退出并删除小程序重新进入，再次点击授权。'
            })
        } else if (options.sign==1) {
            self.setData({
                content: '恭喜您，登录成功！',
                backIndex: true
            })
        } else if (options.sign ==2) {
            self.setData({
                content: '登录失败，请重新扫码进行登录！',
                backIndex: true
            })
        }
        let title = options.tips?'授权失败':'登录'
        wx.setNavigationBarTitle({title: title})
    },
    backIndex() {
        wx.reLaunch({
            url: '/pages/empower_signin/empower_signin'
        })
    }
})