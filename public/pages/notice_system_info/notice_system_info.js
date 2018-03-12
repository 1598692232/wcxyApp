let Util = require('../../utils/util.js')
const app = getApp()

Page({
    data: {
        hideClear: true,
        listInfoWidth: 0,
        notice_id: 0,
        noticeListInfo: '',
        noticeListInfoNum: 0,
        noticeListInfoTitle: ''
    },

    onLoad(options) {
        console.log(options,'options')
        let self = this
        wx.showLoading()
        self.setData({
            notice_id:options.notice_id
        })
        Util.getSystemInfo().then(res => {
            self.setData({
                scrollHeight: res.windowHeight
            })
        })
    },
    onShow() {
        let store = wx.getStorageSync('app')
        if (store.token == '') {
            wx.navigateTo({
                url: '/pages/signin/signin'
            })
        } else {
            let self = this
            self.initList()
        }  
    },

    //初始化列表页
    initList() {
        let self = this
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, {token: store.token},{login_id:store.login_id})
        reqData.notice_id = self.data.notice_id
        wx.showLoading()
        Util.ajax('content/detail', 'get',reqData).then(data => {
            console.log(data,'data')
            self.setData({
                noticeListInfo: data.content,
                noticeListInfoNum: data.systemNotice_num,
                noticeListInfoTitle: data.title
            })
            wx.hideLoading()
        }, res => {
            // wx.showModal({
            //     title: '提示',
            //     content: '获取系统消息失败,请重新登录！！',
            //     showCancel: false,
            //     success: function(res) {
            //         if (res.confirm) {
            //             wx.navigateTo({url: '/pages/signin/signin?login_out=2'})
            //         }
            //     }
            // })
        })
    },

})