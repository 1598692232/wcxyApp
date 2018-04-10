// let Util = require('../../utils/util.js')
const app = getApp()


Page({
	data: {
        scrollHeight: 0,
        realName: name,
        avatar: ''
	},
	onLoad() {
        console.log('hahahaha')
        let self = this
        // wx.getSystemInfo({
        //     success(res) {
        //         self.setData({
        //             scrollHeight: res.windowHeight ,
        //             realName: wx.getStorageSync('user_info').realname?wx.getStorageSync('user_info').realname:wx.getStorageSync('app').nickName,
        //             avatar:  wx.getStorageSync('user_info').avatar?wx.getStorageSync('user_info').avatar:wx.getStorageSync('app').avatarUrl,
        //         })
        //     }
        // })
        // console.log(self.data.realName,'name----')
        // console.log(self.data.avatar,'avtar-----')
        // wx.setNavigationBarTitle({title: '授权'})
    },
    onShow() {
        console.log(9999)
    },
    // onShow() {
    //     let self = this
    //     self.setData({
    //         realName: wx.getStorageSync('user_info').realname?wx.getStorageSync('user_info').realname:wx.getStorageSync('app').nickName,
    //         avatar:  wx.getStorageSync('user_info').avatar?wx.getStorageSync('user_info').avatar:wx.getStorageSync('app').avatarUrl,
    //     })
    //     console.log(self.data.realName,'name----onshow')
    //     console.log(self.data.avatar,'avtar-----onshow')
    //     wx.setNavigationBarTitle({title: '授权'})
    // },
    getPhoneNumber: function(e) {
        let stores = wx.getStorageSync('app')
        let newStorage2 = Object.assign({}, stores)
        newStorage2.phone = e.type
        wx.setStorageSync('app', newStorage2)
        let shareCode = wx.getStorageSync('share_code')
        if(shareCode){
            wx.navigateBack()
        }else{
            if(e.detail.encryptedData){
                wx.reLaunch({
                    url: '/pages/list/list'
                })
            }else{
                wx.reLaunch({
                    url: '/pages/signin/signin'
                })
            }
        }
    },
})