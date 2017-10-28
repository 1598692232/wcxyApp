var Util = require('../../utils/util.js')

const app = getApp()

Page({

    data: {
        scrollHeight: 0,
        callList: [],
        // page: 1,

        commentIsFocus: false,
        // hideSendComment: true,

        animationData: {},
        commentText: '',
        tx: app.data.staticImg.tx,
        zan: app.data.staticImg.zan,
        zanActive: app.data.staticImg.zanActive,

        currentComment: '',

        tsx: '',
        tex: '',
        tsy: '',
        delTouching: false,
        showDel: false,
    },

   onLoad(options) {
        let self = this
        wx.showLoading()
        wx.getSystemInfo({
            success: function (res) {
                self.setData({
                    scrollHeight: res.windowHeight - 54,
                    commentId: parseInt(options.commentId),
                    docId: parseInt(options.docId),
                    avatar: options.avatar == '' ? tx : options.avatar 
                });

                let store = wx.getStorageSync('app')
                let reqData = Object.assign({}, store, {
                    doc_id: self.data.docId,
                    project_id: wx.getStorageSync('project_id') || options.projectId
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
                            let appStore = wx.getStorageSync('app')
                            let currentComment = res.data.data.list.filter(item => {
                                return parseInt(item.id) == self.data.commentId
                            })

                            currentComment[0].comment_time = Util.timeToMinAndSec(currentComment[0].media_time)
                             
                            // currentComment[0].media_time = parseInt(currentComment[0].media_time)
                            currentComment[0].replies.map(item => {
                                item.translateX = '',
                                item.delTranstion = ''
                                item.avatar = item.avatar == '' ? self.data.tx : item.avatar
                                if(appStore.login_id == item.user_id) {
                                    item.delColor = '#f00'
                                } else {
                                    item.delColor = '#ddd'
                                }
                            })
                            self.setData({
                                callList: currentComment[0].replies,
                                currentComment: currentComment[0]
                            })
                            wx.setNavigationBarTitle({title: `${currentComment[0].replies.length}条回复`})
                            wx.hideLoading()
                        } else {
                            wx.showModal({
                              title: '提示',
                              content: '获取回复信息失败！',
                            })
                        }
                    },
                    fail(res) {
                        wx.showModal({
                            title:'提示',
                            content: JSON.stringify(res),
                        })
                    }
                })

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
    // commentFocus() {
    //     let self = this
    //     wx.getStorage({
    //       key: 'app',
    //       success: function(res) {
    //         // res.data.token = ''
    //             if (res.data.token == '') {
    //                   wx.showModal({
    //                       title: '提示',
    //                       content: '评论／回复需登录',
    //                       success: function(res) {
    //                         if (res.confirm) {
    //                             wx.reLaunch({
    //                                 url: '/pages/list/list'
    //                             })
    //                         }
    //                       }
    //                     })
    //               } else {

    //                 // self.animation1.width("75%").step()
    //                 // self.setData({
    //                 //     hideSendComment: false,
    //                 //     animationData:self.animation1.export()
    //                 // })
    //             }
    //         }
    //     })
    // },

    //评论失焦
    commentBlur() {
        // this.setData({
        //     hideSendComment: true
        // })
        // setTimeout(() => {
        //     this.animation2.width("100%").step()
        //     this.setData({
        //       animationData:this.animation2.export()
        //     })
        // }, 500)
     },

     // 发送评论
     sendComment(e) {
        let self = this
        wx.showLoading()
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, store, {
            content: e.detail.value.commentText,
            label: '',
            media_time: self.data.videoTime,
            doc_id: self.data.docId,
            project_id: wx.getStorageSync('project_id'),
            top_id: self.data.commentId
        })
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
                    let list = self.data.callList
                    wx.showToast({
                        title: '回复成功！！'
                    })
                    let newCall= {
                        content: e.detail.value.commentText,
                        comment_time: Util.timeToMinAndSec(self.data.videoTime),
                        doc_id: self.data.docId,
                        project_id: wx.getStorageSync('project_id'),
                        id: res.data.data.id,
                        realname:wx.getStorageSync('user_info').realname,
                        avatar: wx.getStorageSync('user_info').avatar == '' ? self.data.tx : wx.getStorageSync('user_info').avatar,
                        translateX: '',
                        delTranstion: '',
                        delColor: '#f00',
                        user_id: wx.getStorageSync('app').login_id
                    }

                    list.unshift(newCall)

                    self.setData({
                        callList: list,
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


    // loadMore() {
    //     let data = this.data.callList
    //     this.setData({
    //       page: ++this.data.page
    //     })
    //     for(let i = 10 * (this.data.page - 1) + 1; i <= this.data.page * 10; i ++ ){
    //       data.push(i)
    //     }
    //     this.setData({
    //         callList: data,
    //     })
    // },

    // 删除评论 start
    delTouchStart(e) {
        // let realname1 = this.data.callList[e.currentTarget.dataset.index].realname
        // let realname2 = wx.getStorageSync('user_info').realname

        this.data.callList.map(item => {
            item.translateX = '',
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
        let moveX = tmx - this.data.tsx
        let tmy = e.touches[0].clientY
        if (!this.data.delTouching || Math.abs(tmy - this.data.tsy) > 5) return
        
        if (!this.data.showDel) { 

            if (moveX > 0) return
            if (moveX < -100) {
               moveX = -100
            }

            // if (moveX < -60) {
            //     moveX = -(Math.pow(Math.abs(moveX + 60), 0.8) + 60)
            // }
            // if (moveX > 0) {
            //     moveX = Math.pow(Math.abs(moveX + 60), 0.5)
            // }

            this.data.callList[e.currentTarget.dataset.index].translateX = moveX
            this.setData({
                callList: this.data.callList,
                tex: tmx
            })
        } else {
            if (moveX < 0) return
            
            if (moveX > 100) {
                moveX = 0
            } 

            // if (moveX > 60) {
            //     moveX = Math.pow(Math.abs(moveX - 60), 0.5)
            // } else if (moveX < 0) {
            //     moveX = -(Math.pow(Math.abs(moveX), 0.8) + 60)
            // } else {
            //     moveX = moveX - 60
            // }

            this.data.callList[e.currentTarget.dataset.index].translateX = moveX
            this.setData({
                callList: this.data.callList,
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

        if (this.data.callList[e.currentTarget.dataset.index].translateX < -15) {
            this.data.callList[e.currentTarget.dataset.index].translateX = -90
            this.data.callList[e.currentTarget.dataset.index].delTranstion = 'del-transtion'
            this.setData({
                callList: this.data.callList,
                showDel: true,
            })
        } else {
            this.data.callList[e.currentTarget.dataset.index].translateX = 0
            this.data.callList[e.currentTarget.dataset.index].delTranstion = 'del-transtion'
            this.setData({
                callList: this.data.callList,
                showDel: false
            })
        }

        setTimeout(() => {
            if (this.data.callList.length == 0 ||
                this.data.callList[e.currentTarget.dataset.index].delTranstion == undefined) return
            this.data.callList[e.currentTarget.dataset.index].delTranstion = ''
            this.setData({
                callList: this.data.callList,
            })
        }, 300)
    },

    handleDelComment(e) {
        let store = wx.getStorageSync('app')

        if (e.currentTarget.dataset.userid !== store.login_id) {
            wx.showModal({
                title: '提示',
                content: '你不是回复评论发布者，不能删除！',
                showCancel: false
            })
            return
        }

        let project_id = wx.getStorageSync('project_id')
        let reqData = Object.assign({}, {
            project_id: project_id,
            comment_id: this.data.callList[e.currentTarget.dataset.index].id,
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
                    self.data.callList.splice(e.currentTarget.dataset.index, 1)
                    self.setData({
                        callList: self.data.callList
                    })
                    wx.showToast({
                        title: '删除成功！'
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