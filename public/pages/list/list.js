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
        wx.getStorage({
		  key: 'app',
		  success: function(res) {
                if (res.data.token == '') {
                    wx.reLaunch({
                      url: '/pages/signin/signin?id=1'
                    })
                    return
                }

                let store = wx.getStorageSync('app')

                wx.request({
                    // url: store.host + '/wxapi/project', //仅为示例，并非真实的接口地址
                    url: store.host + '/wxapi/project',
                    data: store,
                    header: {
                        'content-type': 'application/json' // 默认值
                    },
                    method: 'get',
                    success: function(res) {
                        console.log(res)
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
                        console.log(res)
                        if (res.data.status == 1) {
                            self.setData({
                                joinProjectList: res.data.data.list
                            })
                        } else {

                        }
                    }
                })
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
        console.log(e, 999)
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