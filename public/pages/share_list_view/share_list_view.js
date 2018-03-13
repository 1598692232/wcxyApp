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
    },
    onLoad(options) {
		let self = this;
        Util.getSystemInfo().then(result => {
            self.setData({
                scrollHeight: result.windowHeight,
            })
           
        });
        if (options.password != undefined) {
            let params = {
                share_code: options.code,
                password: options.password
            }
            self.setData({
                code: options.code,
                password: options.password
            });
            this.initList(params);
        } else {
            let scene = decodeURIComponent(options.scene).split('=');
            self.setData({
                passwordModal: true,
                code: scene[1],
            });
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
            txList: [{name:'1月之前的后期素材',time:'1天前',num:7},{name:'1月之前的后期素材',time:'1天前',num:7}]
        })
    },

    enterShareLink(e) {
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
                shareName: data.share_name
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

    // onShareAppMessage: function (res) {
    //     if (res.from === 'button') {
    //         // 来自页面内转发按钮
    //         //   console.log(res.target)
    //     }
    //     return {
    //       title: this.data.shareName,
    //       path: '/pages/share_list_view/share_list_view?code=' + self.data.code + '&password=' + self.data.password,
    //       success: function(res) {
    //         // 转发成功
    //         // wx.showModal({
    //         //     title: '提示',  
    //         //     content: '转发成功', 
    //         //     success: function(res) {  
    //         //         if (res.confirm) {  
    //         //         console.log('确定')  
    //         //         } else if (res.cancel) {  
    //         //         console.log('取消')  
    //         //         }  
    //         //     }
    //         // })
    //       },
    //       fail: function(res) {
    //         // 转发失败
    //       }
    //     }
    // },

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
        console.log(filetype)
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
            + '&username=' + username
            + '&project_id=' + this.data.projectId
        wx.navigateTo({
            url: url,
        })
    },

    playOrPauseAudio(e) {
        console.log(e);
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