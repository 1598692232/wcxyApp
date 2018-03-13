let Util = require('../../utils/util.js')
const app = getApp()

Page({
    data: {
        noticeList: [],
        animationData: {},
        hideClear: true,
        listInfoWidth: 0,
        scrollHeight: 0,
        notice_count: 0,
        project_name: ''
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
    // noticeList存储获取的列表
    initList() {
        let self = this
        let store = wx.getStorageSync('app')
        //获取当前时间戳  
        var timestamp = Date.parse(new Date());  
        timestamp = timestamp / 1000;  
        console.log("当前时间戳为：" + timestamp);

        var timeback = wx.getStorageSync(store.login_id.toString()).noticeList0==null?timestamp:wx.getStorageSync(store.login_id.toString()).noticeList0.find((v) => {
            var arr= []
            arr.push(v.timestamp)
            return Math.min(arr)
        })
        // ajax处理登录，成功后存储本地信息
        // 本地存储用户信息
        let reqData = Object.assign({}, {token: store.token},{login_id:store.login_id})
        reqData.new_time = timeback.timestamp
        // reqData.new_time = 1420843520
        wx.showLoading()

        if(!wx.getStorageSync(store.login_id.toString())){
            wx.setStorageSync(store.login_id.toString(),{
                noticeList0 :[]
            })
        }

        Util.ajax('notice', 'get', reqData).then(data => {
            data.list.map((item,i) => {
                i++;
        // ----------------------  
        // 在localstorage里
                item.count = 0
                var thisItemData = wx.getStorageSync(store.login_id.toString()).noticeList0.find((v) => {
                    return v.id == item.project_id
                })
                if(thisItemData){
                    if(thisItemData.timestamp){
                        item.notice_content.forEach((v)=> {
                            if(v.created_at > thisItemData.timestamp){
                                item.count += 1
                            }
                        })
                    }
                }else{
                    if(wx.getStorageSync(store.login_id.toString()).noticeList0.length < i){
                        var sumData = wx.getStorageSync(store.login_id.toString())
                        sumData.noticeList0.push({
                            id: item.project_id,
                            timestamp:timestamp
                        })
                        wx.setStorageSync(store.login_id.toString(), sumData)
                    }
                }
        // ----------------------
            })
            self.setData({
                noticeList: data.list,
                notice_count:data.notice_count,
                project_name: data.project_name
            })
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
          url: '/pages/notice_system_list/notice_system_list?project_id= -1'
        })
    },
    // 跳转至消息详情列表页
    toNoticeInfo(e) {
        var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        // --------------------
        // 点击时设置时间戳
        let store = wx.getStorageSync('app')
        var sumData = wx.getStorageSync(store.login_id.toString())
        var userItem = sumData.noticeList0.find((v) => {
            return v.id == e.currentTarget.dataset.id
        })
        userItem.timestamp = timestamp
        wx.setStorageSync(store.login_id.toString(), sumData)
        // ----------------------
        let self = this
        let url = '/pages/notice_list/notice_list?project_id=' + e.currentTarget.dataset.id 
        + '&project_name=' + e.currentTarget.dataset.name
        wx.navigateTo({
            url: url,
        })
    },
})