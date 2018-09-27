Page({
    data:{
        scrollHeight: ''
    },
    onLoad: function(){
        let self = this
        wx.getSystemInfo({
            success(res) {
                self.setData({
                    scrollHeight: res.windowHeight
                })
            }
        })
    }
})