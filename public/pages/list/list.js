let Util = require('../../utils/util.js')
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

        Util.getSystemInfo().then(res => {
            self.setData({
                scrollHeight: res.windowHeight - 40,
                listInfoWidth: res.windowWidth - 110,
                liWidth: res.windowWidth - 110
            })

            let infoData = wx.getStorageSync('info_data')
            if (infoData != '') {
                setTimeout(() => {
                    let url = '/pages/info/info?url=' + infoData.url + '&name='
                    + infoData.name + '&id=' + infoData.doc_id
                    + '&username=' + infoData.username + '&createTime=' + infoData.createTime
                    + '&coverImg=' + infoData.coverImg + '&project_id=' + infoData.project_id
                    wx.navigateTo({
                        url: url
                    })
                }, 1000)
            }
        })
    },

    onShow() {
        let store = wx.getStorageSync('app')

        if (store.token == '') {
            wx.navigateTo({
                url: '/pages/signin/signin'
            })
        } else {
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

        Util.ajax('project', 'get', store).then(data => {
            let pros = []
            data.list.forEach(item => {
                if (item.type == 'admin') {
                    item.storage_size = item.storage_count != undefined ? (item.storage_count / Math.pow(1024, 2)).toFixed(2) : 0                            
                    //演示项目处理
                    item.storage_size = item.name == '演示项目' ? 166.29 : item.storage_size
                    item.file_count = item.name == '演示项目' ? '2' : item.file_count
                    pros.push(item)
                }
            })
            self.setData({
                myProjectList: pros,
                myProjectListTemp: pros
            })
            self.setAllProjects()

            wx.hideLoading()
        }, res => {

            wx.showModal({
                title: '提示',
                content: '获取我的项目失败,请重新登录！！',
                showCancel: false,
                success: function(res) {
                    if (res.confirm) {
                        wx.navigateTo({url: '/pages/signin/signin?login_out=1'})
                    }
                }
            })
        })

        Util.ajax('project/join', 'get', store).then(data => {
            data.list.forEach(item => {
                item.storage_size = item.storage_count != undefined ? (item.storage_count / Math.pow(1024, 2)).toFixed(2) : 0
            })
            self.setData({
                joinProjectList: data.list,
                joinProjectListTemp: data.list
            })
            self.setAllProjects()
            wx.hideLoading()
        }, (res) => {

            wx.showModal({
                title: '提示',
                content: '获取参与项目失败,请重新登录！！',
                showCancel: false,
                success: function(res) {
                    if (res.confirm) {
                        wx.navigateTo({url: '/pages/signin/signin?login_out=1'})
                    }
                }
            })
        })
    },

    setAllProjects() {
        let searchList = []
        let projectIds = []
        let searchFinalList = searchList.concat(this.data.myProjectList, this.data.joinProjectList)
        searchFinalList.forEach(v => {
            if (!v.project_number) {
                projectIds.push(v.id)
            } else {
                projectIds.push(v.project_number)                
            }
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
            return exp.test(item.name.toLowerCase())
        })

        let results2 = this.data.joinProjectListTemp.filter(item => {
            return exp.test(item.name.toLowerCase())
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
	        title: '影音制作链接者',
	        path: '/pages/list/list',
            imageUrl: './img/xy2.jpg'
	    }
	}
})