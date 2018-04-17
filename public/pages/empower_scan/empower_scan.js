let Util = require('../../utils/util.js')
const app = getApp()

Page({
	data: {
        scrollHeight: 0,
        scene: ''
    },
    onShow() {
       
    },

	onLoad(options) {
        this.setData({
            scene: decodeURIComponent(options.scene).split('=')[1]
        })
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
        let self = this
        let store = wx.getStorageSync('app')
        let empowers = wx.getStorageSync('user_info')
        let reqData = Object.assign({}, {scene_id: self.data.scene},{code: store.code})
        Util.ajax('auth/login', 'post', reqData).then(json => {
            if(json.realname == false) {
                wx.getUserInfo({
                    withCredentials: true,
                    success: function(res) {
                        var userInfo = res.userInfo
                        var nickName = userInfo.nickName
                        var avatarUrl = userInfo.avatarUrl
                        var gender = userInfo.gender //性别 0：未知、1：男、2：女
                        var province = userInfo.province
                        var city = userInfo.city
                        var country = userInfo.country
                    
                        let stores = wx.getStorageSync('user_info')
                        let newStorage2 = Object.assign({}, stores)
                        newStorage2.nickName = nickName
                        newStorage2.avatarUrl = avatarUrl
                        Util.setStorage('user_info', newStorage2)

                        let reqData2 = Object.assign({},{login_id:json.login_id},{token:json.token},{nick_name: nickName},{avatar: avatarUrl})
                        Util.ajax('user/info', 'post', reqData2).then((data) => {
                            wx.setStorage({
                                key: 'user_info',
                                data: data
                            })
                            let empower = wx.getStorageSync('user_info')
                            let nickName = empower.nickName
                            if(json.phone == false){
                                wx.reLaunch({
                                    url: '/pages/empower_phone/empower_phone?sign=1'
                                })
                            }
                        }, () => {
                            wx.reLaunch({
                                url: '/pages/empower_tips/empower_tips?tips=1'
                            })
                        })
                        // console.log(stores.empower_phone,'stores.phone')
                        if(json.phone == false){
                            wx.reLaunch({
                                url: '/pages/empower_phone/empower_phone?sign=1'
                            })
                        } 
                    },
                    fail: function() {
                        wx.reLaunch({
                            url: '/pages/empower_tips/empower_tips?tips=2'
                        })
                    }
                })
            }
            if(json.phone == false){
                wx.reLaunch({
                    url: '/pages/empower_phone/empower_phone?session_key='+json.session_key
                })
            }
            if(json.status == 1){
                wx.reLaunch({
                    url: '/pages/empower_tips/empower_tips?sign=1'
                })
            } else {
                wx.reLaunch({
                    url: '/pages/empower_tips/empower_tips?sign=2'
                })
            }
            // else if(json.status == 2){
            //     console.log('需要注册')
            //     let stores = wx.getStorageSync('empower')
            //     let newStorage2 = Object.assign({}, stores)
            //     newStorage2.needregister = true
            //     newStorage2.sceneregister = self.data.scene
            //     wx.setStorageSync('empower', newStorage2)
            // }
        }, res => {
            wx.showModal({
                title: '提示',
                content: res.data.msg,
                showCancel: false
            })
        })
    },
    scanQuit() {
        wx.reLaunch({
            url: '/pages/empower_tips/empower_tips?sign=2'
        })
    }
})