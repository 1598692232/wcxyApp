let Util = require('../../utils/util.js')
const app = getApp()

Page({
    data: {
        scrollHeight: 0,
        shareList: [1, 2,3],
        videoPause: false,
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
        realname: '',
        sharename: ''
    },
    onLoad(options) {
        let self = this;
        self.setData({
            sharename: options.name
        })
        Util.getSystemInfo().then(result => {
            self.setData({
                scrollHeight: result.windowHeight,
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
            self.setData({
                code: scene[1],
            })
            Util.ajax('sharefilelist', 'get', {share_code: scene[1]}).then(data => {
                data.list.forEach(item => {
                    item.create_at_text = Util.getCreateTime(item.create_at)
                    if (item.file_type == "audio") {
                        item.audioPause = true
                    }
                });
                self.setData({
                    shareList: data.list,
                    qrCode: data.qr_code,
                    deadline: data.deadline,
                    fileCount: data.file_count,
                    viewCount: data.view_count,
                    projectId: data.project_id,
                    passwordModal: false,
                    shareName: data.share_name,
                    review: data.review,
                    share_all_version: data.share_all_version
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
                                var data2 = res.data.slice(3)     
                            }else{
                                var data2 = res.data
                            }
                            wx.setClipboardData({
                                data: data2
                            })
                        }
                    })
                } 
            })
        }
    },
    
    onShow() {
        let self = this
        // 获取参与成员头像姓名
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, store, {
            project_id: wx.getStorageSync('project_id')
        })
        self.setData({
            realname :store.realname
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
        this.initList(params)
    },

    inputPassword(e) {
        this.setData({
            password: e.detail.value
        })
    },

    initList(params) {
        let self = this;
        // console.log(params, 'params')
        Util.ajax('sharefilelist', 'get', params).then(data => {
            data.list.forEach(item => {
                item.create_at_text = Util.getCreateTime(item.create_at)
                if (item.file_type == "audio") {
                    item.audioPause = true
                }
            });
            self.setData({
                shareList: data.list,
                qrCode: data.qr_code,
                deadline: data.deadline,
                fileCount: data.file_count,
                viewCount: data.view_count,
                projectId: data.project_id,
                passwordModal: false,
                shareName: data.share_name,
                review: data.review,
                share_all_version: data.share_all_version
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
    listenerPlay(e) {
        this.data.videoPause = false
    },
    getVideoTime2(e) {
        this.data.videoPause = true
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
        let codeUrl = encodeURIComponent('code=' + this.data.code)
        return {
          title: this.data.shareName,
          path: '/pages/share_list_view/share_list_view?scene=' + codeUrl,
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
        wx.setClipboardData({
            data: '密码:' + self.data.password,
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
        let { id, name, username, filetype } = e.currentTarget.dataset;
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
            currentAudio.audioCtx = wx.createAudioContext('audio' + id);
        }
        
        currentAudio.audioCtx = wx.createAudioContext('audio' + id);
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
    }
})