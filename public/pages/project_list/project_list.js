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
        txFiveList: [],
		liWidth: 0,
        scrollHeight: 0,
        scrollNumberHeight: 0,
		page: 1,
        breadcrumbWidth: '',
        projectName: '',
        query: '',
        showBreadcrumb: false,
        showMemberDrop: false,
        showShare: false,
        selectShare: false,
        selectShareList: []
	},

	onLoad(options) {
		let self = this;
        wx.showLoading()
        Util.getSystemInfo().then(result => {
            self.setData({
                liWidth: result.windowWidth - 160,
                query: wx.createSelectorQuery(),
                scrollHeight: result.windowHeight,
                scrollNumberHeight: result.windowHeight-263
            })
            wx.setNavigationBarTitle({title: options.projectName})

            let wh = result.windowHeight
            let store = wx.getStorageSync('app')
            let reqData = Object.assign({}, store, options)

            Util.ajax('project/file', 'get', reqData).then(json => {
                json.list.map(item => {
                    item.created_time = Util.getCreateTime(item.created_at)
                    let sec = item.project_file.time % 60
                    item.project_file.time = Util.timeToMinAndSec(item.project_file.time)
                    item.user_info.avatar = item.user_info.avatar == '' ? self.data.tx : item.user_info.avatar
                    item.size_text = (item.size / Math.pow(1024, 2)).toFixed(2)
                    item.selected = false
                })

                self.setData({
                    videoList: json.list,
                    breadcrumbList: [{id: 0, name: options.projectName}],
                    projectName: options.projectName,
                    scrollHeight: result.windowHeight,
                    scrollNumberHeight: result.windowHeight-263,
                    breadcrumbWidth: 100
                })
            }, res => {
                wx.showModal({
                    title: '提示',
                    content: '文件获取失败！',
                })
            })
           
        })
    },
    

    onShow() {
        let self = this
        // 获取参与成员头像姓名
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, store, {
            project_id: wx.getStorageSync('project_id')
        })
        wx.showLoading()
        Util.ajax('member/project', 'get', reqData).then(json => {
            json.list.forEach(item => {
                item.avatar = item.avatar == '' ? self.data.tx : item.avatar
            })

            self.setData({
                txList: json.list,
                txFiveList: json.list.slice(0,5)
            })
        }, res => {
            wx.showModal({
                title: '提示',
                content: '获取成员头像失败！',
                showCancel: false
            })
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
         Util.ajax('project/file', 'get', reqData).then(json => {
            json.list.map(item => {
                item.created_time = Util.getCreateTime(item.created_at)
                let sec = item.project_file.time % 60
                item.project_file.time = Util.timeToMinAndSec(item.project_file.time)
                item.user_info.avatar = item.user_info.avatar == '' ? self.data.tx : item.user_info.avatar
                item.size_text = (item.size / Math.pow(1024, 2)).toFixed(2)  
                item.selected = false                      
            })

            self.setData({
                videoList: json.list,
                breadcrumbList: [].concat([{id: 0, name: self.data.projectName}],json.breadcrumb),
                breadcrumbWidth: 100 + json.breadcrumb.length * 100
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
            wx.setNavigationBarTitle({title: self.data.breadcrumbList.pop().name})          
         }, res => {
            wx.showModal({
                title: '提示',
                content: '文件获取失败！',
                showCancel: false
            })
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
            
            // let url = '/pages/info/info?url=' + video.src + '&name=' 
            //     + e.currentTarget.dataset.name + '&id=' + e.currentTarget.dataset.id 
            //     + '&username=' + e.currentTarget.dataset.username + '&createTime=' + e.currentTarget.dataset.createTime
            //     + '&coverImg=' + e.currentTarget.dataset.coverImg + '&project_id=' + wx.getStorageSync('project_id')

            let url = '/pages/info/info?&name=' 
            + e.currentTarget.dataset.name + '&id=' + e.currentTarget.dataset.id 
            + '&username=' + e.currentTarget.dataset.username
            + '&project_id=' + wx.getStorageSync('project_id')
            wx.navigateTo({
                url: url,
            })
        }
    },
    toMemberList(e) {
        let self = this
        self.setData({
            showMemberDrop: true
        })
    },
    MembertoProject(e) {
        let self = this
        self.setData({
            showMemberDrop: false
        })
    },
    toShareList(e) {
        wx.navigateTo({
            url: '/pages/share_list/share_list'
        })
    },
    toCreateShare(e) {
        let self = this
        self.setData({
            showShare: true
        })       
    },
    toSelectShare(e) {
        let self = this
        // 给遍历的数组videoList添加属性selected是否被选中
        e.currentTarget.dataset.selected = !e.currentTarget.dataset.selected
        this.setData({
            videoList:setSelectedVideo(self.data.videoList, e.currentTarget.dataset.id)
        })
        function setSelectedVideo(arr,id){
           var selectedVideo = arr.find(v => v.id ==id)
           selectedVideo.selected = !selectedVideo.selected
           return arr
        }
        // console.log(self.data.videoList.map(v=>v.selected),'---6666')

        // 得到选择的数组id
        function deleteArr(arr,index) {
            arr.splice(index,1)
            return arr
        }
        self.setData({
            selectShareList: (self.data.selectShareList.indexOf(e.currentTarget.dataset.id) === -1)?self.data.selectShareList.concat(e.currentTarget.dataset.id):deleteArr(self.data.selectShareList,self.data.selectShareList.findIndex((v)=>{return v === e.currentTarget.dataset.id})),
        })
        // self.setData({
        //     selectShare: (self.data.selectShareList.indexOf(e.currentTarget.dataset.id) === -1) ? false:true
        // })

        // console.log(self.data.selectShareList,'id-list')
    },
    toCloseCreateShare(e) {
        let self = this
        self.setData({
            showShare: false,
            // selectShareList: []
        })
        // self.data.videoList.map(v=>v.selected=false)
    },
    toCreateShareList(e) {
        let self = this
        wx.navigateTo({
            url: '/pages/share_create/share_create'
        })
    }

})