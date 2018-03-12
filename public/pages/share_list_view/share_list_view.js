let Util = require('../../utils/util.js')
const app = getApp()

Page({
    data: {
        scrollHeight: 0,
        shareList: [],
        videoPause: false
    },
    onLoad(options) {
		let self = this;
        Util.getSystemInfo().then(result => {
            self.setData({
                scrollHeight: result.windowHeight,
            })
            wx.setNavigationBarTitle({title: '新建链接'})
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
    //视频播放
    listenerPlay(e) {
        this.data.videoPause = false
    },
    getVideoTime2(e) {
        this.data.videoPause = true
    },
    //点击微信图标放大
    toBigWXLogo(e) {
        wx.previewImage({
            urls:['http://a.300.cn/images/20180112/5a587685399cd.png'],
            success(res){
                console.log(res,'000000')
            },
            fail(res){
                console.log(res,'11111')
            },
            complete(res){
                console.log(res,'22222')
            }
        })
    },
    // 复制链接并分享
    toCopyAndTransmit(e) {

    },
    onShareAppMessage: function (res) {
        if (res.from === 'button') {
            // 来自页面内转发按钮
            //   console.log(res.target)
        }
        return {
          title: '自定义转发标题',
          path: '/pages/share_list_view/share_list_view',
          success: function(res) {
            // 转发成功
            // wx.showModal({
            //     title: '提示',  
            //     content: '转发成功', 
            //     success: function(res) {  
            //         if (res.confirm) {  
            //         console.log('确定')  
            //         } else if (res.cancel) {  
            //         console.log('取消')  
            //         }  
            //     }
            // })
          },
          fail: function(res) {
            // 转发失败
          }
        }
    },
    copyTBL:function(e){  
        var self=this;
        wx.setClipboardData({
            data: '密码: 8as4',
            success: function(res) {
            // self.setData({copyTip:true}),  
                // wx.showModal({
                //     title: '提示', 
                //     content: '复制成功',  
                //     success: function(res) {  
                //         if (res.confirm) {  
                //         console.log('确定')  
                //         } else if (res.cancel) {  
                //         console.log('取消')  
                //         }  
                //     }
                // })
            } 
        });  
    },
    toShareInfoe(e) {

    }
})