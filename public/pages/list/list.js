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
        currentTab:0,
        systemNotification: false
    },

    onLoad() {
        let self = this
        wx.showLoading()

        Util.getSystemInfo().then(res => {
            self.setData({
                scrollHeight: res.windowHeight - 74,
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
    //滑动切换
    swiperTab(e){
        this.setData({
            currentTba:e.detail.current
        })
    },
    //点击切换
    clickTab(e) {
        let self = this
        if( self.data.currentTab === e.target.dataset.current ) {  
            return false;  
        } else { 
            self.setData({
                currentTab: e.target.dataset.current  
            })
        } 
    },
    onShow() {
        this.setData({
            systemNotification: wx.getStorageSync('notification')
        })
        this.hasRedDots()
        let store = wx.getStorageSync('app')

        // if (store.token == '') {
            // wx.navigateTo({
            //     url: '/pages/signin/signin'
            // })
        // } else {
            // 评论输入框动画注册
            let animation = wx.createAnimation({
                duration: 300,
                timingFunction: 'ease',
            })

            let self = this

            self.animation = animation

            self.initList()
        // }

        
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
                item.first_name = item.name.substr(0, 1)
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

            // wx.showModal({
            //     title: '提示',
            //     content: '获取我的项目失败,请重新登录！！',
            //     showCancel: false,
            //     success: function(res) {
            //         if (res.confirm) {
            //             wx.navigateTo({url: '/pages/signin/signin?login_out=1'})
            //         }
            //     }
            // })
        })

        Util.ajax('project/join', 'get', store).then(data => {
            data.list.forEach(item => {
                item.first_name = item.name.substr(0, 1)
                item.storage_size = item.storage_count != undefined ? (item.storage_count / Math.pow(1024, 2)).toFixed(2) : 0
            })
            self.setData({
                joinProjectList: data.list,
                joinProjectListTemp: data.list
            })
            self.setAllProjects()
            wx.hideLoading()
        }, (res) => {

            // wx.showModal({
            //     title: '提示',
            //     content: '获取参与项目失败,请重新登录！！',
            //     showCancel: false,
            //     success: function(res) {
            //         if (res.confirm) {
            //             wx.navigateTo({url: '/pages/signin/signin?login_out=1'})
            //         }
            //     }
            // })
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
        wx.setStorage({
            key: 'project_name',
            data: e.currentTarget.dataset.name
        })
        wx.navigateTo({
          url: '/pages/project_list/project_list?project_id=' + e.currentTarget.dataset.id + '&projectName=' + e.currentTarget.dataset.name
          + '&project_type=' + e.currentTarget.dataset.type
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
	        title: '影音制作连接者',
	        path: '/pages/empower_signin/empower_signin',
            imageUrl: './img/xy2.jpg'
	    }
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
                var arr = wx.getStorageSync(store.login_id.toString()).noticeList0?wx.getStorageSync(store.login_id.toString()).noticeList0:[]
                    var thisItemData = arr.find((v) => {
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
            // console.log(num,'num')
            if(num>0||!this.data.systemNotification){
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
    // 跳转至系统消息详情
    toSystemInfo() {
        wx.setStorage({
            key:"notification",
            data:"true"
        })
        this.setData({
            systemNotification: wx.getStorageSync('notification')
        })
        wx.navigateTo({
            url: '/pages/notice_system_info/notice_system_info?t=1'
        })
    },
    // 关闭系统消息的弹窗
    toKnow() {
        // this.setData({
        //     systemNotification: true
        // })
        wx.setStorage({
            key:"notification",
            data:"true"
        })
        this.setData({
            systemNotification: wx.getStorageSync('notification')
        })
    },
})