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

            let infoData = wx.getStorageSync('info_data')
            if (infoData != '') {
                setTimeout(() => {
                    let url = '/pages/info/info?url=' + infoData.url + '&name='
                    + infoData.name + '&id=' + infoData.doc_id
                    + '&username=' + infoData.username + '&createTime=' + infoData.createTime
                    + '&coverImg=' + infoData.coverImg + '&project_id=' + infoData.project_id
                    wx.navigateTo({
                        url: url
                    })
                }, 1000)
            }
        })
    },
    onShow() {
        let store = wx.getStorageSync('app')

        if (store.token == '') {
            wx.navigateTo({
                url: '/pages/signin/signin'
            })
        } else {
            // 评论输入框动画注册
            let animation = wx.createAnimation({
                duration: 300,
                timingFunction: 'ease',
            })

            let self = this

            self.animation = animation

            self.initList()
        }
        
    },

    consoleLoginError(errText) {
        this.setData({
            hiddenErr: false,
            errMsg: errText
        })
        this.animation.opacity(1).step()
        this.setData({
            animationData: this.animation.export()
        })

        setTimeout(() => {
            this.animation.opacity(0).step({duration: 1000})
            this.setData({
                animationData: this.animation.export(),
            })
            setTimeout(() => {
                this.setData({
                    hiddenErr: true,
                })
            }, 1000)
        }, 2000)
    },

    //初始化列表页
    initList() {
        let store = wx.getStorageSync('app')
        let self = this

        Util.ajax('project', 'get', store).then(data => {
            let pros = []
            data.list.forEach(item => {
                if (item.type == 'admin') {
                    item.storage_size = item.storage_count != undefined ? (item.storage_count / Math.pow(1024, 2)).toFixed(2) : 0                            
                    //演示项目处理
                    item.storage_size = item.name == '演示项目' ? 166.29 : item.storage_size
                    item.file_count = item.name == '演示项目' ? '2' : item.file_count
                    pros.push(item)
                }
            })
            self.setData({
                noticeList: [{name:'1.0.6',text:'1月8日'},{name:'1.0.7',text:'1月8日'}]
            })

            wx.hideLoading()
        }, res => {

            wx.showModal({
                title: '提示',
                content: '获取我的项目失败,请重新登录！！',
                showCancel: false,
                success: function(res) {
                    if (res.confirm) {
                        wx.navigateTo({url: '/pages/signin/signin?login_out=1'})
                    }
                }
            })
        })

        Util.ajax('project/join', 'get', store).then(data => {
            data.list.forEach(item => {
                item.storage_size = item.storage_count != undefined ? (item.storage_count / Math.pow(1024, 2)).toFixed(2) : 0
            })
            self.setData({
                joinProjectList: data.list,
                joinProjectListTemp: data.list
            })
            wx.hideLoading()
        }, (res) => {

            wx.showModal({
                title: '提示',
                content: '获取参与项目失败,请重新登录！！',
                showCancel: false,
                success: function(res) {
                    if (res.confirm) {
                        wx.navigateTo({url: '/pages/signin/signin?login_out=1'})
                    }
                }
            })
        })
    },

    toNoticeInfo(e) {
        wx.setStorage({
            key: 'project_id',
            data: e.currentTarget.dataset.id
        })
        wx.navigateTo({
          url: '/pages/project_list/project_list?project_id=' + e.currentTarget.dataset.id + '&projectName=' + e.currentTarget.dataset.name
        })
    }
})