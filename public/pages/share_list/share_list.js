let Util = require('../../utils/util.js')
const app = getApp()

Page({
    data: {
        scrollHeight: 0,
        shareList: [],
        projectID: 0,
        tx: app.data.staticImg.manager,
    },
    onLoad(options) {
        let self = this;
        self.setData({
            projectID:options.project_id
        })
        Util.getSystemInfo().then(result => {
            self.setData({
                scrollHeight: result.windowHeight,
            })
            wx.setNavigationBarTitle({title: '链接'})
        })
    },
    onShow() {
        let self = this
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, {token: store.token},{login_id:store.login_id})
        reqData.project_id = self.data.projectID
        wx.showLoading()
        Util.ajax('sharelink/list', 'get',reqData).then(data => {
            data.list.map(item => {
                item.avatar = item.avatar == '' ? self.data.tx : item.avatar
                item.createtime = Util.getCreateTime(item.created_at)
                item.image = item.share_img
                item.number = item.files_count
            })
            self.setData({
                shareList: data.list
            })
            wx.hideLoading()
        }, res => {
            wx.showModal({
                title: '提示',
                content: res.data.msg,
                showCancel: false,
                success: function(res) {
                    if (res.confirm) {
                        wx.navigateTo({url: '/pages/signin/signin?login_out=2'})
                    }
                }
            })
        })
    },
    toShareInfo(e){
        wx.navigateTo({
            url: '/pages/share_list_view/share_list_view?code=' + e.currentTarget.dataset.code 
            + '&password=' + e.currentTarget.dataset.password + '&id=' + e.currentTarget.dataset.id
        })
    }
})