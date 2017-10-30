var Util = require('../../utils/util.js')
const app = getApp()

Page({

    data: {
	    scrollHeight: 0,
	    commentIsFocus: false,
	    // hideSendComment: true,

	    commentList:[],
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
        tsy: '',
        tex: '',
        delTouching: false,
        showDel: false,
        muted: false,

        username:'',
        createTime: '',
        versionSelect: false,
        PSelect: false,
        selectY: '',
        selectWidth: '',
        arrowX: '',
        info: '',
        versionNo: 1,
        pNo: '',
        versions: '',
        ps: '',
        versionActive:0,
        Pactive: 0,
        fullScreen: false,
        fullScreenPSelect: false,
        videoClicked: false
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
                    selectWidth: res.windowWidth - 20,
                	// url: options.url,
                	// name: options.name,
                	project_id: options.projectId,
                    doc_id: options.id,
                    versionActive: options.id,
                	// username: options.username,
                	// createTime: options.createTime,
                    // coverImg: options.coverImg
                })
                wx.setNavigationBarTitle({title: options.name})


            }
        });
    },

    getVideoInfo(host, reqData, fn) {
        let self = this
        wx.showLoading()
        wx.request({
            url: host + '/wxapi/file/info',
            data: reqData,
            header: {
                'content-type': 'application/json' // 默认值
            },
            method: 'get',
            success: function(res) {
                wx.hideLoading()
                if (res.data.status == 1) {
                    // res.data.data.versions.map(item => {
                    //     if (self.data.versionActive == item.) {

                    //     }
                    // })
                    self.setData({
                        info: res.data.data,
                    })
                    if (fn != undefined) {
                        fn(res.data.data)
                    }
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '获取视频数据失败！',
                    })
                }
            }
        })
    },

    changeVersion(e) {
        let self = this
        let store = wx.getStorageSync('app')
	    let reqData = Object.assign({}, store, {
	    	doc_id: e.currentTarget.dataset.id,
	    	project_id: this.data.project_id,
        })

        self.getVideoInfo(store.host, reqData, (data) => {
            data.versions.forEach(item => {
                if (item.doc_id == e.currentTarget.dataset.id) {
                    item.activeVersion = true
                } else {
                    item.activeVersion = false
                }
            })

            data.resolution.forEach((item, k) => {
                if (item.resolution == self.data.pNo) {
                    item.activeP = true
                    self.setData({
                        url: item.src,
                    })
                } else {
                    item.activeP = false
                }
            })

            self.setData({
                versions: data.versions,
                ps: data.resolution,
                versionNo: e.currentTarget.dataset.index,
                username: data.realname,
                createTime: Util.getCreateTime(data.created_at)
            })
            setTimeout(() => {
                self.videoCtx.seek(self.data.videoTime)
                self.videoCtx.play()
            }, 300)
        })
    },
    
    changeP(e) {
        let self = this
        self.data.ps.forEach(item => {
            if (item.resolution == e.currentTarget.dataset.resolution) {
                item.activeP = true
                self.setData({
                    url: item.src,
                    pNo: item.resolution,
                })
            } else {
                item.activeP = false
            }             
        })

        self.setData({
            ps: self.data.ps,
        })
        setTimeout(() => {
            self.videoCtx.seek(self.data.videoTime)
            self.videoCtx.play()
        }, 300)
        
        if (e.currentTarget.dataset.type != undefined && e.currentTarget.dataset.type == 'video') {
            self.setData({
                videoClicked: false
            })
        }  
    },

    onShow() {

	    let self = this

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

        self.getVideoInfo(store.host, reqData, (data) => {
            data.versions.forEach((item, index)=> {
                if (index == 0) {
                    item.activeVersion = true
                } else {
                    item.activeVersion = false
                }
            })

            data.resolution.forEach((item, k) => {
                if (k == 0) {
                    item.activeP = true
                } else {
                    item.activeP = false
                }
            })

            self.setData({
                versions: data.versions,
                ps: data.resolution,
                versionNo: 1,
                pNo: data.resolution[0].resolution,
                url:  data.resolution[0].src,
                username: data.realname,
                createTime: Util.getCreateTime(data.created_at)
            })
        })
        
	    wx.request({
            url: store.host + '/wxapi/comment',
            data: reqData,
            header: {
                'content-type': 'application/json' // 默认值
            },
            method: 'get',
            success: function(res) {
                wx.hideLoading()
                if (res.data.status == 1) {
                    let appStore = wx.getStorageSync('app')
                	res.data.data.list.map(item => {
                		item.comment_time = Util.timeToMinAndSec(item.media_time)
                        // item.media_time = parseInt(item.media_time)
                        item.avatar = item.avatar == '' ? self.data.tx : item.avatar
                        item.background = ''
                        item.translateX = ''
                        item.delTranstion = ''
                        if(appStore.login_id == item.user_id) {
                            item.delColor = '#f00'
                        } else {
                            item.delColor = '#ddd'
                        }
                	})
                    self.setData({
                    	commentList: res.data.data.list
                    })
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
        let pids = wx.getStorageSync('project_ids')

        let returnTosignin = (text) => {
             let infoData = {
                url: self.data.url,
                name: self.data.name,
                project_id: wx.getStorageSync('project_id') || self.data.project_id,
                doc_id: self.data.doc_id,
                username: self.data.username,
                createTime: self.data.createTime,
                coverImg: self.data.coverImg
            }

            wx.setStorageSync('info_data', infoData)

            wx.showModal({
              title: '提示',
              content: text,
              success: function(res) {
                if (res.confirm) {
                    wx.navigateTo({url: '/pages/signin/signin'})
                }
              }
            })
        }

        if (res.token == '') {
           returnTosignin('评论／回复需登录')
        } else { 
            if (pids.indexOf(self.data.project_id) < 0) {
                returnTosignin('只有参与该项目的人才能评论')
                return
            }
            // 延时处理拖动不能获取播放时间的问题
            self.videoCtx.play()
            self.setData({
                muted: true
            })
            // setTimeout(() => {
                self.videoCtx.pause()
                let videoTime = self.data.videoTime
                self.setData({
                    videoTime: videoTime,
                    muted: false
                })
                self.videoCtx.seek(videoTime)
                self.setData({
                    focusTime: parseInt(self.data.videoTime)
                })
            // }, 500)
            
        }
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
                        delTranstion: '',
                        delColor: '#f00',
                        user_id: wx.getStorageSync('app').login_id
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
        let res = wx.getStorageSync('app')
        let self = this
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

            wx.setStorageSync('info_data', infoData)

            wx.showModal({
              title: '提示',
              content: '评论／回复需登录',
              success: function(res) {
                if (res.confirm) {
                    wx.reLaunch({url: '/pages/signin/signin'})
                }
              }
            })

        } else { 
            
            wx.navigateTo({
              url: `/pages/call_back/call_back?commentId=${e.currentTarget.dataset.index}
              &docId=${this.data.doc_id}&projectId=${this.data.project_id}&avatar=${e.currentTarget.dataset.avatar}`
            })
        }
	 	
	 },

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
        // let realname1 = this.data.commentList[e.currentTarget.dataset.index].realname
        // let realname2 = wx.getStorageSync('user_info').realname

        this.data.commentList.map(item => {
            item.translateX = ''
            item.delTranstion = ''
        })

        // if (realname1 != realname2) return

        this.setData({
            tsx: e.touches[0].clientX,
            tsy: e.touches[0].clientY,
            delTouching: true
        })
    },

    delTouchMove(e) {
        let tmx = e.touches[0].clientX
        let tmy = e.touches[0].clientY
        let moveX = tmx - this.data.tsx
        if (!this.data.delTouching || Math.abs(tmy - this.data.tsy) > 5) return

        if (!this.data.showDel) {
            if (moveX > 0) return
            if (moveX < -100) {
                
               moveX = -100
                // moveX = -(Math.pow(Math.abs(moveX + 60), 0.8) + 60)
            }
            // if (moveX > 0) {
            //     moveX = Math.pow(moveX, 0.5)
            // }

            this.data.commentList[e.currentTarget.dataset.index].translateX = moveX
            this.setData({
                commentList: this.data.commentList,
                tex: tmx
            })
        } else {
            if (moveX < 0) return

            if (moveX > 100) {
                moveX = 0
                // moveX = Math.pow(Math.abs(moveX - 60), 0.5)
            } 
            // if (moveX < 0) {
                
                // moveX = -(Math.pow(Math.abs(moveX), 0.8) + 60)
            // } 
            // else {
            //     moveX = moveX - 60
            // }

            this.data.commentList[e.currentTarget.dataset.index].translateX = moveX
            this.setData({
                commentList: this.data.commentList,
                tex: tmx
            })
        }

     },

    delTouchEnd(e) {
        if (!this.data.delTouching) return

        this.setData({
            delTouching: false
        })

        if (this.data.commentList[e.currentTarget.dataset.index].translateX < -15) {
            this.data.commentList[e.currentTarget.dataset.index].translateX = -90
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

        if (e.currentTarget.dataset.userid !== store.login_id) {
            wx.showModal({
                title: '提示',
                content: '你不是评论发布者，不能删除！',
                showCancel: false
            })
            return
        }

        let project_id = wx.getStorageSync('project_id')
        let reqData = Object.assign({}, {
            project_id: project_id,
            comment_id: this.data.commentList[e.currentTarget.dataset.index].id,
            doc_id: this.data.doc_id,
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
    },
    // 删除评论 end

    selectVersionAndP(e) {
        let self = this
        if (e.currentTarget.dataset.id == 'version-select') {
            self.setData({
                versionSelect: true
            })
        } else {
            this.setData({
                PSelect: true
            })    
        }
        
        let $ = wx.createSelectorQuery()

        $.select(`#${e.currentTarget.dataset.id}`).boundingClientRect()
        $.selectViewport().scrollOffset()
        $.exec(function(res){
            self.setData({
                arrowX:e.currentTarget.dataset.id == 'version-select' ? 10 : res[0].left + 10,
                selectY: res[0].top + 50,
            })     
        })

        // wx.createSelectorQuery().select('#version-select').fields({
        // dataset: true,
        // size: true,
        // scrollOffset: true,
        // properties: ['scrollX', 'scrollY']
        // }, function(res){
        //     self.setData({
        //         selectX:0,
        //         selectY: 0,
        //     })
        // }).exec()
    },

    hideSelect() {
        this.setData({
            PSelect: false,
            versionSelect: false,
        })
    },

    handleFullScreen(e) {
        this.setData({
            fullScreen: e.detail.fullScreen ? true : false
        })
    },

    showPSelect() {
        this.setData({
            videoClicked: true
        })
    },
    hidePselect(){
        this.setData({
            videoClicked: false
        })
    }

})