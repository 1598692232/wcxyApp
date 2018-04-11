// let Util = require('../../utils/util.js')
const app = getApp()


Page({
	data: {
        scrollHeight: 0,
        realName: 'name',
        avatar: ''
    },
	onLoad() {
        console.log('hahahaha')
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
        console.log(self.data.realName,'name----')
        console.log(self.data.avatar,'avtar-----')
        wx.setNavigationBarTitle({title: '授权'})
    },
    getPhoneNumber: function(e) {
        let stores = wx.getStorageSync('empower')
        let newStorage2 = Object.assign({}, stores)
        newStorage2.empower_phone = e.type
        newStorage2.empowerPhone = e.detail.encryptedData
        console.log(e.type,'999999e.type')
        wx.setStorageSync('empower', newStorage2)
        let shareCode = wx.getStorageSync('share_code')
        if(shareCode){
            wx.navigateBack()
        }else{
            if(e.detail.encryptedData){
                wx.switchTab({
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