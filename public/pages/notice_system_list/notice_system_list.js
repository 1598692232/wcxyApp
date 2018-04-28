let Util = require('../../utils/util.js')
const app = getApp()

Page({
    data: {
        noticeList: [],
        animationData: {},
        hideClear: true,
        listInfoWidth: 0,
    },

    onLoad() {
        let self = this
        wx.showLoading()

        Util.getSystemInfo().then(res => {
            self.setData({
                scrollHeight: res.windowHeight,
                listInfoWidth: res.windowWidth - 110,
                liWidth: res.windowWidth - 110
            })
        })
    },
    onShow() {
        wx.setStorage({
            key:"notification",
            data:"true"
        })
        let store = wx.getStorageSync('app')
        // if (store.token == '') {
        //     wx.navigateTo({
        //         url: '/pages/signin/signin'
        //     })
        // } else {
            let self = this
            self.initList()
        // }  
    },

    //初始化列表页
    initList() {
        let self = this
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, {token: store.token},{login_id:store.login_id})
        reqData.project_id = -1
        wx.showLoading()
        Util.ajax('notice/detail', 'get',reqData).then(data => {
            let arr = data.list?data.list:[]
            arr.map(item => {
                item.createtime = Util.getCreateTimeDate(item.created_at)
            })
            self.setData({
                noticeListInfo: arr
            })
            wx.hideLoading()
        }, res => {
            // wx.showModal({
            //     title: '提示',
            //     content: '获取消息通知失败,请重新登录！！',
            //     showCancel: false,
            //     success: function(res) {
            //         if (res.confirm) {
            //             wx.navigateTo({url: '/pages/signin/signin?login_out=2'})
            //         }
            //     }
            // })
        })
    },

    toNoticeSystemInfo(e) {
        wx.navigateTo({
          url: '/pages/notice_system_info/notice_system_info?content_id=' + e.currentTarget.dataset.contentid
        })
    }
})