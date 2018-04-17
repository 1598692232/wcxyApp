let Util = require('../../utils/util.js')
const app = getApp()


Page({
	data: {
        scrollHeight: 0,
        realName: 'name',
        avatar: '',
        session_key: '',
        isSignin: true
    },
	onLoad(options) {
        let self = this
        self.setData({
            session_key:options.session_key
        })
        self.setData({
            isSignin: options.sign?true:false
        })
        wx.getSystemInfo({
            success(res) {
                self.setData({
                    scrollHeight: res.windowHeight ,
                    realName: wx.getStorageSync('user_info').realname?wx.getStorageSync('user_info').realname:wx.getStorageSync('user_info').nickName,
                    avatar:  wx.getStorageSync('user_info').avatar?wx.getStorageSync('user_info').avatar:wx.getStorageSync('user_info').avatarUrl,
                })
            }
        })
        wx.setNavigationBarTitle({title: '微信授权'})
    },
    getPhoneNumber: function(e) {
        let self = this
        let stores = wx.getStorageSync('empower')
        let newStorage2 = Object.assign({}, stores)
        newStorage2.empower_phone = e.type
        newStorage2.empowerPhone = e.detail.encryptedData
        // console.log(e.type,'999999e.type')
        wx.setStorageSync('empower', newStorage2)
        let shareCode = wx.getStorageSync('share_code')
        if(shareCode){
            wx.navigateBack()
        }else{
            if(e.detail.encryptedData){
                console.log(self.data.isSignin,'self.data.isSignin')
                if(self.data.isSignin) {
                    wx.redirectTo({
                        url: '/pages/empower_scan/empower_scan'
                    })
                } else {
                    wx.switchTab({
                        url: '/pages/list/list'
                    })
                }  
                let store = wx.getStorageSync('app')
                let reqData = Object.assign({},{login_id: store.login_id},{token: store.token})
                reqData.phone = e.detail.encryptedData
                reqData.session_key = self.data.session_key
                reqData.iv = e.detail.iv
                Util.ajax('edit/phone', 'post', reqData).then(json => {
                    console.log(json,'000')
                }, res => {
                    wx.showModal({
                        title: '提示',
                        content: res.data.msg,
                        showCancel: false
                    })
                }) 
            }else{
                if (self.data.isSignin){
                    wx.redirectTo({
                        url: '/pages/empower_scan/empower_scan'
                    })
                } else {
                    wx.switchTab({
                        url: '/pages/list/list'
                    })
                }  
            }
        }
    },
})