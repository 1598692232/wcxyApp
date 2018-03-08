let Util = require('../../utils/util.js')
const app = getApp()

Page({
    data: {
        scrollHeight: 0,
        shareList: []
    },
    onLoad(options) {
		let self = this;
        Util.getSystemInfo().then(result => {
            self.setData({
                scrollHeight: result.windowHeight,
            })
            wx.setNavigationBarTitle({title: '链接'})
        })
    },
    

    onShow() {
        let self = this
        // 获取参与成员头像姓名
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, store, {
            project_id: wx.getStorageSync('project_id')
        })
        self.setData({
            txList: [{name:'1月之前的后期素材',time:'1天前',num:7},{name:'1月之前的后期素材',time:'1天前',num:7}]
        })
    },
})