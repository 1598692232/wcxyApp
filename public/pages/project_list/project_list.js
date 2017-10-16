const app = getApp()

Page({
	data: {
		videoImg: app.data.staticImg.videoImg,
		sx: app.data.staticImg.sx,
		manager: app.data.staticImg.manager,
		videoList: [1,2,3,4,5,6,7,9,10,11,12,13],
		liWidth: 0,
		scrollHeight: 0,
		page: 1,
	},

	onLoad() {
		let that = this;
        console.log(121323)
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                	scrollHeight: res.windowHeight,
                    liWidth: (res.windowWidth - 30) / 2
                });
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