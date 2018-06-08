let Util = require('../../utils/util.js')
const app = getApp()

Page({
    data: {
        hideClear: true,
        listInfoWidth: 0,
        content_id: 0,
        noticeListInfo: [],
        noticeListInfoNum: 0,
        noticeListInfoTitle: '',
        isSystem: 0,
        accountInfo: '',
        grade: '',
        storage_max: '',
        project_max: '',
        member_max: '',
        time_at: '',
        noticeInfo3: ''
    },

    onLoad(options) {
        let self = this
        wx.showLoading()
        self.setData({
            content_id:options.content_id
        })
        Util.getSystemInfo().then(res => {
            self.setData({
                scrollHeight: res.windowHeight
            })
        })
        if(options.t==1){
            wx.setStorage({
                key:"notification",
                data:"true"
            })
        }
    },
    onShow() {
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
        reqData.content_id = self.data.content_id
        wx.showLoading()
        Util.ajax('content/detail', 'get',reqData).then(data => {
            let grade = ""
            switch(data.content.vip_name) {
                case "一级会员":
                    grade = 1
                    break
                case "二级会员":
                    grade = 2
                    break
                case "三级会员":
                    grade = 3
                    break
                case "四级会员":
                    grade = 4
                    break
            }
            self.setData({
                noticeInfo3: data,
                noticeListInfoTitle: data.content_name,
                noticeListInfo: data.content.list,
                isSystem: data.type,
                accountInfo: data.content,
                grade: grade,
                storage_max: data.content.storage_max,
                project_max: data.content.project_max =="不限制的"?data.content.project_max:data.content.project_max+"个",
                member_max: data.content.member_max =="不限制的"?data.content.member_max:data.content.member_max+"个",
                time_at: data.content.time_at
            })
            wx.setNavigationBarTitle({title: self.data.noticeListInfoTitle})
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