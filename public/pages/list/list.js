const app = getApp()

Page({
    data: {
        myProjectList: [],
        joinProjectList: [],
        animationData: {},
        searchText: '',
        searching: false,
        searchImg: app.data.staticImg.search,
        clearImg: app.data.staticImg.clear,
        hideClear: true,
        projectImg: app.data.staticImg.projectImg,
        listInfoWidth: 0,
        hiddenMy: false,
        tabOne: 'background: #4F3E4C;color: #fff;',
        tabTwo: '',
    },
    onLoad() {
        let that = this;
        wx.getSystemInfo({
            success: function (res) {
                // that.refresh()
                that.setData({
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
            console.log(res)
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
        wx.getStorage({
          key: 'app',
          success: function(res) {

                let store = res.data
                //发起网络请求，判断当前微信账号是否已经登录
                wx.request({
                    url: store.host + '/wxapi/init',
                    data: {
                      code: store.code
                    },
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
                                               
                                                self.initList()
                                            }
                                        })
                                    }
                                })

                            }

                            
                        } else {
                            self.consoleLoginError('初始化小程序失败')
                        }

                    }
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
                        myProjectList: res.data.data.list
                    })
                } else {

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
                        joinProjectList: res.data.data.list
                    })
                } else {

                }
            }
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
            tabOne: 'background: #4F3E4C;color: #fff;',
            tabTwo: '',
        })
    },

    showJoinProjects() {
        this.setData({
            hiddenMy: true,
            tabTwo: 'background: #4F3E4C;color: #fff;',
            tabOne: '',
        })
    },

    loadMoreMyProjects(){
        let data = this.data.joinProjectList
        this.setData({
          page: ++this.data.page
        })
        for(let i = 10 * (this.data.page - 1) + 1; i <= this.data.page * 10; i ++ ){
          data.push(i)
        }
        this.setData({
            joinProjectList: data,
        })
    },

    loadMoreJoinProjects(){
        let data = this.data.contentlist
        this.setData({
          page: ++this.data.page
        })
        for(let i = 10 * (this.data.page - 1) + 1; i <= this.data.page * 10; i ++ ){
          data.push(i)
        }
        this.setData({
            contentlist: data,
        })
    },

    toProject(e) {
        if (this.data.searching) {
            // setTimeout(() => {
            //     wx.navigateTo({
            //         url: '/pages/project_list/project_list?project_id=' + e.currentTarget.dataset.id
            //     })
            // }, 300)
            return;
        }
        wx.navigateTo({
          url: '/pages/project_list/project_list?project_id=' + e.currentTarget.dataset.id
        })
    },

    searchFocus(e) {
        if (this.data.searchText != '') {
            this.setData({
                hideClear: false,
            })
        }
        this.animation.width("100%").step()
        this.setData({
            animationData:this.animation.export()
        })
        setTimeout(() => {
            this.setData({
                searching: true
            })
        }, 500)
    },

    searchBlur() {
        this.animation.width(80).step()
        this.setData({
            animationData:this.animation.export(),
            searching: false,
            commentText: '',
            hideClear: true,
        })
    },

    searchInput(e) {
        this.setData({
            searchText: e.detail.value,
            hideClear: false
        })
    },

    clearSearch() {
        this.setData({
            searchText: '',
            hideClear: true,
        })
    },

    onShareAppMessage: function () {
	    return {
	        title: '转发',
	        path: '/pages/list/list?id=123',
            imageUrl: './xy.png'
	    }
	},


})