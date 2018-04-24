// let Util = require('../../utils/util.js')
const app = getApp()


Page({
	data: {
        scrollHeight: 0,
        realName: '',
        avatar: '',
        content: '',
        backIndex: false,
        needEmpower: false,
        tips: ''
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
        if(options.tips){
            self.setData({
                needEmpower: true
            })
        }
        if(options.tips==1) {
            self.setData({
                content: '你拒绝了授权，账号需要实名认证。请再次点击授权。',
                tips: 1
            })
        } else if (options.tips==2) {
            self.setData({
                content: '你拒绝了授权，项目分享者无法获取您的信息。请再次点击授权。',
                tips: 2
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
    },
    bindgetuserinfo() {
        let self = this
        wx.getUserInfo({
            success: function(res) {
                var userInfo = res.userInfo
                var nickName = userInfo.nickName
                var avatarUrl = userInfo.avatarUrl

                let store = wx.getStorageSync('app')
                let reqData2 = Object.assign({},{login_id:store.login_id},{token:store.token},{nick_name: nickName},{avatar: avatarUrl})
                Util.ajax('user/info', 'post', reqData2).then((data) => {
                    wx.setStorage({
                        key: 'user_info',
                        data: data
                    })
                }, res => {
                    wx.showModal({
                        title: '提示',
                        content: res.data.msg,
                        showCancel: false
                    })
                })
                if( self.data.tips==1 ){
                    wx.reLaunch({
                        url: '/pages/empower_signin/empower_signin'
                    })
                }else if( self.data.tips==2 ){
                    wx.reLaunch({
                        url: '/pages/share_list_view/share_list_view'
                    })
                }
            },
            fail() {
                wx.showModal({
                    title: '提示',
                    content: '授权失败',
                    showCancel: false
                })
            }
        })
    }
})