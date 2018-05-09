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
        systemCount: 0,
        popupArr: [],
        popupTitle: '',
        noticeListInfo: [],
        popupShow: true,
        isSystem: 0,
        accountInfo: '',
        grade: '',
        storage_max: '',
        project_max: '',
        member_max: '',
        time_at: '',
        systemNotification: false,
        scrollY: 0,
        delTouching: false,
        tsx: '',
        tsy: '',
        tex: '',
        showDel: false,
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
                    let url = 'url=' 
                    + infoData.url + '&name='
                    + infoData.name + '&id=' + infoData.doc_id
                    + '&username=' + infoData.username + '&createTime=' + infoData.createTime
                    + '&coverImg=' + infoData.coverImg + '&project_id=' + infoData.project_id
                    let newurl = encodeURIComponent(url)
                    let tourl = '/pages/info/info?scene=' + newurl
                    wx.navigateTo({
                        url:tourl,
                    })

                    // let url = '/pages/info/info?url=' + infoData.url + '&name='
                    // + infoData.name + '&id=' + infoData.doc_id
                    // + '&username=' + infoData.username + '&createTime=' + infoData.createTime
                    // + '&coverImg=' + infoData.coverImg + '&project_id=' + infoData.project_id
                    // wx.navigateTo({
                    //     url: url
                    // })
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
                let grade = ""
                switch(data.content.vip_name) {
                    case "一级会员":
                        grade = 1
                        break
                    case "二级会员":
                        grade = 2
                        break
                    case "三级会员":
                        grade = 3
                        break
                    case "四级会员":
                        grade = 4
                        break
                }
                self.setData({
                    noticeListInfo: data.content.list,
                    popupTitle: data.content_name,
                    isSystem: data.type,
                    accountInfo: data.content,
                    grade: grade,
                    storage_max: data.content.storage_max,
                    project_max: data.content.project_max =="不限制的"?data.content.project_max:data.content.project_max+"个",
                    member_max: data.content.member_max =="不限制的"?data.content.member_max:data.content.member_max+"个",
                    time_at: data.content.time_at
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
    // 跳转至系统消息详情
    toSystemInfo(e) {
        let self = this
        var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        // 点击时设置时间戳
        let store = wx.getStorageSync('app')
        var sumData = wx.getStorageSync(store.login_id.toString())
        var userItem = sumData.noticeList0.find((v) => {
            return v.id == -1
        })
        userItem.timestamp = timestamp
        wx.setStorageSync(store.login_id.toString(), sumData)

        let content_id = self.data.popupArr[0]?self.data.popupArr[0].id:0
        wx.navigateTo({
            url: '/pages/notice_system_info/notice_system_info?content_id='+ content_id
        })
        this.setData({
            popupShow: false
        })
    },
    // 关闭系统消息的弹窗
    toKnow() {
        var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        // 点击时设置时间戳
        let store = wx.getStorageSync('app')
        var sumData = wx.getStorageSync(store.login_id.toString())
        var userItem = sumData.noticeList0.find((v) => {
            return v.id == -1
        })
        userItem.timestamp = timestamp
        wx.setStorageSync(store.login_id.toString(), sumData)
        this.setData({
            popupShow: false
        })
    },
    recordStart: function (e) {
      this.data.myProjectList.map(item => {
        item.translateX = ''
        item.delTranstion = ''
      })

      this.setData({
        tsx: e.touches[0].clientX,
        tsy: e.touches[0].clientY,
        delTouching: true
      })
    },
    recordMove: function (e) {
      let tmx = e.touches[0].clientX
      let tmy = e.touches[0].clientY
      let moveX = tmx - this.data.tsx
      if (!this.data.delTouching || Math.abs(tmy - this.data.tsy) > 5) return

      if (!this.data.showDel) {
        if (moveX > 0) return
        if (moveX < -100) {

          moveX = -100
        }
        this.data.myProjectList[e.currentTarget.dataset.index].translateX = moveX
        this.setData({
          myProjectList: this.data.myProjectList,
          tex: tmx
        })
      } else {
        if (moveX < 0) return

        if (moveX > 100) {
          moveX = 0
        }

        this.data.myProjectList[e.currentTarget.dataset.index].translateX = moveX
        this.setData({
          myProjectList: this.data.myProjectList,
          tex: tmx
        })
      }
    },
    recordEnd: function (e) {
      if (!this.data.delTouching) return

      this.setData({
        delTouching: false
      })

      if (this.data.myProjectList[e.currentTarget.dataset.index].translateX < -15) {
        this.data.myProjectList[e.currentTarget.dataset.index].translateX = -90
        this.data.myProjectList[e.currentTarget.dataset.index].delTranstion = 'del-transtion'
        this.setData({
          myProjectList: this.data.myProjectList,
          showDel: true,
        })
      } else {
        this.data.myProjectList[e.currentTarget.dataset.index].translateX = 0
        this.data.myProjectList[e.currentTarget.dataset.index].delTranstion = 'del-transtion'
        this.setData({
          myProjectList: this.data.myProjectList,
          showDel: false
        })
      }

      setTimeout(() => {
        if (this.data.myProjectList.length == 0 ||
          this.data.myProjectList[e.currentTarget.dataset.index].delTranstion == undefined) return
        this.data.myProjectList[e.currentTarget.dataset.index].delTranstion = 0
        this.setData({
          myProjectList: this.data.myProjectList,
        })
      }, 300)
    },
    showSettingBtn(index, moveX, duration = 370) {
      var animation = wx.createAnimation({ duration: duration });
      this.data.myProjectList[index].animation = animation;
    },
    toSetting:function (e) {
      let url = "/pages/project_setting/setting?operate=" + e.currentTarget.dataset.operate;
      let data = this.data.myProjectList[e.currentTarget.dataset.index];
      wx.setStorage({
        key: 'settingProjectData',
        data: data,
      })
      if (e.currentTarget.dataset.operate == 'modify') {
        url += '&projectId=' + e.currentTarget.dataset.id + '&projectName=' + e.currentTarget.dataset.name  ;
      }
      wx.navigateTo({
        url: url
      })
    }
})