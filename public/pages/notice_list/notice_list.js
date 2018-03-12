let Util = require('../../utils/util.js')
const app = getApp()

Page({
    data: {
        noticeListInfo: [],
        animationData: {},
        hideClear: true,
        listInfoWidth: 0,
        startX: 0,
        startY: 0,
        isTouchMove: false,
        scrollHeightList: 0,
        projectId: 0,
        title: ''
    },

    onLoad(options) {
        let self = this
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
        let self = this
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, {token: store.token},{login_id:store.login_id})
        reqData.project_id = self.data.projectId
        wx.showLoading()
        Util.ajax('notice/detail', 'get',reqData).then(data => {
            data.map(item => {
                item.createtime = Util.getCreateTime(item.created_at)
            })
            self.setData({
                noticeListInfo: data
            })
            wx.hideLoading()
        }, res => {
            wx.showModal({
                title: '提示',
                content: '获取消息通知失败,请重新登录！！',
                showCancel: false,
                success: function(res) {
                    if (res.confirm) {
                        wx.navigateTo({url: '/pages/signin/signin?login_out=2'})
                    }
                }
            })
        })
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
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, {token: store.token},{login_id:store.login_id})
        console.log(e.currentTarget.dataset.id,'e.currentTarget.dataset.id')
        reqData.notice_id = e.currentTarget.dataset.id
        Util.ajax('notice/cell', 'delete',reqData).then(data => {
            self.onShow()
        }, res => {
            wx.showToast({
                title: '删除消息成功'
            })
        })
    },
    delAll: function (e) {
        let self = this
        wx.showModal({
            title: '提示',
            content: '确定要清空全部消息，这是一个不可逆的操作!!!',
            success: function(res) {
                if(res.confirm){
                    let store = wx.getStorageSync('app')
                    let reqData = Object.assign({}, {token: store.token},{login_id:store.login_id})
                    reqData.notice_ids = self.data.noticeListInfo.map(v=>v.id).toString()
                    Util.ajax('notices', 'delete',reqData).then(data => {
                    }, res => {
                        self.initList() 
                        wx.showToast({
                            title: '清空成功'
                        })                     
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })  
    }
})