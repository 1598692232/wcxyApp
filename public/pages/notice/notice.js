let Util = require('../../utils/util.js')
const app = getApp()

Page({
    data: {
        noticeList: [],
        animationData: {},
        hideClear: true,
        listInfoWidth: 0,
        scrollHeight: 0
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

        //获取当前时间戳  
        var timestamp = Date.parse(new Date());  
        timestamp = timestamp / 1000;  
        console.log("当前时间戳为：" + timestamp);
        // ajax处理登录，成功后存储本地信息
        // 本地存储用户信息
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, {token: store.token},{login_id:store.login_id})
        reqData.new_time = 1420572841
        wx.showLoading()
        Util.ajax('notice', 'get', reqData).then(data => {
            data.list.map(item => {
                console.log(wx.getStorageSync('last_time'),'wx.getStorageSync')
                if(item.project_id === wx.getStorageSync('last_time')[0].id){
                    item.time = wx.getStorageSync('last_time')[0].time     
                } else {
                    item.time = 1483200000
                }
                console.log(item.time,'item.time')
                item.notice_content.map(v=>{
                    if(v.created_at > item.time){
                        // console.log(v,'vvvvvv')
                    }
                })
                item.count = 0
            })
            self.setData({
                noticeList: data.list,
                // noticeListType: translateNotificationType(data.notice_content[0].type)
            })
            console.log(self.data.noticeList,'-------list')
            wx.hideLoading()
        }, res => {
            wx.showModal({
                title: '提示',
                content: '获取消息通知失败,请重新登录！！',
                showCancel: false,
                success: function(res) {
                    if (res.confirm) {
                        wx.navigateTo({url: '/pages/signin/signin?login_out=2'})
                    }
                }
            })
        })
        
    },
    //跳转至系统消息
    toNoticeSystemInfo(e) {
        wx.navigateTo({
          url: '/pages/notice_system_list/notice_system_list'
        })
    },
    // 跳转至消息详情列表页
    toNoticeInfo(e) {
        var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        let newStorage = Object.assign({},{id:e.currentTarget.dataset.id})
        newStorage.time = timestamp
        var arr = []
        arr = arr.concat(newStorage)

        wx.setStorage({
            key: 'last_time',
            data: arr
        })

        let self = this
        let url = '/pages/notice_list/notice_list?project_id=' + e.currentTarget.dataset.id 
        + '&created_at=' + e.currentTarget.dataset.time
        console.log(url,'url6666')
        wx.navigateTo({
            url: url,
        })
    },
    // setAllNotice() {
    //     wx.getStorageSync('last_time')
    //     let last_time = []
    //     this.data.noticeList.forEach(v => {
    //         if( v.id === wx.getStorageSync('last_time').id) {
    //             v.time = wx.getStorageSync('last_time').time
    //         } else {
    //             v.time = timestamp
    //         }
    //         last_time.push(v)
    //     })
    //     wx.setStorage({
    //         key: 'last_time',
    //         data: last_time
    //     })
    // },
})