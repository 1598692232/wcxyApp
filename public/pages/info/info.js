var Util = require('../../utils/util.js')
const app = getApp()

Page({

    data: {

	    scrollHeight: 0,
	    commentIsFocus: false,
	    hideSendComment: true,

	    commentList:[
	    // {time: 10, minTime:0, secTime: 10, text: 'text'},
	    // {time: 20,minTime:0, secTime: 20, text: 'text'},
	    // {time: 30,minTime:0, secTime: 30, text: 'text'},
	    // {time: 40,minTime:0, secTime: 40, text: 'text'}
	    ],
	    animationData: {},
	    commentText: '',

        tx: app.data.staticImg.tx,
        zan: app.data.staticImg.zan,
        zanActive: app.data.staticImg.zanActive,
        page: 1,
        videoTime: 0,
        focusTime: 0,

        url: '',
        name: ''
    },

    onReady: function (res) {
	    this.videoCtx = wx.createVideoContext('myVideo')
  	},

    onLoad(options) {
        console.log(options, 887777777777)
        let self = this;
        wx.getSystemInfo({
            success: function (res) {
                self.setData({
                	scrollHeightAll: res.windowHeight,
                    scrollHeight: res.windowHeight - 345,
                	url: options.url,
                	name: options.name,
                	project_id: wx.getStorageSync('project_id'),
                	doc_id: options.id,
                	username: options.username,
                	createTime: options.createTime,
                    coverImg: options.coverImg
            
                })
                // console.log(self.data.infoUrl, self.data.coverImg, 99999)
                wx.setNavigationBarTitle({title: options.name})
            }
        });
    },

    onShow() {
          console.log('info')
        // 评论输入框动画注册
    	let animation = wx.createAnimation({
	      	duration: 0,
	        timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
	    })

	    this.animation = animation
	    var self = this

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
                        item.avatar = item.avatar == '' ? self.data.tx : item.avatar
                	})
                    self.setData({
                    	commentList: res.data.data.list
                    })
                    console.lof(self.data.commentList, 8888)
                } else {

                }
            }
        })
    },

    toLogin() {
        let self = this
        wx.login({
            success: function(res) {
                if (res.code) {

                      let store = wx.getStorageSync('app')
                      store.code = res.code
                      wx.setStorage({
                        key:"app",
                        data: store,
                        success(res) {
                            //获取sessionid
                                wx.request({
                                    url: store.host + '/wxapi/init',
                                    data: {
                                      code: store.code
                                    },
                                    success(res) {
                                        if (res.data.status == 1) {
                                            //设置sessionid storage
                                            let data = Object.assign({}, store, res.data.data)

                                            if (res.data.data.token == '') {
                                                //如果没有登录，设置storage，并且跳转到登录页
                                               wx.setStorage({
                                                    key:"app",
                                                    data: data,
                                                    success(res) {
                                                        wx.getStorage({
                                                            key:'app',
                                                            success(res) {
                                                                 wx.reLaunch({
                                                                  url: '/pages/signin/signin?sessionid=' + res.data.sessionid
                                                                })
                                                            }
                                                        })

                                                    }
                                                })

                                                return
                                            }
                                        } else {
                                             wx.showModal({
                                              title: '提示',
                                              content: '请求失败！',
                                            })
                                        }
                                    }
                                })
                            }
                        })

                } else {
                     wx.showModal({
                      title: '提示',
                      content: '获取用户登录态失败！'  + res.errMsg,
                    })
                }
            }
        });
    },

	// 评论输入框聚焦
	commentFocus() {
        let self = this
        wx.getStorage({
          key: 'app',
          success: function(res) {
            // res.data.token = ''
            if (res.data.token == '') {

                  wx.showModal({
                      title: '提示',
                      content: '评论／回复需登录',
                      success: function(res) {
                        if (res.confirm) {
                            wx.reLaunch({
                                      url: '/pages/list/list'
                                    })
                        }
                      }
                    })
              } else {
                self.setData({
                    focusTime: self.data.videoTime
                })

                self.animation.width("75%").step()
                    self.setData({
                })
                self.setData({
                    hideSendComment: false,
                    animationData:self.animation.export(),
                })
              }
          }

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
	 	let self = this
 		let comList = self.data.commentList
 		let time = self.data.focusTime
 		let store = wx.getStorageSync('app')

 		let reqData = Object.assign({}, store, {
	    	content: e.detail.value.commentText,
 			label: '',
 			media_time: self.data.videoTime,
 			doc_id: self.data.doc_id,
 			project_id: wx.getStorageSync('project_id')
	    })

 		wx.request({
            url: store.host + '/wxapi/comment',
            data: reqData,
            header: {
                'content-type': 'application/json' // 默认值
            },
            method: 'post',
            success: function(res) {
                if (res.data.status == 1) {
                	let list = self.data.commentList
                	let newComment = {
                		content: e.detail.value.commentText,
			 			comment_time: Util.timeToMinAndSec(self.data.videoTime),
                        media_time: self.data.videoTime,
			 			doc_id: self.data.doc_id,
			 			project_id: wx.getStorageSync('project_id'),
			 			id: res.data.data.id
                	}
                	list.unshift(newComment)
                    self.setData({
                    	commentList: list,
                    	commentText: ''
                    })
                } else {

                }
            }
        })	

	 },

	 //跳到指定时间播放
	 toVideoPosition(e) {
	 	// 模拟时间点击
	 	let time = e.currentTarget.dataset.time

 		this.videoCtx.seek(time)
 		this.videoCtx.play()
	 },

	 // 获取播放时间
	 getVideoTime(e) {
 		this.setData({
 			videoTime: parseInt(e.detail.currentTime)
 		})
	 },

	 toBackPage(e) {
	 	// console.log(e.currentTarget.dataset, 666533)
	 	// let commentCurrent = JSON.stringify(this.data.commentList[e.currentTarget.dataset.index])
	 	wx.navigateTo({
	      url: `/pages/call_back/call_back?commentId=${e.currentTarget.dataset.index}&docId=${this.data.doc_id}`
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
                + '&coverImg=' + this.data.coverImg 
	    return {
	        title: this.data.name,
	        path: url,
	        imageUrl: this.data.coverImg
	    }
	}


})