let Util = require('../../utils/util.js')
const app = getApp()

Page({
	data: {
		videoImg: app.data.staticImg.videoImg,
        dirImg: app.data.staticImg.dir,
		sx: app.data.staticImg.sx,
        tx: app.data.staticImg.manager,
		videoList: [],
        breadcrumbList: [],
        txList: [],
		liWidth: 0,
		scrollHeight: 0,
		page: 1,
        breadcrumbWidth: '',
        projectName: '',
        query: '',
        showBreadcrumb: false,
	},

	onLoad(options) {
		let self = this;
        wx.showLoading()

        wx.getSystemInfo({
            success: function (result) {
                self.setData({
                    liWidth: result.windowWidth - 160,
                    query: wx.createSelectorQuery(),
                    scrollHeight: result.windowHeight - 30
                })
                wx.setNavigationBarTitle({title: options.projectName})
                let wh = result.windowHeight
                let store = wx.getStorageSync('app')
                let reqData = Object.assign({}, store, options)
                wx.request({
                    url: store.host + '/wxapi/project/file',
                    data: reqData,
                    header: {
                        'content-type': 'application/json' // 默认值
                    },
                    method: 'get',
                    success: function(res) {
                        wx.hideLoading()
                        if (res.data.status == 1) {
                           
                            res.data.data.list.map(item => {
                                item.created_time = Util.getCreateTime(item.created_at)
                                let sec = item.project_file.time % 60
                                item.project_file.time = Util.timeToMinAndSec(item.project_file.time)
                                item.user_info.avatar = item.user_info.avatar == '' ? self.data.tx : item.user_info.avatar
                                item.size_text = (item.size / Math.pow(1024, 2)).toFixed(2)
                            })

                            self.setData({
                                videoList: res.data.data.list,
                                breadcrumbList: [{id: 0, name: options.projectName}],
                                projectName: options.projectName,
                                scrollHeight: result.windowHeight - 30,
                                breadcrumbWidth: 100
                            })
                            //  setTimeout(() => {
                            //     wx.createSelectorQuery().select('#join-member').fields({
                            //         dataset: true,
                            //         size: true,
                            //         scrollOffset: true,
                            //         properties: ['scrollX', 'scrollY']
                            //       }, function(res){
                            //           self.setData({
                            //             scrollHeight: wh - res.height
                            //           })
                            //       }).exec()
                            //  })
                        } else {
                            wx.showModal({
                              title: '提示',
                              content: '文件获取失败！',
                            })
                        }
                    }
                })

            }
        });
    },
    

    onShow() {
        let self = this
        // 获取参与成员头像姓名
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, store, {
            project_id: wx.getStorageSync('project_id')
        })
        wx.showLoading()
        wx.request({
            url: store.host + '/wxapi/member/project',
            data: reqData,
            header: {
                'content-type': 'application/json' // 默认值
            },
            method: 'get',
            success: function(res) {
                wx.hideLoading()
                if (res.data.status == 1) {
                    res.data.data.list.forEach(item => {
                        item.avatar = item.avatar == '' ? self.data.tx : item.avatar
                    })

                    self.setData({
                        txList: res.data.data.list
                    })
                } else {
                    wx.showModal({
                        title: '提示',
                        content: '获取成员头像失败！',
                    })
                }
            }
        })
    },

    selectFolder(e) {
        let self = this
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, store, {
            doc_id: e.currentTarget.dataset.id,
            project_id: wx.getStorageSync('project_id')
        })
         wx.showLoading()
         wx.request({
            url: store.host + '/wxapi/project/file',
            data: reqData,
            header: {
                'content-type': 'application/json' // 默认值
            },
            method: 'get',
            success: function(res) {
                wx.hideLoading()
                if (res.data.status == 1) {

                    res.data.data.list.map(item => {
                        item.created_time = Util.getCreateTime(item.created_at)
                        let sec = item.project_file.time % 60
                        item.project_file.time = Util.timeToMinAndSec(item.project_file.time)
                        item.user_info.avatar = item.user_info.avatar == '' ? self.data.tx : item.user_info.avatar
                    })

                    self.setData({
                        videoList: res.data.data.list,
                        breadcrumbList: [].concat([{id: 0, name: self.data.projectName}],res.data.data.breadcrumb),
                        breadcrumbWidth: 100 + res.data.data.breadcrumb * 100
                    })
                    if (e.currentTarget.dataset.id == 0) {
                        self.setData({
                            showBreadcrumb: false
                        })
                    } else {
                        self.setData({
                            showBreadcrumb: true
                        })
                    }                    
               
                } else {
                    wx.showModal({
                      title: '提示',
                      content: '文件获取失败！',
                    })
                }
            }
        })
    },

	toInfo(e) {
        let self = this
        if (e.currentTarget.dataset.type == 'folder') {
            self.selectFolder(e)
        } else {
            let video = self.data.videoList[e.currentTarget.dataset.index].project_file.resolution.reduce(function (item1,item2) {
                return item1.resolution > item2.resolution ? item1 : item2
            })
            
            let url = '/pages/info/info?url=' + video.src + '&name=' 
                + e.currentTarget.dataset.name + '&id=' + e.currentTarget.dataset.id 
                + '&username=' + e.currentTarget.dataset.username + '&createTime=' + e.currentTarget.dataset.createTime
                + '&coverImg=' + e.currentTarget.dataset.coverImg + '&projectId=' + wx.getStorageSync('project_id')

            // let url = '/pages/info/info?doc_id=' + e.currentTarget.dataset.id  + '&project_id' + wx.getStorageSync('project_id')
            wx.navigateTo({
                url: url
            })
        }
	},

	// loadMore() {
 //        let data = this.data.videoList
 //        this.setData({
 //          page: ++this.data.page
 //        })
 //        for(let i = 10 * (this.data.page - 1) + 1; i <= this.data.page * 10; i ++ ){
 //          data.push(i)
 //        }
 //        this.setData({
 //            videoList: data,
 //        })
 //    }

})