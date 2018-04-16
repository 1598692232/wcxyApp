let Util = require('../../utils/util.js')
const app = getApp()

Page({
	data: {
        scrollHeight: 0,
        scene: ''
    },
    onShow() {
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
            
                let stores = wx.getStorageSync('empower')
                let newStorage2 = Object.assign({}, stores)
                newStorage2.nickName = nickName
                newStorage2.avatarUrl = avatarUrl
                Util.setStorage('empower', newStorage2)
                // console.log(stores.empower_phone,'stores.phone')
                if(stores.empower_phone===undefined){
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
        let empowers = wx.getStorageSync('empower')
        let reqData = Object.assign({}, {scene_id: self.data.scene},{code: store.code},{nick_name: empowers.nickName},{avatar: empowers.avatarUrl})
        Util.ajax('auth/login', 'post', reqData).then(json => {
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