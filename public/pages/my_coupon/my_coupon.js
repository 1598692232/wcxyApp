let Util = require('../../utils/util.js')
const app = getApp()

Page({
    data:{
        cardList: [],
        count: 0
    },
    onLoad: function(){
        let self = this
        wx.setNavigationBarTitle({ title: '我的代金券' })

        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, {
            login_id: store.login_id,
            token: store.token
        })
        Util.ajax('my/card', 'get', reqData).then(json => {
            self.setData({
                cardList: json,
                count: json.length?json.length:0
            })
        }, res => {
            wx.showModal({
                title: '提示',
                content: res.data.msg,
                showCancel: false
            })
        })
    }
})