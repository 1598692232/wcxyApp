let Util = require('../../utils/util.js')
const app = getApp()
const PRE_PAGE = 10;

Page({
    data: {
        scrollHeight: 0,
        projectID: 0,
        tx: app.data.staticImg.manager,
        page: 1,
        pageSize: 10,
        hasMoreData: true,
        currentTab: 0,
        collectionList: []
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
            wx.setNavigationBarTitle({title: '收藏夹'})
        })
    },
    onShow() {
        let self = this
        wx.showLoading()
        self.getCollectionList()
    },
    getCollectionList(){
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
            let collectionList = self.data.collectionList.concat(list);
            if (list.length < PRE_PAGE) {
                self.commentGeted = true;
                self.setData({
                    hasMoreData: false
                })
            }
            self.setData({
                collectionList,
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

        self.getCollectionList(params);
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
    //手指触摸动作开始 记录起点X坐标
    touchstart: function (e) {
        //开始触摸时 重置所有删除
        this.data.collectionList.forEach(function (v, i) {
        if (v.isTouchMove)//只操作为true的
            v.isTouchMove = false;
        })
        this.setData({
            startX: e.changedTouches[0].clientX,
            startY: e.changedTouches[0].clientY,
            collectionList: this.data.collectionList
        })
    },
    //滑动事件处理
    touchmove: function (e) {
        var that = this,
        index = e.currentTarget.dataset.index,//当前索引
        id = e.currentTarget.dataset.id,//当前id
        startX = that.data.startX,//开始X坐标
        startY = that.data.startY,//开始Y坐标
        touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
        touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
        //获取滑动角度
        angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
        that.data.collectionList.forEach(function (v, i) {
        v.isTouchMove = false
        //滑动超过30度角 return
        if (Math.abs(angle) > 30) return;
        if (v.id == id) {
            if (touchMoveX > startX) //右滑
            v.isTouchMove = false
            else //左滑
            v.isTouchMove = true
        }
        })
        //更新数据
        that.setData({
            collectionList: that.data.collectionList
        })
    },
    /**
     * 计算滑动角度
     * @param {Object} start 起点坐标
     * @param {Object} end 终点坐标
     */
    angle: function (start, end) {
        var _X = end.X - start.X,
          _Y = end.Y - start.Y
        //返回角度 /Math.atan()返回数字的反正切值
        return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
    },
    //删除事件
    del: function (e) {
        let self = this
        wx.showLoading({
            title: '正在删除...'
        })
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, {token: store.token},{login_id:store.login_id})
        reqData.notice_id = e.currentTarget.dataset.id
        Util.ajax('notice/cell', 'delete',reqData).then(data => {
            self.data.collectionList.splice(e.currentTarget.dataset.index, 1)
            self.setData({
                collectionList: self.data.collectionList
            })
            wx.showToast({
                icon: 'success',
                title: '删除消息成功'
            })
        }, res => {
            console.log(res,'res')
        })
    },
})