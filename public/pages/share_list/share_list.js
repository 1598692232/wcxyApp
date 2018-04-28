let Util = require('../../utils/util.js')
const app = getApp()
const PRE_PAGE = 10;

Page({
    data: {
        scrollHeight: 0,
        shareList: [],
        projectID: 0,
        tx: app.data.staticImg.manager,
        page: 1,
        pageSize: 10,
        hasMoreData: true,
    },
    onLoad(options) {
        let self = this;
        self.setData({
            projectID:options.project_id
        })
        Util.getSystemInfo().then(result => {
            self.setData({
                scrollHeight: result.windowHeight,
            })
            wx.setNavigationBarTitle({title: '分享记录'})
        })
    },
    onShow() {
        let self = this
        wx.showLoading()
        self.getShareList()
    },
    getShareList(){
        let self = this
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, {token: store.token},{login_id:store.login_id})
        reqData.project_id = self.data.projectID
        reqData.page = self.data.page
        reqData.pre_page = PRE_PAGE
        let getList = (reqData,doCommentAjaxing,fn)=>{
            return Util.ajax('sharelink/list', 'get',reqData).then(data => {
                if (doCommentAjaxing) {
                    this.commentAjaxing = false;
                }
                data.list.map(item => {
                    item.avatar = item.avatar == '' ? self.data.tx : item.avatar
                    item.createtime = Util.getCreateTime(item.created_at)
                    item.image = item.share_img
                    item.number = item.files_count
                    item.firstname = item.name.slice(0,1)
                })
                // self.setData({
                //     shareList: data.list
                // })
                fn(data.list); 
                
            }, res => {
                if (doCommentAjaxing) {
                    this.commentAjaxing = false;
                }
            })
        }
        wx.hideLoading()
        if (this.commentAjaxing || this.commentGeted) { 
            return;
        }
        this.commentAjaxing = true
        getList(reqData, true, (list) => {
            let shareList = self.data.shareList.concat(list);
            if (list.length < PRE_PAGE) {
                self.commentGeted = true;
                self.setData({
                    hasMoreData: false
                })
            }
            self.setData({
                shareList,
                page: list.length < PRE_PAGE ? self.data.page : ++self.data.page
            })
        });
        
    },
    toShareInfo(e){
        let count = e.currentTarget.dataset.count
        if(count === 0){
            wx.showModal({
                title: '提示',
                content: '该链接文件已全部被移除！',
                showCancel: false
            });
            return;
        }
        wx.navigateTo({
            url: '/pages/share_list_view/share_list_view?code=' + e.currentTarget.dataset.code 
            + '&password=' + e.currentTarget.dataset.password + '&id=' + e.currentTarget.dataset.id
        })
    },
     // 页面上拉触底事件的处理函数
     lower(){
        let self = this
        let store = wx.getStorageSync('app')
        let params = Object.assign({}, {token: store.token},{login_id:store.login_id},{
            project_id: self.data.projectId,
            page: self.data.page,
            pre_page: PRE_PAGE
        })

        self.getShareList(params);
    },
})