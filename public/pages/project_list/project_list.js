const app = getApp()

Page({
	data: {
		videoImg: app.data.staticImg.videoImg,
		sx: app.data.staticImg.sx,
		manager: app.data.staticImg.manager,
		videoList: [],
		liWidth: 0,
		scrollHeight: 0,
		page: 1,
	},

	onLoad(options) {
		let self = this;
        console.log(options, 887766)
        wx.getSystemInfo({
            success: function (res) {
                self.setData({
                	scrollHeight: res.windowHeight,
                    liWidth: (res.windowWidth - 30) / 2
                })

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
                        console.log(res, 5544)
                        if (res.data.status == 1) {
                            self.setData({
                                videoList: res.data.data.list
                            })
                        } else {

                        }
                    }
                })

            }
        });
	},

	toInfo() {
       	wx.navigateTo({
          url: '/pages/info/info?id=1'
    	})

        // wx.redirectTo({
        //   url: 'pages/project_list/project_list'
        // })
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