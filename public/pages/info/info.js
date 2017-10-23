var Util = require('../../utils/util.js')
const app = getApp()

Page({

    data: {
	    scrollHeight: 0,
	    commentIsFocus: false,
	    // hideSendComment: true,

	    commentList:[
	    // {time: 10, minTime:0, secTime: 10, text: 'text'},
	    // {time: 20,minTime:0, secTime: 20, text: 'text'},
	    // {time: 30,minTime:0, secTime: 30, text: 'text'},
	    // {time: 40,minTime:0, secTime: 40, text: 'text'}
	    ],
	    // animationData: {},
	    commentText: '',

        tx: app.data.staticImg.tx,
        zan: app.data.staticImg.zan,
        zanActive: app.data.staticImg.zanActive,
        page: 1,
        videoTime: 0,
        focusTime: 0,
        url: '',
        name: '',

        tsx: '',
        tex: '',
        delTouching: false,
        showDel: false,
        muted: false
    },

    onReady: function (res) {
	    this.videoCtx = wx.createVideoContext('myVideo')
  	},

    onLoad(options) {
        let self = this
        wx.showLoading()
        wx.setStorage({
            key: 'info_data',
            data: ''
        })
        wx.getSystemInfo({
            success: function (res) {
                self.setData({
                	scrollHeightAll: res.windowHeight,
                    scrollHeight: res.windowHeight - 345,
                	url: options.url,
                	name: options.name,
                	project_id: wx.getStorageSync('project_id') || options.projectId,
                	doc_id: options.id,
                	username: options.username,
                	createTime: options.createTime,
                    coverImg: options.coverImg
                })
                wx.setNavigationBarTitle({title: options.name})


            }
        });
    },

    onShow() {
        // 评论输入框动画注册
    	// let animation = wx.createAnimation({
	    //   	duration: 0,
	    //     timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
	    // })

	    // this.animation = animation

	    var self = this

        self.animation = wx.createAnimation({
          duration: 500,
          timingFunction: "cubic-bezier(0.4, 0, 0.2, 1)"
        })

	    let store = wx.getStorageSync('app')
	    let reqData = Object.assign({}, store, {
	    	doc_id: self.data.doc_id,
	    	project_id: this.data.project_id,
	    	// sort: 0
	    })

	    wx.request({
            url: store.host + '/wxapi/comment',
            data: reqData,
            header: {
                'content-type': 'application/json' // 默认值
            },
            method: 'get',
            success: function(res) {
                if (res.data.status == 1) {
                	res.data.data.list.map(item => {
                		item.comment_time = Util.timeToMinAndSec(item.media_time)
                        // item.media_time = parseInt(item.media_time)
                        item.avatar = item.avatar == '' ? self.data.tx : item.avatar,
                        item.background = '',
                        item.translateX = '',
                        item.delTranstion = ''
                	})
                    self.setData({
                    	commentList: res.data.data.list
                    })
                    wx.hideLoading()
                    
                } else {
                    wx.showModal({
                      title: '提示',
                      content: '获取评论数据失败！',
                    })
                }
            }
        })
    },

	// 评论输入框聚焦
	commentFocus() {
        let self = this

        let res = wx.getStorageSync('app')

        if (res.token == '') {

            let infoData = {
                url: self.data.url,
                name: self.data.name,
                project_id: wx.getStorageSync('project_id') || self.data.project_id,
                doc_id: self.data.doc_id,
                username: self.data.username,
                createTime: self.data.createTime,
                coverImg: self.data.coverImg
            }

            wx.setStorage({
                key: 'info_data',
                data: infoData
            })

            wx.showModal({
              title: '提示',
              content: '评论／回复需登录',
              success: function(res) {
                if (res.confirm) {
                    wx.reLaunch({url: '/pages/list/list'})
                }
              }
            })

        } else { 

            // 延时处理拖动不能获取播放时间的问题
            self.videoCtx.play()
            self.setData({
                muted: true
            })
            setTimeout(() => {
                self.videoCtx.pause()
                let videoTime = self.data.videoTime
                self.setData({
                    videoTime: videoTime - 0.5,
                    muted: false
                })
                self.videoCtx.seek(videoTime - 0.5)
                self.setData({
                    focusTime: parseInt(self.data.videoTime)
                })
            }, 500)
            
        }
	},

	//评论失焦
 	commentBlur() {
 		// this.setData({
	  // 		hideSendComment: true
	  // 	})
 		// setTimeout(() => {
 		// 	this.animation.width("100%").step({	duration: 300 })
		 //    this.setData({
		 //      animationData:this.animation.export()
		 //    })
 		// }, 500)
	 },

	 // 发送评论
	 sendComment(e) {
	 	let self = this
 		let comList = self.data.commentList
 		let time = self.data.focusTime
 		let store = wx.getStorageSync('app')

 		let reqData = Object.assign({}, store, {
	    	content: e.detail.value.commentText,
 			label: '',
 			media_time: self.data.focusTime,
 			doc_id: self.data.doc_id,
 			project_id: wx.getStorageSync('project_id')
	    })
        wx.showLoading()

 		wx.request({
            url: store.host + '/wxapi/comment',
            data: reqData,
            header: {
                'content-type': 'application/json' // 默认值
            },
            method: 'post',
            success: function(res) {
                wx.hideLoading()
                if (res.data.status == 1) {
                	let list = self.data.commentList

                    wx.showToast({
                        title: '评论成功！！'
                    })


                	let newComment = {
                		content: e.detail.value.commentText,
			 			comment_time: Util.timeToMinAndSec(self.data.focusTime),
                        media_time: self.data.focusTime,
			 			doc_id: self.data.doc_id,
			 			project_id: wx.getStorageSync('project_id'),
			 			id: res.data.data.id,
                        realname: wx.getStorageSync('user_info').realname,
                        avatar: wx.getStorageSync('user_info').avatar == '' ? self.data.tx : wx.getStorageSync('user_info').avatar,
                        background: '',
                        translateX: '',
                        delTranstion: ''
                	}
                	list.unshift(newComment)
                    self.setData({
                    	commentList: list,
                    	commentText: ''
                    })
                } else {
                    wx.showModal({
                      title: '提示',
                      content: '发表评论失败！',
                      showCancel: false,
                    })
                }
            }
        })

	 },

	 //跳到指定时间播放
	 toVideoPosition(e) {
	 	// 模拟时间点击
	 	let time = e.currentTarget.dataset.time

        this.data.commentList.map(item => {
            item.background = ''
        })
        this.data.commentList[e.currentTarget.dataset.index].background = '#21252e'
        this.setData({
            commentList: this.data.commentList
        })

 		this.videoCtx.seek(time)
 		this.videoCtx.pause()
	 },

	 // 获取播放时间
	 getVideoTime(e) {
 		this.setData({
 			videoTime: e.detail.currentTime
 		})
	 },


     getVideoTime2(e) {
        this.setData({
            videoTime: this.data.videoTime
        })
     },


	 toBackPage(e) {
	 	// let commentCurrent = JSON.stringify(this.data.commentList[e.currentTarget.dataset.index])
	 	wx.navigateTo({
	      url: `/pages/call_back/call_back?commentId=${e.currentTarget.dataset.index}
          &docId=${this.data.doc_id}&projectId=${this.data.project_id}&avatar=${e.currentTarget.dataset.avatar}`
	    })
	 },


    // loadMore() {
        // let data = this.data.commentList
        // this.setData({
        //   page: ++this.data.page
        // })
        // for(let i = 10 * (this.data.page - 1) + 1; i <= this.data.page * 10; i ++ ){
        //   data.push({time: 35,minTime:0, secTime: 35,text: ''})
        // }
        // this.setData({
        //     commentList: data,
        // })
    // },

    onShareAppMessage () {
        let url = '/pages/info/info?url=' + this.data.url + '&name=' 
                + this.data.name + '&id=' + this.data.doc_id 
                + '&username=' + this.data.username + '&createTime=' + this.data.createTime
                + '&coverImg=' + this.data.coverImg + '&projectId=' + this.data.project_id
	    return {
	        title: this.data.name,
	        path: url,
	        imageUrl: this.data.coverImg
	    }
	},

    // 删除评论 start
    delTouchStart(e) {
        let realname1 = this.data.commentList[e.currentTarget.dataset.index].realname
        let realname2 = wx.getStorageSync('user_info').realname

        if (realname1 != realname2) return

        this.setData({
            tsx: e.touches[0].clientX,
            delTouching: true
        })
    },

    delTouchMove(e) {
        if (!this.data.delTouching) return
        let tmx = e.touches[0].clientX
        let moveX = tmx - this.data.tsx
        if (!this.data.showDel) {

            if (moveX < -60) {
                moveX = -(Math.pow(Math.abs(moveX + 60), 0.8) + 60)
            }
            if (moveX > 0) {
                moveX = Math.pow(moveX, 0.8)
            }

            this.data.commentList[e.currentTarget.dataset.index].translateX = moveX
            this.setData({
                commentList: this.data.commentList,
                tex: tmx
            })
        } else {

            if (moveX > 60) {
                moveX = Math.pow(Math.abs(moveX - 60), 0.8)
            } else if (moveX < 0) {
                moveX = -(Math.pow(Math.abs(moveX), 0.8) + 60)
            } else {
                moveX = moveX - 60
            }

            this.data.commentList[e.currentTarget.dataset.index].translateX = moveX
            this.setData({
                commentList: this.data.commentList,
                tex: tmx
            })
        }

     },

    delTouchEnd(e) {
        if (!this.data.delTouching) return
        // let distanceX= this.data.tex - this.data.tsx

        this.setData({
            delTouching: false
        })

        if (this.data.commentList[e.currentTarget.dataset.index].translateX <-30) {
            this.data.commentList[e.currentTarget.dataset.index].translateX = -50
            this.data.commentList[e.currentTarget.dataset.index].delTranstion = 'del-transtion'
            this.setData({
                commentList: this.data.commentList,
                showDel: true,
            })
        } else {
            this.data.commentList[e.currentTarget.dataset.index].translateX = 0
            this.data.commentList[e.currentTarget.dataset.index].delTranstion = 'del-transtion'
            this.setData({
                commentList: this.data.commentList,
                showDel: false
            })
        }

        setTimeout(() => {
            if (this.data.commentList.length == 0 ||
                this.data.commentList[e.currentTarget.dataset.index].delTranstion == undefined) return
            this.data.commentList[e.currentTarget.dataset.index].delTranstion = 0
            this.setData({
                commentList: this.data.commentList,
            })
        }, 300)
    },

    handleDelComment(e) {
        let store = wx.getStorageSync('app')
        let project_id = wx.getStorageSync('project_id')
        let reqData = Object.assign({}, {
            project_id: project_id,
            comment_id: this.data.commentList[e.currentTarget.dataset.index].id,
            doc_id: this.data.doc_id,
            // _method: 'delete'
        }, store)
        let self = this
        wx.showLoading({
            title: '正在删除...'
        })
        wx.request({
            url: store.host + '/wxapi/comment',
            data: reqData,
            method: 'delete',
            header: {
                'content-type': 'application/json' // 默认
            },
            success(res) {
                // wx.hideLoading()
                if (res.data.status == 1) {
                    self.data.commentList.splice(e.currentTarget.dataset.index, 1)
                    self.setData({
                        commentList: self.data.commentList
                    })
                    wx.showToast({
                        title: '删除成功！',
                        icon: 'success'
                    })
                } else {
                    wx.showModal({
                      title: '提示',
                      content: '删除评论失败！',
                      showCancel: false,
                    })
                }
            }
        })
    }
    // 删除评论 end

})