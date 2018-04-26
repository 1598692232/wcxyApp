let Util = require('../../utils/util.js')
const app = getApp()


Page({
	data: {
        scrollHeight: 0,
        realName: '',
        avatar: '',
        toUserInfo: false,
        manager: app.data.staticImg.manager,
        popupArr: []
    },
	onLoad() {
        let self = this
        wx.getSystemInfo({
            success(res) {
                self.setData({
                    scrollHeight: res.windowHeight ,
                    realName: wx.getStorageSync('user_info').realname?wx.getStorageSync('user_info').realname:wx.getStorageSync('empower').nickName,
                    avatar:  wx.getStorageSync('user_info').avatar?wx.getStorageSync('user_info').avatar:wx.getStorageSync('empower').avatarUrl,
                })
            }
        })
        wx.setNavigationBarTitle({title: 'XINYUE新阅'})
    },
    onShow() {
        this.animation = wx.createAnimation({
            duration: 500,
            timingFunction: "cubic-bezier(0.4, 0, 0.2, 1)"
        })

        if (this.data.loginOut == '') {
            wx.setStorage({
                key: 'user_info',
                data: ''
            })
        }
        let self = this
        wx.login({
          success: function(res) {
            if (res.code) {

              let store = wx.getStorageSync('app')
              store.code = res.code
              wx.setStorage({
                  key:"app",
                  data: store,
                  success() {
                    self.isLoginforHandle()
                  }
                }) 
                wx.checkSession({
                    success: function(){
                        console.log('未过期')
                      //session_key 未过期，并且在本生命周期一直有效
                    },
                    fail: function(){
                        console.log('已经失效')
                      // session_key 已经失效，需要重新执行登录流程
                      wx.login() //重新登录
                    }
                  })
            } else {
              console.log('获取用户登录态失败！' + res.errMsg)
            }
          }
        })
    },
    isLoginforHandle() {
        let self = this
        //获取存储的code
        let store = wx.getStorageSync('app')
        let empowers = wx.getStorageSync('empower')
        let reqData = Object.assign({},{code: store.code})
        Util.ajax('auth/login', 'post', reqData).then((json) => {
            Util.setStorage('user_info', json)
            let data = Object.assign({}, store, json)
            if(json.avatar==false) {
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
                            toUserInfo: true
                        })
                        let reqData2 = Object.assign({},{login_id:json.login_id},{token:json.token},{nick_name: nickName},{avatar: avatarUrl})
                        Util.ajax('user/info', 'post', reqData2).then((data) => {
                            wx.setStorage({
                                key: 'user_info',
                                data: data
                            })
                            let empower = wx.getStorageSync('user_info')
                            let nickName = empower.nickName
                            if(json.phone == false){
                                wx.reLaunch({
                                    url: '/pages/empower_phone/empower_phone'
                                })
                            }else{
                                wx.reLaunch({
                                    url: '/pages/list/list'
                                })
                            }
                        }, res => {
                            wx.showModal({
                                title: '提示',
                                content: res.data.msg,
                                showCancel: false
                            })
                        })
                    },
                    fail: function() {
                        wx.reLaunch({
                            url: '/pages/empower_tips/empower_tips?tips=1'
                        })
                    }
                })
            }
            if(json.phone == false){
                wx.reLaunch({
                    url: '/pages/empower_phone/empower_phone'
                })
            }
            Util.setStorage('app', data).then(() => {
                Util.getStorage('app').then((res) => { 
                    wx.getNetworkType({
                        success: function(res) {
                            // 返回网络类型, 有效值：
                            // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
                            var networkType = res.networkType
                            if(networkType == 'unknown'||networkType == 'none') {
                                wx.showToast({
                                    title: '当前网络不可用',
                                    icon: 'none'
                                })
                                setTimeout(function(){
                                    wx.hideLoading()
                                },2000)
                            } else if(networkType=='2g') {
                                wx.showToast({
                                    title: '当前网络质量不佳',
                                    icon: 'none'
                                })
                                setTimeout(function(){
                                    wx.hideLoading()
                                },2000)
                            }
                          }
                    })
                    wx.onNetworkStatusChange(function(res) {
                        // console.log(res.isConnected,'isConnected')
                        // console.log(res.networkType,'networkType')
                        if(res.networkType == 'unknown'||res.networkType == 'none') {
                            wx.showToast({
                                title: '当前网络不可用',
                                icon: 'none'
                            })
                            setTimeout(function(){
                                wx.hideLoading()
                            },2000)
                        }else if(res.networkType == '2g') {
                            wx.showToast({
                                title: '当前网络质量不佳',
                                icon: 'none'
                            })
                            setTimeout(function(){
                                wx.hideLoading()
                            },2000)
                        }  
                    }) 
                             
                    if(json.avatar&&json.phone){
                        wx.reLaunch({
                            url: '/pages/list/list'
                        })
                    }
                    self.hasRedDots()   
                })
            })

        }, () => {
            wx.showModal({
                title: '提示',
                content: '小程序初始化失败！',
                cancelShow: false
            })
        })

    },
    hasRedDots() {
        let self = this
        let store = wx.getStorageSync('app')
        //获取当天零点的时间戳 
        const start = new Date(new Date(new Date().toLocaleDateString()).getTime());
        var timestampday = Date.parse(start); 
        timestampday = timestampday / 1000; 
        if(!wx.getStorageSync(store.login_id.toString())){
            wx.setStorageSync(store.login_id.toString(),{
                noticeList0 :[]
            })
        }
        let reqData = Object.assign({}, {token: store.token},{login_id:store.login_id})
        reqData.new_time = timestampday
        Util.ajax('notice', 'get', reqData).then(data => {
            var num
            var num2
            var data0 = data.list?data.list:[]
            data0.map((item,i) => {
                item.count = 0
                var arr = wx.getStorageSync(store.login_id.toString()).noticeList0?wx.getStorageSync(store.login_id.toString()).noticeList0:[]
                var thisItemData = arr.find((v) => {
                    return v.id == item.project_id
                })
                
                if(thisItemData){
                    if(item.project_id==-1&&thisItemData.timestamp){
                        item.notice_content.forEach((v)=> {
                            if(v.created_at > thisItemData.timestamp){
                                item.count += 1
                                num2 = item.count
                                self.data.popupArr.push(v)
                                self.setData({
                                    systemCount:num2
                                })
                            }
                        })
                    }else if(thisItemData.timestamp){
                        item.notice_content.forEach((v)=> {
                            if(v.created_at > thisItemData.timestamp){
                                item.count += 1
                                num = item.count
                            }
                        })
                    }
                }else{
                    var sumData = wx.getStorageSync(store.login_id.toString())
                    let newarr = sumData.noticeList0?sumData.noticeList0:[]
                    newarr.push({
                        id: item.project_id,
                        timestamp:Date.parse(new Date(new Date(new Date().toLocaleDateString()).getTime()))/1000
                    })
                    wx.setStorageSync(store.login_id.toString(), sumData)
                }  
            })

            reqData.content_id = self.data.popupArr[0]?self.data.popupArr[0].id:0
            Util.ajax('content/detail', 'get',reqData).then(data => {
                self.setData({
                    noticeListInfo: data.content.list,
                    popupTitle: data.content_name
                })
            }, res => {})

            if(num>0){
                wx.showTabBarRedDot({
                    index: 1,
                })
            }else{
                wx.hideTabBarRedDot({
                    index: 1,
                })
            }  
        }, res => {}) 
    },
})