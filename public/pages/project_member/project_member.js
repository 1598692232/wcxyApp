let Util = require('../../utils/util.js')
const app = getApp()

const PIC_TYPE = ['jpg', 'jpeg', 'png', 'gif', 'tiff'];
let transferStatus = false;
Page({
	data: {
        memberList:[],
        isAdmin: true,
        projectID: 0,
        title: '',
        showDelete: false
    },
	onLoad(options) {
        let self = this
        self.setData({
            projectID: options.project_id,
            title: options.title
        })
        if(options.scene){
            wx.login({
                success: function(res) {
                    if (res.code) {
                        let store = wx.getStorageSync('app')
                        let empowers = wx.getStorageSync('user_info')
                        let reqData = Object.assign({},{code: res.code})
                        Util.ajax('auth/login', 'post', reqData).then(json => {
                            Util.setStorage('user_info', json)
                            let data = Object.assign({}, store, json)
                            if(json.avatar==false) {
                                wx.getUserInfo({
                                    withCredentials: true,
                                    success: function(res) {
                                        var userInfo = res.userInfo
                                        var nickName = userInfo.nickName
                                        var avatarUrl = userInfo.avatarUrl?userInfo.avatarUrl:manager
                                        var gender = userInfo.gender //性别 0：未知、1：男、2：女
                                    
                                        let stores = wx.getStorageSync('user_info')
                                        let newStorage2 = Object.assign({}, stores)
                                        newStorage2.nickName = nickName
                                        newStorage2.avatarUrl = avatarUrl
                                        Util.setStorage('user_info', newStorage2)

                                        let reqData2 = Object.assign({},{login_id:json.login_id},{token:json.token},{nick_name: nickName},{avatar: avatarUrl})
                                        if(json.avatar==false){
                                            Util.ajax('user/info', 'post', reqData2).then((data) => {
                                                wx.setStorage({
                                                    key: 'user_info',
                                                    data: data
                                                })
                                                let empower = wx.getStorageSync('user_info')
                                                let nickName = empower.nickName
                                            }, res => {
                                                wx.showModal({
                                                    title: '提示',
                                                    content: res.data.msg,
                                                    showCancel: false
                                                })
                                            })
                                        }  
                                    },
                                    fail: function() {
                                        wx.reLaunch({
                                            url: '/pages/empower_tips/empower_tips?tips=2'+'&share_code=' + res.code
                                        })
                                    }
                                })
                            }

                            Util.setStorage('app', data).then(() => {
                                Util.getStorage('app').then((res) => {
                                                
                                })
                            })
                        }, res => {
                            wx.showModal({
                                title: '提示',
                                content: res.data.msg,
                                showCancel: false
                            })
                        })
                    }
                }
            })
        }
        // self.setData({
        //     projectID: wx.getStorageSync('project_id'),
        //     title: wx.getStorageSync('project_name')
        // })
        if(options.isAdmin == 'true'){
            self.setData({
                isAdmin: true
            })
        }else {
            self.setData({
                isAdmin: false
            })
        }
        console.log(options.shareTickets,'shareTickets6666')
    },
    onShow() {
        wx.showShareMenu({
            withShareTicket: true
        })
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
                memberList: json.list
            })
            let memberNum = json.list.length
            wx.setNavigationBarTitle({ title: '项目成员（' + memberNum + '）' })
        }, res => {
            wx.showModal({
                title: '提示',
                content: '获取成员头像失败！',
                showCancel: false
            })
        })
    },
    // 生成邀请链接
    toAddMemberBtn() {
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({},{
            login_id:store.login_id,
            token: store.token,
            project_id: wx.getStorageSync('project_id')
        })
        Util.ajax('invite/link', 'post', reqData).then(json => {
            console.log(json,'json88888')
        }, res => {
            wx.showModal({
                title: '提示',
                content: res.msg,
                showCancel: false
            })
        })
    },
    onShareAppMessage: function (res) {
        let self = this
        if (res.from === 'button') {
            // 来自页面内转发按钮
        }
        let userInfo = wx.getStorageSync('user_info');
        let realname = userInfo.realname
        let projectName = wx.getStorageSync('project_name');
        return {
          title: realname + '邀请您进入' + projectName + '的项目',
          path: '/pages/empower_signin/empower_signin',
          imageUrl: './img/xinyue_share.png',
          success: function(res) {
            console.log(res.shareTickets[0])
            wx.getShareInfo({
                shareTicket: res.shareTickets[0],
                success: function (res) { 
                    console.log(res,'success_res');
                    console.log(res.encryptedData,'encryptedData');
                },
                fail: function (res) { console.log(res,'fail_res') },
                complete: function (res) { console.log(res,'complete_res') }
            })
            // 邀请成功
            wx.showToast({
                title: '发送邀请成功',
                icon: 'success'
            })
            setTimeout(function(){
                wx.hideLoading()
            },2000)
          },
          fail: function(res) {
            // 转发失败
          }
        }
    },
    toBack(){
        wx.navigateBack({
            delta: 2,
            success: function() {
                wx.showToast({
                    title: '删除项目成功!'
                })
            }
        })
    },
    toBack2(){
        wx.navigateBack({
            delta: 2,
            success: function() {
                wx.showToast({
                    title: '退出项目成功!'
                })
            }
        })
    },
    //admin删除项目
    toDelProject() {
        let self = this
        wx.showModal({
            title: '提示',
            content: '确定删除“'+ self.data.title +'”项目吗?所有与之相关的媒体资源都将被删除且不可恢复',
            success: function(res) {
                if(res.confirm){
                    let store = wx.getStorageSync('app')
                    let reqData = Object.assign({}, {token: store.token},{login_id:store.login_id})
                    reqData.project_id = self.data.projectID
                    Util.ajax('project', 'delete',reqData).then(data => {
                        self.toBack()
                    }, res => {
                        wx.showToast({
                            title: '删除项目成功!'
                        })            
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        }) 
    },
    //member退出工程
    toQuitProject(e) {
        let self = this
        wx.showModal({
            title: '提示',
            content: '确定要离开项目“'+ self.data.title +'”吗?该项目将不再对您可见，您也将不再收到任何关于该项目的通知',
            success: function(res) {
                if(res.confirm){
                    let store = wx.getStorageSync('app')
                    let reqData = Object.assign({}, {token: store.token},{login_id:store.login_id})
                    reqData.project_id = self.data.projectID
                    Util.ajax('quit', 'put',reqData).then(data => {
                        self.toBack2()
                    }, res => {
                        wx.showToast({
                            title: '退出项目成功!'
                        })
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        }) 
    },
    // 显示删除项目成员的删除按钮
    toDelMemberBtn() {
        let self = this
        if (self.data.memberList.length == 1) {
            wx.showToast({
                title: '您暂无成员可以删除',
                icon: 'none',
                duration: 2000
            })
            return
        }
        self.setData({
            showDelete: !self.data.showDelete
        })
    },
    // 删除项目成员
    toDelMember(e) {
        let self = this
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({},{
            login_id : store.login_id,
            token: store.token,
            member_id: e.currentTarget.dataset.id,
            project_id: wx.getStorageSync('project_id'),
            _method: 'delete'
        })
        Util.ajax('member', 'post', reqData).then(json => {
            console.log(json,'json')
            wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
            })
            self.onShow()
        }, res => {
            wx.showModal({
                title: '提示',
                content: res.msg,
                showCancel: false
            })
        })
    },
    //验证邮箱
    isEmail (str) {
        return /^[\w.-]+@([\w-]+\.)+[a-zA-Z]+$/.test(str)
    },
    //点击邀请项目成员
    invite(){
        let self = this
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, {token: store.token},{login_id:store.login_id})
        reqData.project_id = self.data.projectID
        reqData.emails = self.data.inputValue
        if(self.isEmail(self.data.inputValue)===false){
            // wx.showToast({
            //     title: '邮箱格式不正确',
            //     image: './img/error.png',
            //     duration: 2000
            // })
            wx.showModal({
                title:'提示',
                content: '邮箱格式不正确',
                showCancel: false
            })
        }else{
            if(self.data.isInvite===false){
                Util.ajax('invite', 'post',reqData).then(data => {
                    // wx.showToast({
                    //     title: '邮件发送成功',
                    //     icon: 'success'
                    // }) 
                    wx.showModal({
                        title:'提示',
                        content: '邮件发送成功',
                        showCancel: false
                    })
                    self.setData({
                        isInvite: true
                    })
                    let t = setInterval(()=>{
                        self.setData({
                            isInvite: false
                        })
                        clearInterval(t)
                    },15000)
                }, res => {
                    // console.log(res,'res')
                    // wx.showToast({
                    //     title: res.data.msg,
                    //     image: './img/error.png',
                    //     duration: 2000
                    // })
                    wx.showModal({
                        title:'提示',
                        content: res.data.msg,
                        showCancel: false,
                        success: function(){
                            self.setData({
                                focus: true,
                                againInput: true
                            })
                        }
                    })
                })
            }else{
                // wx.showToast({
                //     title: '邮件已经发送',
                //     icon: 'success'
                // })
                wx.showModal({
                    title:'提示',
                    content: '邮件已经发送,请勿频繁操作!',
                    showCancel: false
                })
            }         
        } 
    }
})