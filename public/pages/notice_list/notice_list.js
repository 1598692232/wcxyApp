let Util = require('../../utils/util.js')
const app = getApp()

const PRE_PAGE = 10;
Page({
    data: {
        noticeListInfo: [],
        tx: app.data.staticImg.manager,
        animationData: {},
        hideClear: true,
        listInfoWidth: 0,
        startX: 0,
        startY: 0,
        isTouchMove: false,
        scrollHeightList: 0,
        projectId: 0,
        title: '',
        page: 1,
        pageSize: 10,
        hasMoreData: true,
        isDelAll: false
    },

    onLoad(options) {
        let self = this
        wx.showLoading()
        self.setData({
            title: options.project_name,
            projectId: options.project_id
        })
        Util.getSystemInfo().then(res => {
            self.setData({
                scrollHeightList: res.windowHeight,
                listInfoWidth: res.windowWidth - 110,
                liWidth: res.windowWidth - 110
            })
        })
    },
    onShow() {
        let store = wx.getStorageSync('app')
        if (store.token == '') {
            wx.navigateTo({
                url: '/pages/signin/signin'
            })
        } else {
            let self = this
            self.initList()
        }  
    },

    //初始化列表页
    initList() {
        // Util.ajax('notice/detail', 'get',reqData).then(data => {
        //     data.list.map(item => {
        //         item.createtime = Util.getCreateTime(item.created_at)
        //         item.avatar = item.avatar == '' ? self.data.tx : item.avatar
        //         item.isproject = item.content_id.toString().substr(0,1)==='P'?true:false
        //     })
        //     // self.setData({
        //     //     noticeListInfo: data.list
        //     // })
        //     var contentlistTem = self.data.noticeListInfo
        //     if (self.data.page == 1) {
        //         contentlistTem = []
        //     }
        //     var noticeListInfo = data.list
        //     if (noticeListInfo.length < self.data.pageSize) {
        //         self.setData({
        //             noticeListInfo: contentlistTem.concat(noticeListInfo),
        //             hasMoreData: false
        //         })
        //     } else {
        //         self.setData({
        //             noticeListInfo: contentlistTem.concat(noticeListInfo),
        //             hasMoreData: true,
        //             page: self.data.page + 1
        //         })     
        //     }
        //     wx.hideLoading()
        // }, res => {
        //     wx.showModal({
        //         title: '提示',
        //         content: '获取消息通知失败,请重新登录！！',
        //         showCancel: false,
        //         success: function(res) {
        //             if (res.confirm) {
        //                 wx.navigateTo({url: '/pages/signin/signin?login_out=2'})
        //             }
        //         }
        //     })
        // })

        let self = this
        let getList = (reqData,doCommentAjaxing,fn)=>{
            return Util.ajax('notice/detail', 'get',reqData).then(data => {
                if (doCommentAjaxing) {
                    this.commentAjaxing = false;
                }
                data.list.map(item => {
                    item.createtime = Util.getCreateTime(item.created_at)
                    item.avatar = item.avatar == '' ? self.data.tx : item.avatar
                    item.isproject = item.content_id.toString().substr(0,1)==='P'?true:false
                })
                fn(data.list); 
                wx.hideLoading()
            }, res => {
                if (doCommentAjaxing) {
                    this.commentAjaxing = false;
                }
            })
        }
        if (this.commentAjaxing || this.commentGeted) { 
            return;
        }
        this.commentAjaxing = true
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, {token: store.token},{login_id:store.login_id},{
            project_id:self.data.projectId,
            page: self.data.page,
            pre_page: 10
        })  
        getList(reqData, true, (list) => {
            let noticeListInfo = self.data.noticeListInfo.concat(list);
            if (list.length < PRE_PAGE) {
                self.commentGeted = true;
                self.setData({
                    hasMoreData: false
                })
            }
            self.setData({
                noticeListInfo,
                page: list.length < PRE_PAGE ? self.data.page : ++self.data.page
            })
        });
    },

    //手指触摸动作开始 记录起点X坐标
    touchstart: function (e) {
        //开始触摸时 重置所有删除
        this.data.noticeListInfo.forEach(function (v, i) {
        if (v.isTouchMove)//只操作为true的
            v.isTouchMove = false;
        })
        this.setData({
            startX: e.changedTouches[0].clientX,
            startY: e.changedTouches[0].clientY,
            noticeListInfo: this.data.noticeListInfo
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
        that.data.noticeListInfo.forEach(function (v, i) {
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
            noticeListInfo: that.data.noticeListInfo
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
            self.data.noticeListInfo.splice(e.currentTarget.dataset.index, 1)
            self.setData({
                noticeListInfo: self.data.noticeListInfo
            })
            wx.showToast({
                icon: 'success',
                title: '删除消息成功'
            })
        }, res => {
            console.log(res,'res')
        })
    },
    delAll: function (e) {
        let self = this
        wx.showModal({
            title: '提示',
            content: '确定要清空全部消息，这是一个不可逆的操作!!!',
            success: function(res) {
                if(res.confirm){
                    wx.showLoading({
                        title: '正在删除...'
                    })
                    let store = wx.getStorageSync('app')
                    let reqData = Object.assign({}, {token: store.token},{login_id:store.login_id})
                    reqData.notice_ids = self.data.noticeListInfo.map(v=>v.id).toString()
                    Util.ajax('notices', 'delete',reqData).then(data => {
                        
                    }, res => {
                        // self.onShow() 
                        self.setData({
                            noticeListInfo: [],
                            isDelAll: true
                        })
                        wx.showToast({
                            title: '清空成功',
                            success: function(res) {
                                // wx.switchTab({
                                //     url: '/pages/notice/notice?isDelAll='+ self.data.isDelAll
                                // }) 
                                wx.navigateBack()                                
                            }
                        })     
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })  
    },
    // 页面上拉触底事件的处理函数
    lower(e){
        let self = this
        let store = wx.getStorageSync('app')
        let params = Object.assign({}, {token: store.token},{login_id:store.login_id},{
            project_id: self.data.projectId,
            page: self.data.page,
            pre_page: PRE_PAGE
        })
        // if (self.data.hasMoreData) {
        //     wx.showToast({
        //         icon: 'loading',
        //         duration: 1500
        //     })
        // }
        self.initList(params);
    },
    //跳转到播放页面的评论页
    toCommentInfo(e) {
        let self = this
        if(e.currentTarget.dataset.isproject===false){
            if(e.currentTarget.dataset.type==='deletedoc'||e.currentTarget.dataset.type==='deleteversion'||e.currentTarget.dataset.type==='deletecomment'){
                wx.showModal({
                    title: '提示',
                    content: '不支持此消息的预览',
                    showCancel: false,
                    duration: 2000
                })
            }else{
                wx.navigateTo({
                    url: '/pages/info/info?project_id=' + self.data.projectId + '&id=' + e.currentTarget.dataset.contentid
                })
            } 
        }else{
            wx.showModal({
                title: '提示',
                content: '不支持此消息的预览',
                showCancel: false,
                duration: 2000
            })
        }
    }
})