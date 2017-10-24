const app = getApp()

Page({
    data: {
        myProjectList: [],
        joinProjectList: [],
        myProjectListTemp: [],
        joinProjectListTemp: [],
        animationData: {},
        searchText: '',
        searchImg: app.data.staticImg.search,
        clearImg: app.data.staticImg.clear,
        hideClear: true,
        projectImg: app.data.staticImg.projectImg,
        listInfoWidth: 0,
        hiddenMy: false,
        tabOne: 'background: #0036df;color: #fff;',
        tabTwo: '',
    },

    onLoad() {
        let self = this
        wx.showLoading()

        wx.getSystemInfo({
            success: function (res) {
                self.setData({
                    scrollHeight: res.windowHeight - 40,
                    listInfoWidth: res.windowWidth - 110,
                })

                let infoData = wx.getStorageSync('info_data')
                if (infoData != '') {
                    let url = '/pages/info/info?url=' + infoData.url + '&name='
                        + infoData.name + '&id=' + infoData.doc_id
                        + '&username=' + infoData.username + '&createTime=' + infoData.createTime
                        + '&coverImg=' + infoData.coverImg 
                    wx.navigateTo({
                        url: url
                    })
                }
            }
        });
    },

    onShow() {

        let store = wx.getStorageSync('app')

        if (store.token == '') {
            console.log(111)
            wx.navigateTo({
                url: '/pages/signin/signin'
            })
        } else {
console.log(2222)
            // 评论输入框动画注册
            let animation = wx.createAnimation({
                duration: 300,
                timingFunction: 'ease',
            })

            let self = this

            self.animation = animation

            self.initList()
        }
        

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
                      showCancel: false
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
                      showCancel: false
                    })
                }
            }
        })
    },

    setAllProjects() {
        let searchList = []
        let projectIds = []
        let searchFinalList = searchList.concat(this.data.myProjectList, this.data.joinProjectList)
        searchFinalList.forEach(v => {
            projectIds.push(v.id)
        })
        wx.setStorage({
            key: 'project_ids',
            data: projectIds
        })
        this.setData({
            searchList: searchFinalList
        })
    },

    showMyProjects() {
        this.setData({
            hiddenMy: false,
            tabOne: 'background: #0036df;color: #fff;',
            tabTwo: '',
        })
    },

    showJoinProjects() {
        this.setData({
            hiddenMy: true,
            tabTwo: 'background: #0036df;color: #fff;',
            tabOne: '',
        })
    },

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