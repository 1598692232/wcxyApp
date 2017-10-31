var Util = require('../../utils/util.js')

const app = getApp()

Page({

    data: {
        scrollHeight: 0,
        callList: [],
        commentIsFocus: false,
        animationData: {},
        commentText: '',
        tx: app.data.staticImg.tx,
        zan: app.data.staticImg.zan,
        zanActive: app.data.staticImg.zanActive,
        currentComment: '',
        tsx: '',
        tex: '',
        tsy: '',
        delTouching: false,
        showDel: false,
        sendCallback: false,
        delCallback: false
    },

   onLoad(options) {
        let self = this
        wx.showLoading()
        self.setData({
            commentId: parseInt(options.commentId),
            docId: parseInt(options.docId),
            avatar: options.avatar == '' ? tx : options.avatar 
        })
    },

    onShow() {
        let self = this
        Util.getSystemInfo().then(res => {
            self.setData({
                scrollHeight: res.windowHeight - 54,
            })
        }).then(() => {

            let store = wx.getStorageSync('app')
            let reqData = Object.assign({}, store, {
                doc_id: self.data.docId,
                project_id: wx.getStorageSync('project_id') || options.projectId
            })
    
            Util.ajax('comment', 'get', reqData).then(json => {
                let appStore = wx.getStorageSync('app')
                let currentComment = json.list.filter(item => {
                    return parseInt(item.id) == self.data.commentId
                })
    
                currentComment[0].comment_time = Util.timeToMinAndSec(currentComment[0].media_time)
    
                currentComment[0].replies.map(item => {
                    item.translateX = '',
                    item.delTranstion = ''
                    item.avatar = item.avatar == '' ? self.data.tx : item.avatar
                    if(appStore.login_id == item.user_id) {
                        item.delColor = '#f00'
                    } else {
                        item.delColor = '#ddd'
                    }
                })
                self.setData({
                    callList: currentComment[0].replies,
                    currentComment: currentComment[0]
                })
                wx.setNavigationBarTitle({title: `${currentComment[0].replies.length}条回复`})
            }, res => {
                wx.showModal({
                    title: '提示',
                    content: '获取回复信息失败！',
                    showCancel: false
                })
            })

        }) 
    },

     // 发送评论
     sendComment(e) {
        let self = this
        wx.showLoading()
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, store, {
            content: e.detail.value.commentText,
            label: '',
            media_time: self.data.videoTime,
            doc_id: self.data.docId,
            project_id: wx.getStorageSync('project_id'),
            top_id: self.data.commentId
        })

        if (self.data.sendCallback) return
        self.data.sendCallback = true

        Util.ajax('comment', 'post', reqData).then(json => {
            let list = self.data.callList
            wx.showToast({
                title: '回复成功！！'
            })
            let newCall= {
                content: e.detail.value.commentText,
                comment_time: Util.timeToMinAndSec(self.data.videoTime),
                doc_id: self.data.docId,
                project_id: wx.getStorageSync('project_id'),
                id: json.id,
                realname:wx.getStorageSync('user_info').realname,
                avatar: wx.getStorageSync('user_info').avatar == '' ? self.data.tx : wx.getStorageSync('user_info').avatar,
                translateX: '',
                delTranstion: '',
                delColor: '#f00',
                user_id: wx.getStorageSync('app').login_id
            }

            list.unshift(newCall)

            self.setData({
                callList: list,
                commentText: ''
            })
        }, res => {
            wx.showModal({
                title: '提示',
                content: '发表评论失败！',
                showCancel: false,
            })
        }).then(() => {
            self.data.sendCallback = false
        })
     },

    // 删除回复 start
    delTouchStart(e) {
        this.data.callList.map(item => {
            item.translateX = '',
            item.delTranstion = ''
        })

        this.setData({
            tsx: e.touches[0].clientX,
            tsy: e.touches[0].clientY,
            delTouching: true
        })
    },

    delTouchMove(e) {
        let tmx = e.touches[0].clientX
        let moveX = tmx - this.data.tsx
        let tmy = e.touches[0].clientY
        if (!this.data.delTouching || Math.abs(tmy - this.data.tsy) > 5) return
        
        if (!this.data.showDel) { 

            if (moveX > 0) return
            if (moveX < -100) {
               moveX = -100
            }

            this.data.callList[e.currentTarget.dataset.index].translateX = moveX
            this.setData({
                callList: this.data.callList,
                tex: tmx
            })
        } else {
            if (moveX < 0) return
            
            if (moveX > 100) {
                moveX = 0
            } 

            this.data.callList[e.currentTarget.dataset.index].translateX = moveX
            this.setData({
                callList: this.data.callList,
                tex: tmx
            })
        }

     },

    delTouchEnd(e) {
        if (!this.data.delTouching) return
        // let distanceX= this.data.tex - this.data.tsx

        this.setData({
            delTouching: false
        })

        if (this.data.callList[e.currentTarget.dataset.index].translateX < -15) {
            this.data.callList[e.currentTarget.dataset.index].translateX = -90
            this.data.callList[e.currentTarget.dataset.index].delTranstion = 'del-transtion'
            this.setData({
                callList: this.data.callList,
                showDel: true,
            })
        } else {
            this.data.callList[e.currentTarget.dataset.index].translateX = 0
            this.data.callList[e.currentTarget.dataset.index].delTranstion = 'del-transtion'
            this.setData({
                callList: this.data.callList,
                showDel: false
            })
        }

        setTimeout(() => {
            if (this.data.callList.length == 0 ||
                this.data.callList[e.currentTarget.dataset.index].delTranstion == undefined) return
            this.data.callList[e.currentTarget.dataset.index].delTranstion = ''
            this.setData({
                callList: this.data.callList,
            })
        }, 300)
    },

    handleDelComment(e) {
        let store = wx.getStorageSync('app')

        if (e.currentTarget.dataset.userid !== store.login_id) {
            wx.showModal({
                title: '提示',
                content: '你不是回复评论发布者，不能删除！',
                showCancel: false
            })
            return
        }

        let project_id = wx.getStorageSync('project_id')
        let reqData = Object.assign({}, {
            project_id: project_id,
            comment_id: this.data.callList[e.currentTarget.dataset.index].id,
            doc_id: this.data.doc_id,
        }, store)
        let self = this
        wx.showLoading({
            title: '正在删除...'
        })
        
        if(self.data.sendCallback) return
        self.data.sendCallback = true

        Util.ajax('comment', 'delete', reqData).then(json => {
            self.data.callList.splice(e.currentTarget.dataset.index, 1)
            self.setData({
                callList: self.data.callList
            })
            wx.showToast({
                title: '删除成功！'
            })
        }, res => {
            wx.showModal({
                title: '提示',
                content: '删除评论失败！',
                showCancel: false,
            })
        }).then(() => {
            self.data.sendCallback = false
        })
    }
    // 删除回复 end
})