let Util = require('../../utils/util.js')
const app = getApp()

Page({
    data: {
        scrollHeight: 0,
        videoWidth: 0,
        videoHeight: 0,
        videoBoxHeight: 0,
        shareList: [1, 2,3],
        qrCode: null,
        projectId: null,
        deadline: null,
        fileCount: null,
        viewCount: null,
        enterShareLink: '',
        passwordModal: false,
        password: '',
        shareName: '',
        manager: app.data.staticImg.manager,
        review: 0,
        share_all_version: 0,
        pc_link:'',
        currentPlayId: null,
        templateShow: false,
        needNickName: true
    },
    onLoad(options) {
        let self = this;
        wx.getUserInfo({
            success: function(res) {
                var userInfo = res.userInfo
                var nickName = userInfo.nickName
                var avatarUrl = userInfo.avatarUrl

                let stores = wx.getStorageSync('empower')
                let newStorage2 = Object.assign({}, stores)
                newStorage2.nickName = nickName
                newStorage2.avatarUrl = avatarUrl
                wx.setStorageSync('empower', newStorage2)
                self.setData({
                    needNickName: false
                })
            },
            fail: function() {
                wx.reLaunch({
                    url: '/pages/empower_tips/empower_tips?tips=0'
                })
            }
        })
        let stores = wx.getStorageSync('empower')
        if(options.scene&&stores.needregister){
            let stores = wx.getStorageSync('empower')
            let store = wx.getStorageSync('app')
            let reqData = Object.assign({}, {code: store.code},{scene_id: stores.needregister},{nick_name:stores.nickName},{avatar:stores.avatarUrl})
            Util.ajax('register', 'post', reqData).then(json => {
                console.log(json,'json')
                let stores = wx.getStorageSync('empower')
                let newStorage2 = Object.assign({}, stores)
                newStorage2.needregister = false
                wx.setStorageSync('empower', newStorage2)
            }, res => {
                wx.showModal({
                    title: '提示',
                    content: res.data.msg,
                    showCancel: false
                })
            })
        }
        Util.getSystemInfo().then(result => {
            self.setData({
                scrollHeight: result.windowHeight,
                videoWidth: Math.round(result.windowWidth)-28,
                videoHeight: Math.round(result.windowWidth*9/16),
                videoBoxHeight: Math.round(result.windowWidth*9/16)+60
            })  
        });

        if (options.password != undefined) {
            let params = {};
            params = {
                share_code: options.code,
                password: options.password
            }
            
            self.setData({
                code: options.code,
                password: options.password
            });
            wx.setStorageSync('share_code', options.code)
            this.initList(params);
        } else {
            let scene = decodeURIComponent(options.scene).split('=');
            let params = wx.getStorageSync('app');
            delete params.code;
            params = Object.assign({}, params, {share_code: scene[1]});
            wx.setStorageSync('share_code', scene[1])
            self.setData({
                code: scene[1],
            })

            // 分享页面的请求
            Util.ajax('sharefilelist', 'get', params).then(data => {          
                data.list.forEach(item => {
                    item.comment_count = item.comment_count>99?99:item.comment_count
                    item.create_at_text = Util.getCreateTime(item.create_at)
                    if (item.file_type == "audio") {
                        item.audioPause = true
                    }
                });

                self.shareList = data.list;
                self.setData({
                    shareList: data.list.length > 3 ? data.list.slice(0, 3) : data.list,
                    qrCode: data.qr_code,
                    deadline: data.deadline.toString().length>4?Util.getTimeDate(data.deadline):data.deadline,
                    fileCount: data.file_count,
                    viewCount: data.view_count,
                    projectId: data.project_id,
                    passwordModal: false,
                    shareName: data.share_name,
                    review: data.review,
                    share_all_version: data.share_all_version,
                    people: data.share_people,
                    pc_link: data.pc_link
                });
                wx.setNavigationBarTitle({title: data.share_name})
            }, res => {
                if (res.data.status == -4) {    
                    self.setData({
                        passwordModal: true,
                    })
                    wx.getClipboardData({
                        success: function(res){
                            if(res.data.toString().length>4){
                                var data2 = res.data.slice(-4)     
                            }else{
                                var data2 = res.data
                            }
                            wx.setClipboardData({
                                data: data2
                            })
                        }
                    })
                } 
                // wx.showModal({
                //     title: '提示',
                //     content: res.data.msg,
                //     showCancel: false
                // });
            })
        }   
    },
    
    onShow() {
        let self = this
        self.pageCount = 1;
        // 获取参与成员头像姓名
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, store, {
            project_id: wx.getStorageSync('project_id')
        })
        this.setData({
            templateShow: true
        })
    },

    onHide() {
        this.data.shareList.forEach((item, key) => {
            if (item.file_type == 'video') {
                let videoCtx = wx.createVideoContext('media' + item.id);
                videoCtx.pause();
            }

            if (item.file_type == 'audio') {
                let audioCtx = wx.createAudioContext('media' + item.id);
                audioCtx.pause();
                item.audioPause = true
            }
        })
        this.setData({
            templateShow: false,
            shareList: this.data.shareList
        })
    },

    enterShareLink(e) {
        // wx.setClipboardData({
        //     data: '密码:' + self.data.password,
        //     success: function(res) {

        //     } 
        // }); 
        // wx.getClipboardData({
        //     success: function(res){
        //         console.log(res.data,'data')
        //     }
        // })
        let params = {
            share_code: this.data.code,
            password: this.data.password
        }
        let store = wx.getStorageSync('empower')
        let nickName = store.nickName
        if(nickName){
            this.initList(params)
        }else{
            wx.reLaunch({
                url: '/pages/empower_tips/empower_tips?tips=0'
            })
        }
    },

    inputPassword(e) {
        this.setData({
            password: e.detail.value
        })
    },

    initList(params) {
        let self = this;
        // console.log(params, 'params')
        Util.ajax('sharefilelist', 'get', params, false, () => {
            self.initList(params)
        }).then(data => {
            data.list.forEach(item => {
                item.comment_count = item.comment_count>99?99:item.comment_count
                item.create_at_text = Util.getCreateTime(item.create_at)
                if (item.file_type == "audio") {
                    item.audioPause = true
                }
            });
            self.shareList = data.list;
            self.setData({
                shareList: data.list.length > 3 ? data.list.slice(0, 3) : data.list,
                qrCode: data.qr_code,
                deadline: data.deadline.toString().length>4?Util.getTimeDate(data.deadline):data.deadline,
                fileCount: data.file_count,
                viewCount: data.view_count,
                projectId: data.project_id,
                passwordModal: false,
                shareName: data.share_name,
                review: data.review,
                share_all_version: data.share_all_version,
                people: data.share_people,
                pc_link: data.pc_link
            });
            wx.setNavigationBarTitle({title: data.share_name})
        }, res => {
            wx.showModal({
                title: '提示',
                content: res.data.msg,
                showCancel: false
            });
        });
    },
    //视频播放
    changeCurrentPlayId(e) {
        this.data.currentPlayId = e.currentTarget.dataset.id;
        let type = e.currentTarget.dataset.type;
        let shareList = this.data.shareList;

        if (type == 'video') {
            shareList.forEach((item, key) => {
                if (item.file_type == 'audio') {
                    item.audioPause = true
                }
            });
            this.setData({shareList})
        }

        this.data.shareList.forEach((item, key) => {
            if (item.file_type == 'video' && item.id != this.data.currentPlayId) {
                let videoCtx = wx.createVideoContext('media' + item.id);
                videoCtx.pause();
            }

            if (item.file_type == 'audio' && item.id != this.data.currentPlayId) {
                let audioCtx = wx.createAudioContext('media' + item.id);
                audioCtx.pause();
            }
        })
    },
    //点击微信图标放大
    toBigWXLogo(e) {
        wx.previewImage({
            urls:[this.data.qrCode],
            success(res){

            },
            fail(res){

            },
            complete(res){

            }
        })
    },
    // 复制链接并分享
    toCopyAndTransmit(e) {

    },

    onShareAppMessage: function (res) {
        if (res.from === 'button') {
            // 来自页面内转发按钮
        }
        // let passwordUrl = this.data.password == '' ?  '&password=""' :  ''
        let codeUrl = encodeURIComponent('code=' + this.data.code);
        let store = wx.getStorageSync('app');
        let projectName = wx.getStorageSync('project_name');

        return {
          title: this.data.shareName,
          path: '/pages/share_list_view/share_list_view?scene=' + codeUrl,
          imageUrl: './img/xinyue_share.png',
          success: function(res) {
            // 转发成功
            // wx.showModal({
            //     title: '提示',  
            //     content: '转发成功', 
            //     success: function(res) {  
            //         if (res.confirm) {  
            //         console.log('确定')  
            //         } else if (res.cancel) {  
            //         console.log('取消')  
            //         }  
            //     }
            // })
          },
          fail: function(res) {
            // 转发失败
          }
        }
    },

    copyTBL:function(e){  
        var self=this;
        var copypass = self.data.password?'密码:':''
        var more = self.data.password?"\n":""
        wx.setClipboardData({
            data: '链接:' + self.data.pc_link + more + copypass + self.data.password,
            success: function(res) {
            // self.setData({copyTip:true}),  
                // wx.showModal({
                //     title: '提示', 
                //     content: '复制成功',  
                //     success: function(res) {  
                //         if (res.confirm) {  
                //         console.log('确定')  
                //         } else if (res.cancel) {  
                //         console.log('取消')  
                //         }  
                //     }
                // })
            } 
        });  
    },

    toShareInfo(e) {
        let { id, name, username, filetype ,status } = e.currentTarget.dataset;
        if(status===0){
            wx.showModal({
                title: '提示',
                content: '当前文件已被删除',
                showCancel: false
            });
            return;
        }
        if (!['video', 'audio', 'image'].includes(filetype)) {
            wx.showModal({
                title: '提示',
                content: '当前文件格式不可查看',
                showCancel: false
            });
            return;
        }
        let url = '/pages/info/info?&name=' 
            + name + '&id=' + id 
            + '&username=' + username + '&share=1'
            + '&project_id=' + this.data.projectId + '&review=' + this.data.review + '&share_all_version=' + this.data.review;
        wx.navigateTo({
            url: url,
        })
    },

    playOrPauseAudio(e) {
        let id = e.currentTarget.dataset.id;

        let currentAudio = this.data.shareList.filter(item => item.id == id)[0];
        if (!currentAudio.audioCtx) {
            currentAudio.audioCtx = wx.createAudioContext('media' + id);
        }
        
        currentAudio.audioCtx = wx.createAudioContext('media' + id);
        if (currentAudio.audioPause) {
            currentAudio.audioCtx.play()
        } else {
            currentAudio.audioCtx.pause()
        }

        currentAudio.audioPause = !currentAudio.audioPause
        this.data.shareList.forEach(item => {
            if (item.id == id) {
                item = currentAudio
            }
        });

        this.setData({
            shareList: this.data.shareList
        });
    },

    onPageScroll(e) {   
        // 将分享列表进行分页处理    
        let page = Math.ceil(e.scrollTop / this.data.scrollHeight) + 1;
        if (page == this.pageCount || this.data.shareList.length == this.shareList.length) return;
        let list = this.data.shareList;
        let pushArgs = this.shareList.slice(this.pageCount * 3, (this.pageCount + 1) * 3);
        list = list.concat(pushArgs);
        this.setData({
            shareList: list
        });
        this.pageCount++;
    }

})