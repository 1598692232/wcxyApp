const app = getApp()

Page({
    onLoad() {
        wx.switchTab({
            url: '/pages/list/list'
        })
    }
})