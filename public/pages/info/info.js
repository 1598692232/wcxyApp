const app = getApp()

Page({

    data: {
        // src: '',
        // playHidden: true,
        // pauseHidden: false,
        // controlBodyHidden: true,
        // doHidden: true,
        // clearControlTimer: null,
        // isFullScreen: false,
        // isControls: true,

	    scrollHeight: 0,
	    commentIsFocus: false,
	    hideSendComment: true,

	    commentList:[
	    {time: 10, minTime:0, secTime: 10, text: 'text'},
	    {time: 20,minTime:0, secTime: 20, text: 'text'},
	    {time: 30,minTime:0, secTime: 30, text: 'text'},
	    {time: 40,minTime:0, secTime: 40, text: 'text'}
	    ],
	    animationData: {},
	    commentText: '',

        tx: app.data.staticImg.tx,
        zan: app.data.staticImg.zan,
        zanActive: app.data.staticImg.zanActive,
        page: 1,
        videoTime: 0,
        focusTime: 0
    },

    onReady: function (res) {
	    this.videoCtx = wx.createVideoContext('myVideo')
  	},

    onLoad() {
        let that = this;
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                	scrollHeightAll: res.windowHeight,
                    scrollHeight: res.windowHeight - 345
                });
            }
        });
    },
    
    onShow() {
        // 评论输入框动画注册
    	let animation = wx.createAnimation({
	      	duration: 0,
	        timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
	    })

	    this.animation = animation
    },

	// 评论输入框聚焦
	commentFocus() {
		this.setData({
			focusTime: this.data.videoTime
		})

		this.animation.width("75%").step()
		 	this.setData({
        })
	  	this.setData({
	  		hideSendComment: false,
	  		animationData:this.animation.export(),
	  	})
	},

	//评论失焦
 	commentBlur() {
 		this.setData({
	  		hideSendComment: true
	  	})
 		setTimeout(() => {
 			this.animation.width("100%").step({	duration: 300 })
		    this.setData({
		      animationData:this.animation.export()
		    })
 		}, 500)
	 },

	 // 发送评论
	 sendComment(e) {
 		let comList = this.data.commentList
 		let time = this.data.focusTime

 		comList.unshift({time: time, minTime: parseInt(time / 60), secTime: parseInt(time) % 60, text: e.detail.value.commentText})
		this.setData({
 			commentText: '',
 			commentList: comList,

 		})
	 },

	 //跳到指定时间播放
	 toVideoPosition(e) {
	 	// 模拟时间点击
	 	let time = e.currentTarget.dataset.index

 		this.videoCtx.seek(time)
 		this.videoCtx.play()
	 },

	 // 获取播放时间
	 getVideoTime(e) {
 		this.setData({
 			videoTime: e.detail.currentTime
 		})
	 },

	 toBackPage() {
	 	wx.navigateTo({
	      url: '/pages/call_back/call_back?id=1'
	    })
	 },


    loadMore() {
        let data = this.data.commentList
        this.setData({
          page: ++this.data.page
        })
        for(let i = 10 * (this.data.page - 1) + 1; i <= this.data.page * 10; i ++ ){
          data.push({time: 35,minTime:0, secTime: 35,text: ''})
        }
        this.setData({
            commentList: data,
        })
    },

    onShareAppMessage: function () {
	    return {
	        title: '转发',
	        path: '/pages/info/info?id=123',
	        imageUrl: 'test.jpg'
	    }
	},


	 // play() {
	//   	this.setData({
	//   		playHidden: true,
 //        	pauseHidden: false,
	//   	})

	//     this.videoCtx.play()
	// },
	// pause() {
 //  		this.setData({
	//   		playHidden: false,
 //        	pauseHidden: true,
	//   	})
	//     this.videoCtx.pause()
	//     console.log(1231212)
	// },
	// toggleControl() {
	//   	if (this.data.isControls) {
	//   		this.setData({
	//         	controlBodyHidden: true
	//         })
	//   		return
	//   	}
	// 	clearTimeout(this.data.clearControlTimer)
	// 	this.setData({
 //        	controlBodyHidden: false,
 //        	clearControlTimer: setTimeout(() => {
	// 								this.setData({
	// 						        	controlBodyHidden: true
	// 							  	})
	// 						  	}, 3000)
 //  	  	})
	//   	console.log(this.data.controlBodyHidden, 77)
	// },

	// toFullScreen() {
	//   	console.log(12123);
	//   	this.videoCtx.requestFullScreen()
	//   	this.setData({
	//   		isFullScreen: true,
	//   		isControls: true,
	//   		controlBodyHidden: true,
	//   	})
	// },

	//   // 退出全屏
	// exitFullScreen() {
	//   	this.videoCtx.exitFullScreen()
	//   	this.setData({
	//   		isFullScreen: false,
	//   		isControls: false
	//   	})
	// },



})