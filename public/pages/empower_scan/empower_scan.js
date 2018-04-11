let Util = require('../../utils/util.js')
const app = getApp()

Page({
	data: {
        scrollHeight: 0,
        scene: ''
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
        let reqData = Object.assign({}, {scene_id: self.data.scene},{code: store.code})
        Util.ajax('auth/login', 'get', reqData).then(json => {
            console.log(json,'json')
            if(json.status == 1){
                console.log('登录成功')
            }else if(json.status == 2){
                console.log('需要注册')
                let stores = wx.getStorageSync('empower')
                let newStorage2 = Object.assign({}, stores)
                newStorage2.needregister = true
                newStorage2.sceneregister = self.data.scene
                wx.setStorageSync('empower', newStorage2)
            }
            wx.reLaunch({
                url: '/pages/signin/signin'
            })
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
            url: '/pages/signin/signin'
        })
    }
})