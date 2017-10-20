var Util = require('../../utils/util.js')
const app = getApp()

Page({
	data: {
		videoImg: app.data.staticImg.videoImg,
        dirImg: app.data.staticImg.dir,
		sx: app.data.staticImg.sx,
		manager: app.data.staticImg.manager,
		videoList: [],
        breadcrumbList: [],
		liWidth: 0,
		scrollHeight: 0,
		page: 1,
        breadcrumbWidth: '',
        projectName: ''
	},

	onLoad(options) {
		let self = this;

        // console.log(Util.getCreateTime(1507867114))
        wx.getSystemInfo({
            success: function (result) {
                self.setData({
                    liWidth: (result.windowWidth - 30) / 2,

                })
                wx.setNavigationBarTitle({title: options.projectName})

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
                        if (res.data.status == 1) {
                            res.data.data.list.map(item => {
                                item.created_time = Util.getCreateTime(item.created_at)
                                let sec = item.project_file.time % 60
                                item.project_file.time = Util.timeToMinAndSec(item.project_file.time)
                                item.user_info.avatar = item.user_info.avatar == '' ? self.data.manager : item.user_info.avatar

                            })

                            self.setData({
                                videoList: res.data.data.list,
                                breadcrumbList: [{id: 0, name: options.projectName}],
                                projectName: options.projectName,
                                scrollHeight: result.windowHeight - 30,
                                breadcrumbWidth: 100
                            })
                            console.log(self.data.scrollHeight)
                        } else {

                        }
                    }
                })

            }
        });
	},

    selectFolder(e) {
        let self = this
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, store, {
            doc_id: e.currentTarget.dataset.id,
            project_id: wx.getStorageSync('project_id')
        })
         wx.request({
            url: store.host + '/wxapi/project/file',
            data: reqData,
            header: {
                'content-type': 'application/json' // 默认值
            },
            method: 'get',
            success: function(res) {
                console.log(res, "pl999")
                if (res.data.status == 1) {

                    res.data.data.list.map(item => {
                        item.created_time = Util.getCreateTime(item.created_at)
                        let sec = item.project_file.time % 60
                        item.project_file.time = Util.timeToMinAndSec(item.project_file.time)
                        item.user_info.avatar = item.user_info.avatar == '' ? self.data.manager : item.user_info.avatar
                    })

                    self.setData({
                        videoList: res.data.data.list,
                        breadcrumbList: [].concat([{id: 0, name: self.data.projectName}],res.data.data.breadcrumb),
                        breadcrumbWidth: 100 + res.data.data.breadcrumb * 100
                    })
                } else {

                }
            }
        })
    },

	toInfo(e) {
        let self = this
        if (e.currentTarget.dataset.type == 'folder') {
            self.selectFolder(e)
        } else {
            let url = '/pages/info/info?url=' + e.currentTarget.dataset.url + '&name=' 
                + e.currentTarget.dataset.name + '&id=' + e.currentTarget.dataset.id 
                + '&username=' + e.currentTarget.dataset.username + '&createTime=' + e.currentTarget.dataset.createTime
                + '&coverImg=' + e.currentTarget.dataset.coverImg 
            wx.navigateTo({
                url: url
            })
        }
	},

	loadMore() {
        let data = this.data.videoList
        this.setData({
          page: ++this.data.page
        })
        for(let i = 10 * (this.data.page - 1) + 1; i <= this.data.page * 10; i ++ ){
          data.push(i)
        }
        this.setData({
            videoList: data,
        })
    }

})