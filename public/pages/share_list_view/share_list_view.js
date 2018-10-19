let Util = require('../../utils/util.js');
import {recordPageStart, pageStayStorage} from '../../utils/burying_point/local_record';
import {PAGE_TYPES} from '../../utils/burying_point/constants';
const app = getApp();


function  getUrlParam(urlStr) {
    let o = {};

    if (urlStr.indexOf('&') == -1) {
        o[urlStr.split('=')[0]] = urlStr.split('=')[1];
    } else {
        let pa = urlStr.split('&');
        pa.forEach((item, k) => {
            o[item.split('=')[0]] = item.split('=')[1];
        });
    }
    return o;
}

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
        collect_status: null,
        viewCount: null,
        enterShareLink: '',
        passwordModal: false,
        code:'',
        password: '',
        shareName: '',
        manager: app.data.staticImg.manager,
        review: 0,
        share_all_version: 0,
        pc_link:'',
        currentPlayId: null,
        templateShow: false,
        needNickName: false,
        collect: false,
        isShare: false,
        fullScreenId: 0,
        videoPNo: '540',
        PNoShow: false
    },
    onLoad(options) {
        let self = this;
        this.urlParams =null;
        if(options.scene){
            let urlParams = getUrlParam(decodeURIComponent(options.scene));
            this.urlParams = urlParams;
            wx.login({
                success: function(res) {
                    if (res.code) {
                        let store = wx.getStorageSync('app')
                        let empowers = wx.getStorageSync('user_info')
                        let reqData = Object.assign({},{code: res.code, share_code: urlParams.code, share_user_id: urlParams.share_user_id })
                        Util.ajax('auth/login', 'post', reqData).then(json => {
                            Util.setStorage('user_info', json)
                            let data = Object.assign({}, store, json)
                            if(json.avatar==false) {
                                self.setData({
                                    needNickName: true
                                })
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

                                        self.setData({
                                            needNickName: false
                                        })
                                        let reqData2 = Object.assign({},{
                                            login_id:json.login_id,
                                            token:json.token,
                                            nick_name: nickName,
                                            avatar: avatarUrl
                                        })
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
                                            url: '/pages/empower_tips/empower_tips?tips=2'+'&share_code=' + self.data.code + '&password=' + self.data.password
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
            self.setData({
                isShare: true
            })
        }

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
            let params = wx.getStorageSync('app');
            delete params.code;
            wx.setStorageSync('share_code', this.urlParams.code)
            self.setData({
                code: this.urlParams.code,
            })
            setTimeout(() => {
                params = Object.assign({}, params, {
                    share_code: this.urlParams.code,
                    login_id: wx.getStorageSync('user_info').login_id,
                    token: wx.getStorageSync('user_info').token,
                    share_user_id: this.urlParams.share_user_id,
                    type: '小程序'
                });
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
                    self.shareList = data.list.map((item, k) => {
                        if (item.file_type == 'video') {
                            item.activeP = '540';
                            item.activeUrl = item.project_file.resolution[0].src;
                            item.currentTime = 0;
                        }
                        return item;
                    });

                    self.setData({
                        shareList: self.shareList.length > 3 ? self.shareList.slice(0, 3) : self.shareList,
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
                        pc_link: data.pc_link,
                        collect_status: data.collect_status
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
                })
            },1500)
            
        } 

        Util.getSystemInfo().then(result => {
            self.setData({
                scrollHeight: result.windowHeight,
                videoWidth: Math.round(result.windowWidth)-28,
                videoHeight: Math.round(result.windowWidth*9/16),
                videoBoxHeight: Math.round(result.windowWidth*9/16)+60
            })  
        });
   
    },
    
    onShow() {
        let self = this
        self.pageCount = 1;
        console.log(this.urlParams, 'this.urlParams')
        if (!this.urlParams) {
            recordPageStart(PAGE_TYPES[2]);
        } else {
            recordPageStart(PAGE_TYPES[3]);
        }

        // 获取参与成员头像姓名
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, store, {
            project_id: wx.getStorageSync('project_id')
        })
        this.setData({
            templateShow: true
        })
    },

    onUnload() {
        pageStayStorage();
    },

    onHide() {
        pageStayStorage();
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
            password: this.data.password,
            share_user_id: this.urlParams.share_user_id,
            type: '小程序'
        }
        let store = wx.getStorageSync('user_info')
        let avatar = store.avatar
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
            self.shareList = data.list.map((item, k) => {
                if (item.file_type == 'video') {
                    item.activeP = '540';
                    item.activeUrl = item.project_file.resolution[0].src;
                    item.currentTime = 0;
                }
                return item;
            });
            self.setData({
                shareList: self.shareList.length > 3 ? self.shareList.slice(0, 3) : self.shareList,
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
                pc_link: data.pc_link,
                collect_status: data.collect_status
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

    onShareAppMessage: function (res) {
        if (res.from === 'button') {
            // 来自页面内转发按钮
        }
        // let passwordUrl = this.data.password == '' ?  '&password=""' :  ''
        let store = wx.getStorageSync('app');
        let codeUrl = encodeURIComponent('code=' + this.data.code + '&share_user_id=' + store.login_id);
        let projectName = wx.getStorageSync('project_name');
        return {
          title: this.data.shareName,
          path: '/pages/share_list_view/share_list_view?scene=' + codeUrl,
          imageUrl: './img/xinyue_share.png',
          success: function(res) {
            // 转发成功
            wx.showToast({
                title: '转发成功',
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
    // 收藏
    toCollect() {
        let self = this
        // console.log(self.data.collect_status,'collect_status')
        if(!self.data.collect_status) {
            let store = wx.getStorageSync('app')
            let reqData = Object.assign({}, {token: store.token},{login_id:store.login_id},{share_code:self.data.code},{collect_status:1})
            Util.ajax('collect/link', 'post',reqData).then(data => {
                wx.showToast({
                    title: '已收藏',
                    icon: 'success'
                })
                setTimeout(function(){
                    wx.hideLoading()
                },2000)
                self.setData({
                    collect_status: 1
                })
            }, res => {
                wx.showModal({
                    title:'提示',
                    content: res.data.msg,
                    showCancel: false,
                })
            })
 
        } else {
            let store = wx.getStorageSync('app')
            let reqData = Object.assign({}, {token: store.token},{login_id:store.login_id},{share_code:self.data.code},{collect_status:0})
            Util.ajax('collect/link', 'post',reqData).then(data => {
                wx.showToast({
                    title: '取消收藏',
                    icon: 'success'
                })
                setTimeout(function(){
                    wx.hideLoading()
                },2000)
                self.setData({
                    collect_status: 0
                })
            }, res => {
                wx.showModal({
                    title:'提示',
                    content: res.data.msg,
                    showCancel: false,
                })
            }) 
        }
        
    },
    // 复制链接
    copyTBL:function(e){  
        var self=this;
        var copypass = self.data.password?'密码:':''
        var more = self.data.password?"\n":""
        wx.setClipboardData({
            data: '链接:' + self.data.pc_link + more + copypass + self.data.password,
            success: function(res) {
                self.setData({copyTip:true}),  
                wx.showToast({
                    title: '已复制到剪贴板',
                    icon: 'success'
                })
                setTimeout(function(){
                    wx.hideLoading()
                },2000)
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
        let url = 'name=' 
        + name + '&id=' + id 
        + '&username=' + username + '&share=1'
        + '&project_id=' + this.data.projectId + '&review=' + this.data.review + '&share_all_version=' + this.data.review;
        let newurl = encodeURIComponent(url)
        let tourl = '/pages/info/info?scene=' + newurl
        wx.navigateTo({
            url:tourl,
        })
        // let url = '/pages/info/info?&name=' 
        //     + name + '&id=' + id 
        //     + '&username=' + username + '&share=1'
        //     + '&project_id=' + this.data.projectId + '&review=' + this.data.review + '&share_all_version=' + this.data.review;
        // wx.navigateTo({
        //     url: url,
        // })
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
    },
    // 返回首页
    backIndex() {
        wx.reLaunch({
            url: '/pages/empower_signin/empower_signin'
        })
    },


    handleFullScreen(e) {
        if (e.detail.fullScreen) {
            this.setData({
                fullScreenId: e.currentTarget.dataset.id
            });
        } else {
            this.setData({
                fullScreenId: 0
            });
        }
        console.log()
      
    },

    togglePSelectShow() {
        this.setData({
            PNoShow: !this.data.PNoShow
        });
    },

    changeVideoUrl(e) {
        let shareList = JSON.parse(JSON.stringify(this.data.shareList));
        
        new Promise((resolve, reject) => {
            shareList = shareList.map((item, k) => {
                if (item.id == this.data.fullScreenId) {
                    let res = item.project_file.resolution.filter((it, k) => {
                        return it.resolution ==  e.currentTarget.dataset.resolution;
                    })[0];
                    item.activeUrl = res.src;
                    item.activeP = res.resolution;
                }
                return item;
            });
            this.setData({
                shareList
            });
            resolve();
        }).then(() => {
            this.togglePSelectShow();
            let currentVideo = shareList.filter((item, k) => {
                return item.id == this.data.fullScreenId;
            })[0];
            setTimeout(() => {
                let video = wx.createVideoContext('media' + this.data.fullScreenId)
                video.seek(currentVideo.currentTime);
                video.play();       
            }, 300)
        });
    },

    videoTimeUpdate(e){
        let shareList = JSON.parse(JSON.stringify(this.data.shareList));

        shareList = shareList.map((item, k) => {
            if (item.file_type == 'video' && e.target.dataset.id == item.id) {
                item.currentTime = e.detail.currentTime;
            }
            return item;
        });

        this.setData({
            shareList
        });
    }

})