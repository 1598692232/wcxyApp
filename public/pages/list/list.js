const app = getApp()

Page({
    data: {
        myProjectList: [],
        joinProjectList: [],
        myProjectListTemp: [],
        joinProjectListTemp: [],

        animationData: {},
        searchText: '',
        // searching: false,
        searchImg: app.data.staticImg.search,
        clearImg: app.data.staticImg.clear,
        hideClear: true,
        projectImg: app.data.staticImg.projectImg,
        listInfoWidth: 0,
        hiddenMy: false,
        tabOne: 'background: #5b53ff;color: #fff;',
        tabTwo: '',
    },

    onLoad() {
        let self = this
        wx.showLoading()
        wx.getSystemInfo({
            success: function (res) {
                // that.refresh()
                self.setData({
                    scrollHeight: res.windowHeight - 40,
                    listInfoWidth: res.windowWidth - 110,
                });
            }
        });
    },

    onShow() {
        // 评论输入框动画注册
        let animation = wx.createAnimation({
            duration: 300,
            timingFunction: 'ease',
        })

        let self = this

        self.animation = animation

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
        });
    },



    isLoginforHandle() {
        let self = this

         
        //获取存储的code

            let store = wx.getStorageSync('app')


            //发起网络请求，判断当前微信账号是否已经登录
            wx.request({
                url: store.host + '/wxapi/init',
                data: {
                  code: store.code
                },
                header: {
                    'content-type': 'application/json' // 默认值
                },
                method: 'get',
                success(res) {
            
                    if (res.data.status == 1) {

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
                        } else {
                            //如果已经登录，设置storage，初始化列表页
                            wx.setStorage({
                                key:"app",
                                data: data,
                                success() {
                                    wx.getStorage({
                                        key:'app',
                                        success(res) {
                                            wx.request({
                                              url: store.host + '/wxapi/user/info',
                                              data: res.data,
                                              success(res) {
                                                if (res.data.status == 1) {
                                                    wx.setStorage({
                                                        key: 'user_info',
                                                        data: res.data.data
                                                    })
                                                } else {
                                                    wx.showModal({
                                                      title: '提示',
                                                      content: '未获取到当前用户信息',
                                                    })
                                                }
                                              }
                                            })
                                           
                                            self.initList()
                                        }
                                    })
                                }
                            })

                        }

                        
                    } else {
                        self.consoleLoginError('初始化小程序失败')
                    }

                },
                fail(res) {
                    let rs = JSON.stringify(res)
                    wx.showModal({
                      title: '提示',
                      content: rs,
                    })
                }
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


    //初始化列表页
    initList() {
        let store = wx.getStorageSync('app')
        let self = this

        wx.request({
            // url: store.host + '/wxapi/project', //仅为示例，并非真实的接口地址
            url: store.host + '/wxapi/project',
            data: store,
            header: {
                'content-type': 'application/json' // 默认值
            },
            method: 'get',
            success: function(res) {
                if (res.data.status == 1) {
                    self.setData({
                        myProjectList: res.data.data.list,
                        myProjectListTemp: res.data.data.list
                    })
                    self.setAllProjects()
                    wx.hideLoading()
                } else {
                    wx.showModal({
                      title: '提示',
                      content: '获取我的项目失败！',
                    })
                }
            }
        })


        wx.request({
            // url: store.host + '/wxapi/project', //仅为示例，并非真实的接口地址
            url: store.host + '/wxapi/project/join',
            data: store,
            header: {
                'content-type': 'application/json' // 默认值
            },
            method: 'get',
            success: function(res) {
                if (res.data.status == 1) {
                    self.setData({
                        joinProjectList: res.data.data.list,
                        joinProjectListTemp: res.data.data.list
                    })
                    self.setAllProjects()
                    wx.hideLoading()
                } else {
                    wx.showModal({
                      title: '提示',
                      content: '获取参与项目失败！',
                    })
                }
            }
        })
    },

    setAllProjects() {
        let searchList = []
        let searchFinalList = searchList.concat(this.data.myProjectList, this.data.joinProjectList)
        this.setData({
            searchList: searchFinalList
        })
    },

    refresh(e) {
        var self = this;

        // wx.startPullDownRefresh()
        // setTimeout(() => {
        //     let data = []
        //     self.setData({
        //       page: 1
        //     })
        //     for(let i = 1; i <= 10; i ++ ){
        //       data.push(i)
        //     }
        //     self.setData({
        //         contentlist: data,
        //     })
        //     // wx.stopPullDownRefresh()
        // }, 1000)
    },


    onPullDownRefresh() {
        console.log("下拉")
    },

    // onReachBottom: function() {
    //    let data = this.data.contentlist
    //     this.setData({
    //       page: ++this.data.page
    //     })
    //     for(let i = 10 * (this.data.page - 1) + 1; i <= this.data.page * 10; i ++ ){
    //       data.push(i)
    //     }
    //     this.setData({
    //         contentlist: data,
    //     })
    // },

    showMyProjects() {
        this.setData({
            hiddenMy: false,
            tabOne: 'background: #5b53ff;color: #fff;',
            tabTwo: '',
        })
    },

    showJoinProjects() {
        this.setData({
            hiddenMy: true,
            tabTwo: 'background: #5b53ff;color: #fff;',
            tabOne: '',
        })
    },

    // loadMoreMyProjects(){
    //     let data = this.data.joinProjectList
    //     this.setData({
    //       page: ++this.data.page
    //     })
    //     for(let i = 10 * (this.data.page - 1) + 1; i <= this.data.page * 10; i ++ ){
    //       data.push(i)
    //     }
    //     this.setData({
    //         joinProjectList: data,
    //     })
    // },

    // loadMoreJoinProjects(){
    //     let data = this.data.contentlist
    //     this.setData({
    //       page: ++this.data.page
    //     })
    //     for(let i = 10 * (this.data.page - 1) + 1; i <= this.data.page * 10; i ++ ){
    //       data.push(i)
    //     }
    //     this.setData({
    //         contentlist: data,
    //     })
    // },

    toProject(e) {
        wx.setStorage({
            key: 'project_id',
            data: e.currentTarget.dataset.id
        })
        wx.navigateTo({
          url: '/pages/project_list/project_list?project_id=' + e.currentTarget.dataset.id + '&projectName=' + e.currentTarget.dataset.name
        })
    },

    searchFocus(e) {
        setTimeout(() => {
            if (this.data.searchText != '') {
                this.setData({
                    hideClear: false,
                })
            }
        }, 500)
        
        if (!this.data.searching) {
            this.animation.width("100%").step()
            this.setData({
                animationData:this.animation.export(),
                searching: true
            })
        }
    },

    searchBlur() {
        this.animation.width(80).step()

        this.setData({
            animationData:this.animation.export(),
            searching: false,
            hideClear: true
        })
    },

    searchInput(e) {
        if (e.detail.value == '') {
            this.setData({
                hideClear: true,
                searchText: '',
                myProjectList: this.data.myProjectListTemp,
                joinProjectList: this.data.joinProjectListTemp,
            })
            return
        }
        this.setData({
            searchText: e.detail.value,
            hideClear: false
        })
        let exp = new RegExp(e.detail.value)
      
        let results1 = this.data.myProjectListTemp.filter(item => {
            return exp.test(item.name)
        })

        let results2 = this.data.joinProjectListTemp.filter(item => {
            return exp.test(item.name)
        })
      
        this.setData({
            myProjectList: results1,
            joinProjectList: results2,
        })

    },

    clearSearch() {
        this.setData({
            searchText: '',
            hideClear: true,
            myProjectList: this.data.myProjectListTemp,
            joinProjectList: this.data.joinProjectListTemp,
        })
    },

    onShareAppMessage: function () {
	    return {
	        title: 'XINYUE新阅',
	        path: '/pages/list/list',
            imageUrl: './xy.png'
	    }
	},


})