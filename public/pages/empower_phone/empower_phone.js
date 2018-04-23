let Util = require('../../utils/util.js')
const app = getApp()


Page({
	data: {
        scrollHeight: 0,
        realName: '',
        avatar: '',
        session_key: '',
        isSignin: true,
        scanGetPhone: ''
    },
	onLoad(options) {
        let self = this
        self.setData({
            session_key:options.session_key,
            sharePhone: options.sharePhone,
            scanGetPhone: options.scan
        })
        self.setData({
            isSignin: options.sign?true:false
        })
        wx.getSystemInfo({
            success(res) {
                self.setData({
                    scrollHeight: res.windowHeight
                })
            }
        })
        wx.setNavigationBarTitle({title: '微信授权'})
    },
    onShow() {
        let self = this
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({},{login_id: store.login_id},{token: store.token})
        if(self.data.scanGetPhone!=1){
            Util.ajax('user/info', 'get', reqData).then(json => {
                self.setData({
                    realName: json.realname?json.realname:wx.getStorageSync('user_info').nickName,
                    avatar:  json.avatar?json.avatar:wx.getStorageSync('user_info').avatarUrl,
                })
            }, res => {
                wx.showModal({
                    title: '提示',
                    content: res.data.msg,
                    showCancel: false
                })
            }) 
        }   
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

        if(self.data.sharePhone==1){
            if(e.detail.encryptedData) {
                let store = wx.getStorageSync('app')
                let reqData2 = Object.assign({},{login_id: store.login_id},{token: store.token})
                reqData2.phone = e.detail.encryptedData
                reqData2.session_key = self.data.session_key
                reqData2.iv = e.detail.iv
                Util.ajax('edit/phone', 'post', reqData2).then(json => {
                    console.log(json,'000')
                }, res => {
                    wx.showModal({
                        title: '提示',
                        content: res.data.msg,
                        showCancel: false
                    })
                    if(res.data.status==2){
                        wx.reLaunch({
                            url: '/pages/empower_signin/empower_signin'
                        })
                    }
                })
                wx.navigateBack()
            }else{
                wx.navigateBack()
            }  
        }else if(self.data.scanGetPhone==1){
            if(e.detail.encryptedData) {
                let store = wx.getStorageSync('app')
                let reqData2 = Object.assign({},{login_id: store.login_id},{token: store.token})
                reqData2.phone = e.detail.encryptedData
                reqData2.session_key = self.data.session_key
                reqData2.iv = e.detail.iv
                Util.ajax('edit/phone', 'post', reqData2).then(json => {
                    console.log(json,'000')
                   
                }, res => {
                    wx.showModal({
                        title: '提示',
                        content: res.data.msg,
                        showCancel: false
                    })
                    if(res.data.status==2){
                        wx.reLaunch({
                            url: '/pages/empower_signin/empower_signin'
                        })
                    }
                })
                // wx.navigateBack()
                wx.reLaunch({
                    url: '/pages/empower_scan/empower_scan'
                })
            }else{
                // wx.navigateBack()
                // wx.reLaunch({
                //     url: '/pages/empower_scan/empower_scan'
                // })
                wx.reLaunch({
                    url: '/pages/empower_tips/empower_tips?sign=2'
                })
            }
        }else{
            if(e.detail.encryptedData){   
                let store = wx.getStorageSync('app')
                let reqData = Object.assign({},{login_id: store.login_id},{token: store.token})
                reqData.phone = e.detail.encryptedData
                reqData.session_key = self.data.session_key
                reqData.iv = e.detail.iv
                Util.ajax('edit/phone', 'post', reqData).then(json => {
                    // console.log(json,'000---')
                }, res => {
                    wx.showModal({
                        title: '提示',
                        content: res.data.msg,
                        showCancel: false
                    })
                    if(res.data.status==2){
                        wx.reLaunch({
                            url: '/pages/empower_signin/empower_signin'
                        })
                    }
                }) 

                if(self.data.isSignin) {
                    wx.reLaunch({
                        url: '/pages/empower_tips/empower_tips?sign=1'
                    })
                } else {
                    wx.reLaunch({
                        url: '/pages/list/list'
                    })
                }  
            }else{
                if (self.data.isSignin){
                    wx.reLaunch({
                        url: '/pages/empower_tips/empower_tips?sign=1'
                    })
                } else {
                    wx.reLaunch({
                        url: '/pages/list/list'
                    })
                }  
            }
        }
    },
})