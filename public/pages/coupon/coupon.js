let Util = require('../../utils/util.js')
const app = getApp()

Page({
    data:{
        scrollHeight: '',
        manager: app.data.staticImg.manager,
        needNickName: false,
        scrollTop: 0,
        share_user_id: '',
        re_state: 0,
        promotion_count: 0,
        voucher: 0,
        list: [],
        getState: 0
    },
    onLoad: function(options){
        let scene = decodeURIComponent(options.scene).split('=')[1];
        let self = this
        
        wx.getSystemInfo({
            success(res) {
                self.setData({
                    scrollHeight: res.windowHeight
                })
            }
        })

        wx.login({
            success: function(res) {
                if (res.code) {
                    let store = wx.getStorageSync('app')
                    let reqData = Object.assign({},{code: res.code})
                    Util.ajax('auth/login', 'post', reqData).then(json => {
                        Util.setStorage('user_info', json)
                        let data = Object.assign({}, store, json)
                        Util.setStorage('app', data)
                        if(scene){
                            self.setData({
                                share_user_id: scene
                            })
                        }else if(options.share_user_id){
                            self.setData({
                                share_user_id: options.share_user_id
                            })
                        }else{
                            self.setData({
                                share_user_id: json.login_id
                            })
                        }

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
                        }else{
                            let reqData = Object.assign({}, {
                                login_id: json.login_id,
                                token: json.token
                            })
                            self.initInfo(reqData)
                        }

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
    initInfo(reqData, success){
        let self = this
        Util.ajax('receive/user', 'get', reqData).then(json => {
            json.list.map((v,i) => {
                v.time = Util.getCouponTime(v.created_at)
            })
            console.log(json, 'json')

            self.setData({
                re_state: json.re_state,
                promotion_count: json.promotion_count,
                voucher: json.voucher,
                list: json.list,
            });
            success && success();
        }, res => {
            wx.showModal({
                title: '提示',
                content: res.data.msg,
                showCancel: false
            })
        })
    },
    // 分享
    onShareAppMessage: function (res) {
        let self = this
        let store = wx.getStorageSync('app')
        if (res.from === 'button') {
            // 来自页面内转发按钮
        }
        return {
          title: '快来领新阅代金券，最高可领取300元',
          path: '/pages/coupon/coupon?share_user_id=' + store.login_id,
          imageUrl: './img/share.jpg',
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
        let self = this
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, {
            login_id: store.login_id,
            token: store.token,
            share_user_id: self.data.share_user_id
        })
        Util.ajax('receive/card', 'post', reqData).then(json => {
            wx.showModal({
                title: '提示',
                content: '恭喜您，领取成功',
                showCancel: false
            });

            let reqData2 = Object.assign({}, {
                login_id: store.login_id,
                token: store.token
            });

            self.initInfo(reqData2, () => {
                self.setData({
                    getState: 1
                });
            });
        }, res => {
            self.setData({
                getState: 1
            });
            wx.showModal({
                title: '提示',
                content: res.data.msg,
                showCancel: false
            })
        })
    }
})