let Util = require('../../utils/util.js')
const app = getApp()

Page({
    data:{
        scrollHeight: '',
        manager: app.data.staticImg.manager,
        needNickName: false,
        scrollTop: 0
    },
    onLoad: function(options){
        let self = this
        wx.getSystemInfo({
            success(res) {
                console.log(res,'res666')
                self.setData({
                    scrollHeight: res.windowHeight
                })
            }
        })

        wx.login({
            success: function(res) {
                if (res.code) {
                    let store = wx.getStorageSync('app')
                    let empowers = wx.getStorageSync('user_info')
                    let reqData = Object.assign({},{code: res.code})
                    Util.ajax('auth/login', 'post', reqData).then(json => {
                        Util.setStorage('user_info', json)
                        let data = Object.assign({}, store, json)
                        if(json.avatar==false) {
                            self.setData({
                                needNickName: true
                            })
                            wx.getUserInfo({
                                withCredentials: true,
                                success: function(res) {
                                    var userInfo = res.userInfo
                                    var nickName = userInfo.nickName
                                    var avatarUrl = userInfo.avatarUrl?userInfo.avatarUrl:manager
                                
                                    let stores = wx.getStorageSync('user_info')
                                    let newStorage2 = Object.assign({}, stores)
                                    newStorage2.nickName = nickName
                                    newStorage2.avatarUrl = avatarUrl
                                    Util.setStorage('user_info', newStorage2)

                                    self.setData({
                                        needNickName: false
                                    })
                                    let reqData2 = Object.assign({},{login_id:json.login_id},{token:json.token},{nick_name: nickName},{avatar: avatarUrl})
                                    if(json.avatar==false){
                                        Util.ajax('user/info', 'post', reqData2).then((data) => {
                                            wx.setStorage({
                                                key: 'user_info',
                                                data: data
                                            })
                                            let empower = wx.getStorageSync('user_info')
                                            let nickName = empower.nickName
                                        }, res => {
                                            wx.showModal({
                                                title: '提示',
                                                content: res.data.msg,
                                                showCancel: false
                                            })
                                        })
                                    }  
                                },
                                fail: function() {
                                    wx.reLaunch({
                                        url: '/pages/empower_tips/empower_tips?tips=4'
                                    })
                                }
                            })
                        }

                        Util.setStorage('app', data)
                    }, res => {
                        wx.showModal({
                            title: '提示',
                            content: res.data.msg,
                            showCancel: false
                        })
                    })
                }
            }
        })
    },
    // 分享
    onShareAppMessage: function (res) {
        if (res.from === 'button') {
            // 来自页面内转发按钮
        }
        return {
          title: '快来领新阅代金券，最高可领取300元',
          path: '/pages/coupon/coupon',
          imageUrl: './img/share.png',
          success: function(res) {
            // 转发成功
            wx.showToast({
                title: '转发成功',
                icon: 'success'
            })
            setTimeout(function(){
                wx.hideLoading()
            },2000)
          },
          fail: function(res) {
            // 转发失败
          }
        }
    },
    // 返回首页
    back(){
        wx.reLaunch({
            url: '/pages/empower_signin/empower_signin'
        })
    },
    getMore() {
        this.setData({
            scrollTop: '340'
        })
    },
    // 立即领取
    receive(){
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, store, {
            // project_id: wx.getStorageSync('project_id')
        })
        // Util.ajax('member/project', 'get', reqData).then(json => {
        //     console.log(json,'json666')
            wx.showModal({
                title: '提示',
                content: '恭喜您，领取成功',
                showCancel: false
            })
        // }, res => {
        //     wx.showModal({
        //         title: '提示',
        //         content: res.data.msg,
        //         showCancel: false
        //     })
        // })
    }
})