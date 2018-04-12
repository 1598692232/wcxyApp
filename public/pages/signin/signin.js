let Util = require('../../utils/util.js')
const app = getApp()

const exp = new RegExp('^[\.A-Za-z0-9_-\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$'); //邮箱正则

Page({
	data: {
		password: app.data.staticImg.password,
		email: app.data.staticImg.email,
		clear: app.data.staticImg.clear,
        logo: app.data.staticImg.logo,
        code: app.data.staticImg.code,
		emailText: '',
		passwordText: '',
		emailFocus: false,
		passwordFocus: false,
		hiddenEmailClear: true,
		hiddenPasswordClear: true,
        errMsg: '',
        hiddenErr: true,
        animationData: {},
        scrollHeight: 0,
        codeSrc: '',
        codeWidth: '',
        sessionid: '',
        loginOut: ''
    },

	onLoad(options) {
        let self = this
        let store = wx.getStorageSync('app')

        Util.getSystemInfo().then(res => {
            self.setData({
                scrollHeight: res.windowHeight,
                codeWidth: res.windowWidth - 100,
                codeSrc: store.host + '/wxapi/vercode?t=' + new Date().getTime() + '&sessionid=' + options.sessionid,
                loginOut: options.login_out
            })
            wx.setNavigationBarTitle({title: '登录'})
        })
    },

    onShow() {
        this.animation = wx.createAnimation({
            duration: 500,
            timingFunction: "cubic-bezier(0.4, 0, 0.2, 1)"
        })

        wx.showLoading()
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
            } else {
              console.log('获取用户登录态失败！' + res.errMsg)
            }
          }
        })
        // self.isLoginforHandle()

    },

    isLoginforHandle() {
        let self = this

        //获取存储的code
        let store = wx.getStorageSync('app')
        Util.ajax('init', 'get', {code: store.code}).then((json) => {

            // wx.getSetting({
            //     success(res) {
            //         if (!res.authSetting['scope.userInfo']) {
            //             wx.authorize({
            //                 scope: 'scope.userInfo',
            //                 success() {}
            //             })
            //         }
            //     }
            // })
            wx.getUserInfo({
                withCredentials: true,
                success: function(res) {
                    var userInfo = res.userInfo
                    var nickName = userInfo.nickName
                    var avatarUrl = userInfo.avatarUrl
                    var gender = userInfo.gender //性别 0：未知、1：男、2：女
                    var province = userInfo.province
                    var city = userInfo.city
                    var country = userInfo.country
                
                    let stores = wx.getStorageSync('empower')
                    let newStorage2 = Object.assign({}, stores)
                    newStorage2.nickName = nickName
                    newStorage2.avatarUrl = avatarUrl
                    Util.setStorage('empower', newStorage2)
                    console.log(stores.empower_phone,'stores.phone')
                    if(stores.empower_phone===undefined){
                        wx.reLaunch({
                            url: '/pages/empower_phone/empower_phone'
                        })
                    } 
                },
                fail: function() {
                    wx.showModal({
                        title: '警告',
                        content: '您点击了拒绝授权，将无法正常使用。请删除小程序重新进入，再次点击授权。',
                        success: function (res) {
                          if (res.confirm) {
                            console.log('用户点击确定')
                          }
                        }
                    })
                    // wx.reLaunch({
                    //     // url: '/pages/list/list?sessionid=' + sessionid
                    //     url: '/pages/list/list'
                    // })
                }
            })
            console.log(wx.getStorageSync('empower'),'99-----------99')
            let data = Object.assign({}, store, json)
            if (data.token == '') {
                //如果没有登录，设置storage
                // Util.setStorage({
                //     key:"app",
                //     data: data
                // })
                Util.setStorage('app', data)

            } else {
                // 如果是登录退出操作，则返回
                if (self.data.loginOut == 1) return

                let sessionid = data.sessionid

                Util.setStorage('app', data).then(() => {
                    Util.getStorage('app').then((res) => {
                        Util.ajax('user/info', 'get', res.data).then((data) => {
                            wx.setStorage({
                                key: 'user_info',
                                data: data
                            })
                            
                            let store = wx.getStorageSync('empower')
                            let nickName = store.nickName
                            if(nickName){
                                wx.reLaunch({
                                    // url: '/pages/list/list?sessionid=' + sessionid
                                    url: '/pages/list/list'
                                })
                            }
                            
                            self.hasRedDots()
                        }, () => {
                            wx.showModal({
                                title: '提示',
                                content: '未获取到当前用户信息',
                                showCancel: false
                            })
                        })
                    })
                })

            }

        }, () => {
            wx.showModal({
                title: '提示',
                content: '小程序初始化失败！',
                cancelShow: false
            })
        })

    },

    consoleLoginError(errText) {
        this.setData({
            hiddenErr: false,
            errMsg: errText
        })
        this.animation.opacity(1).step()
        this.setData({
            animationData: this.animation.export()
        })

        setTimeout(() => {
            this.animation.opacity(0).step({duration: 1000})
            this.setData({
                animationData: this.animation.export(),
            })
            setTimeout(() => {
                this.setData({
                    hiddenErr: true,
                })
            }, 1000)
        }, 2000)
    },

    getCode() {
        let store = wx.getStorageSync('app')
        this.setData({
            codeSrc: store.host + '/wxapi/vercode?t=' + new Date().getTime() + '&sessionid='+ store.sessionid
        })
    },

    handleLogin(e) {

        let self = this
       
        if (self.data.emailText.trim() == '' || !exp.test(self.data.emailText)) {
            wx.showModal({
				title: '提示',
				content: '邮箱格式不正确！',
				showCancel: false
			})
            return
        }

        if (self.data.passwordText.trim() == '') {
            wx.showModal({
				title: '提示',
				content: '密码不能为空！',
				showCancel: false
            })
            return
        }

        // ajax处理登录，成功后存储本地信息
        // 本地存储用户信息
        let store = wx.getStorageSync('app')

        let reqData = Object.assign({}, e.detail.value, {sessionid: store.sessionid})
        reqData.login_id = parseInt(reqData.login_id)
        wx.showLoading()
        Util.ajax('authentication', 'post', reqData).then(json => {
            self.setData({
                loginOut: ''
            })
            let stores = wx.getStorageSync('app')
            // stores.sessionId = res.data.data.sessionid
            let newStorage = Object.assign({}, stores, json)
            newStorage.login_id = parseInt(newStorage.login_id)
            Util.setStorage('app', newStorage)

            Util.ajax('user/info', 'get', json).then(json => {
                Util.setStorage('user_info', json)
                let store = wx.getStorageSync('empower')
                let nickName = store.nickName
                if(nickName){
                    wx.reLaunch({
                        // url: '/pages/list/list?id=' + newStorage.login_id
                        url: '/pages/list/list'
                    })
                }else{
                    wx.showModal({
                        title: '警告',
                        content: '您点击了拒绝授权，将无法正常使用。请删除小程序重新进入，再次点击授权。',
                        success: function (res) {
                          if (res.confirm) {
                            console.log('用户点击确定')
                          }
                        }
                    })
                } 
            }, res => {
                wx.showModal({
                    title: '提示',
                    content: '未获取到当前用户信息!',
                    showCancel: false
                })
            })
        }, res => {
            wx.showModal({
                title: '提示',
                content: res.data.msg,
                showCancel: false
            })
        })
        
    },

    clearInput(e) {
    	if (e.target.dataset.name == 'email') {
			this.setData({
				emailText: '',
				emailFocus: true,
			})
    	} else {
    		this.setData({
				passwordText: '',
				passwordFocus: true
			})
    	}
    },

    setShowClear(inputTextData, clearData) {
    	let o = {}

		if (this.data[inputTextData] != '') {
			o[clearData] = false
		} else {
			o[clearData] = true
		}

		this.setData(o)
    },

    handleInput(e) {
    	if (e.target.dataset.name == 'email') {
    		this.setData({
				emailText: e.detail.value,
			})
 			this.setShowClear('emailText', 'hiddenEmailClear')
    	} else {
    		this.setData({
				passwordText: e.detail.value,
			})
    		this.setShowClear('passwordText', 'hiddenPasswordClear')
    	}
    },

    handleFocus(e) {
    	if (e.target.dataset.name == 'email') {
 			this.setShowClear('emailText', 'hiddenEmailClear')
    	} else {
    		this.setShowClear('passwordText', 'hiddenPasswordClear')
    	}
    },

    handleBlur(e) {
    	if (e.target.dataset.name == 'email') {
			this.setData({
				hiddenEmailClear: true,
			})
    	} else {
    		this.setData({
				hiddenPasswordClear: true
			})
    	}
    },

    toForget() {
        wx.navigateTo({
            url: '/pages/forget/forget'
        })
    },

    toRegister() {
        wx.navigateTo({
            url: '/pages/register/register'
        })
    },

    hasRedDots() {
        let store = wx.getStorageSync('app')
        //获取当天零点的时间戳 
        const start = new Date(new Date(new Date().toLocaleDateString()).getTime());
        var timestampday = Date.parse(start); 
        timestampday = timestampday / 1000; 
        let reqData = Object.assign({}, {token: store.token},{login_id:store.login_id})
        reqData.new_time = timestampday
        var noticeList0 = []
        Util.ajax('notice', 'get', reqData).then(data => {
            var num
            var data0 = data.list?data.list:[]
            data0.map((item,i) => {
                item.count = 0
                    var thisItemData = wx.getStorageSync(store.login_id.toString()).noticeList0.find((v) => {
                        return v.id == item.project_id
                    })
                    if(thisItemData){
                        if(thisItemData.timestamp){
                            item.notice_content.forEach((v)=> {
                                if(v.created_at > thisItemData.timestamp){
                                    item.count += 1
                                    num = item.count
                                }
                            })
                        }
                    }
            })
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
    }

})