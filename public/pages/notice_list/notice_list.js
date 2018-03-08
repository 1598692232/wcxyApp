let Util = require('../../utils/util.js')
const app = getApp()

Page({
    data: {
        noticeList: [],
        animationData: {},
        hideClear: true,
        listInfoWidth: 0,
        startX: 0,
        startY: 0,
        isTouchMove: false,
        scrollHeightList: 0
    },

    onLoad() {
        let self = this
        wx.showLoading()

        Util.getSystemInfo().then(res => {
            self.setData({
                scrollHeightList: res.windowHeight,
                listInfoWidth: res.windowWidth - 110,
                liWidth: res.windowWidth - 110
            })

            let infoData = wx.getStorageSync('info_data')
            if (infoData != '') {
                setTimeout(() => {
                    let url = '/pages/info/info?url=' + infoData.url + '&name='
                    + infoData.name + '&id=' + infoData.doc_id
                    + '&username=' + infoData.username + '&createTime=' + infoData.createTime
                    + '&coverImg=' + infoData.coverImg + '&project_id=' + infoData.project_id
                    wx.navigateTo({
                        url: url
                    })
                }, 1000)
            }
        })
    },
    onShow() {
        let store = wx.getStorageSync('app')

        if (store.token == '') {
            wx.navigateTo({
                url: '/pages/signin/signin'
            })
        } else {
            // 评论输入框动画注册
            let animation = wx.createAnimation({
                duration: 300,
                timingFunction: 'ease',
            })

            let self = this

            self.animation = animation

            self.initList()
        }
        
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
                if (item.type == 'admin') {
                    item.storage_size = item.storage_count != undefined ? (item.storage_count / Math.pow(1024, 2)).toFixed(2) : 0                            
                    //演示项目处理
                    item.storage_size = item.name == '演示项目' ? 166.29 : item.storage_size
                    item.file_count = item.name == '演示项目' ? '2' : item.file_count
                    pros.push(item)
                }
            })
            self.setData({
                noticeList: [{name:'醉乡民谣',text:'Kevin 评论了[醉乡民谣】'},{name:'小城故事多',text:'新阅 v1.0.8(NEW)'},{name:'官网教学视频制作剪辑参考样式',text:'Kevin 评论了[官网教学视频制作剪辑参考样式]'}]
            })

            wx.hideLoading()
        }, res => {

            wx.showModal({
                title: '提示',
                content: '获取我的项目失败,请重新登录！！',
                showCancel: false,
                success: function(res) {
                    if (res.confirm) {
                        wx.navigateTo({url: '/pages/signin/signin?login_out=1'})
                    }
                }
            })
        })

        Util.ajax('project/join', 'get', store).then(data => {
            data.list.forEach(item => {
                item.storage_size = item.storage_count != undefined ? (item.storage_count / Math.pow(1024, 2)).toFixed(2) : 0
            })
            self.setData({
                joinProjectList: data.list,
                joinProjectListTemp: data.list
            })
            wx.hideLoading()
        }, (res) => {

            wx.showModal({
                title: '提示',
                content: '获取参与项目失败,请重新登录！！',
                showCancel: false,
                success: function(res) {
                    if (res.confirm) {
                        wx.navigateTo({url: '/pages/signin/signin?login_out=1'})
                    }
                }
            })
        })
    },

    toNoticeSystemInfo(e) {
        wx.setStorage({
            key: 'project_id',
            data: e.currentTarget.dataset.id
        })
        wx.navigateTo({
          url: '/pages/project_list/project_list?project_id=' + e.currentTarget.dataset.id + '&projectName=' + e.currentTarget.dataset.name
        })
    },
    toNoticeInfo(e) {
        wx.setStorage({
            key: 'project_id',
            data: e.currentTarget.dataset.id
        })
        wx.navigateTo({
          url: '/pages/project_list/project_list?project_id=' + e.currentTarget.dataset.id + '&projectName=' + e.currentTarget.dataset.name
        })
    },

    //手指触摸动作开始 记录起点X坐标
    touchstart: function (e) {
        //开始触摸时 重置所有删除
        this.data.noticeList.forEach(function (v, i) {
        if (v.isTouchMove)//只操作为true的
            v.isTouchMove = false;
        })
        this.setData({
        startX: e.changedTouches[0].clientX,
        startY: e.changedTouches[0].clientY,
        noticeList: this.data.noticeList
        })
    },
    //滑动事件处理
    touchmove: function (e) {
        var that = this,
        index = e.currentTarget.dataset.index,//当前索引
        startX = that.data.startX,//开始X坐标
        startY = that.data.startY,//开始Y坐标
        touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
        touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
        //获取滑动角度
        angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });
        that.data.noticeList.forEach(function (v, i) {
        v.isTouchMove = false
        //滑动超过30度角 return
        if (Math.abs(angle) > 30) return;
        if (i == index) {
            if (touchMoveX > startX) //右滑
            v.isTouchMove = false
            else //左滑
            v.isTouchMove = true
        }
        })
        //更新数据
        that.setData({
            noticeList: that.data.noticeList
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
        this.data.noticeList.splice(e.currentTarget.dataset.index, 1)
        this.setData({
            noticeList: this.data.noticeList
        })
    },
    delAll: function (e) {
        this.setData({
            noticeList: []
        })
    }
})