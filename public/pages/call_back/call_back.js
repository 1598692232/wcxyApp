const app = getApp()

Page({

    data: {
        scrollHeight: 0,
        callList: [1,2,3,4,5,6,7],
        page: 1,

        commentIsFocus: false,
        hideSendComment: true,

        animationData: {},
        commentText: '',
        tx: app.data.staticImg.tx,
        zan: app.data.staticImg.zan,
        zanActive: app.data.staticImg.zanActive
    },

   onLoad() {
        let that = this;

        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    scrollHeight: res.windowHeight - 60
                });
                wx.setNavigationBarTitle({title: '10条回复'})
            }
        });
    },

    onShow() {
        // 评论输入框动画注册
        let animation1 = wx.createAnimation({
            duration: 0,
            timingFunction: 'ease',
        })

        this.animation1 = animation1


        let animation2 = wx.createAnimation({
            duration: 100,
            timingFunction: 'ease',
        })

        this.animation2 = animation2
    },

    // 评论输入框聚焦
    commentFocus() {
        this.animation1.width("75%").step()
        this.setData({
            hideSendComment: false,
            animationData:this.animation1.export()
        })
    },

    //评论失焦
    commentBlur() {
        this.setData({
            hideSendComment: true
        })
        setTimeout(() => {
            this.animation2.width("100%").step()
            this.setData({
              animationData:this.animation2.export()
            })
        }, 500)
     },

     // 发送评论
     sendComment(e) {
        let comList = this.data.callList

        comList.unshift(e.detail.value.commentText)
        this.setData({
            commentText: '',
            callList: comList
        })
     },


    loadMore() {
        let data = this.data.callList
        this.setData({
          page: ++this.data.page
        })
        for(let i = 10 * (this.data.page - 1) + 1; i <= this.data.page * 10; i ++ ){
          data.push(i)
        }
        this.setData({
            callList: data,
        })
    }

})