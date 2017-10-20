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

        currentComment: ''
    },

   onLoad(options) {
        let self = this
        wx.showLoading()
        wx.getSystemInfo({
            success: function (res) {
                self.setData({
                    scrollHeight: res.windowHeight - 60,
                    commentId: parseInt(options.commentId),
                    docId: parseInt(options.docId)
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
                            let currentComment = res.data.data.list.filter(item => {
                                return parseInt(item.id) == self.data.commentId
                            })

                            currentComment[0].comment_time = Util.timeToMinAndSec(currentComment[0].media_time)
                            // currentComment[0].media_time = parseInt(currentComment[0].media_time)

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

                    // self.animation1.width("75%").step()
                    // self.setData({
                    //     hideSendComment: false,
                    //     animationData:self.animation1.export()
                    // })
                }
            }
        })
    },

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
                if (res.data.status == 1) {
                    let list = self.data.callList

                    let newCall= {
                        content: e.detail.value.commentText,
                        comment_time: Util.timeToMinAndSec(self.data.videoTime),
                        doc_id: self.data.docId,
                        project_id: wx.getStorageSync('project_id'),
                        id: res.data.data.id,
                        realname:wx.getStorageSync('user_info').realname,
                        avatar: wx.getStorageSync('user_info').avatar == '' ? self.data.tx : item.avatar
                    }

                    list.unshift(newCall)

                    self.setData({
                        callList: list,
                        commentText: ''
                    })

                } else {

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
    // }

})