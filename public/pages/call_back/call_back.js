var Util = require('../../utils/util.js');
const recorderManager = require('../../utils/recorderManager');
const innerAudioContext = require('../../utils/innerAudioContext');

const COMMENT_RECORD_PREFIXER = '<_XY_WXRECORD>';
const RECORD_DURATION = 300000;
const RECORD_CONFIG = {
    duration: RECORD_DURATION,
    sampleRate: 44100,
    numberOfChannels: 1,
    encodeBitRate: 192000,
    format: 'mp3',
    frameSize: 1000
};
const app = getApp();

Page({

    data: {
        scrollHeight: 0,
        callList: [],
        commentIsFocus: false,
        commentText: '',
        tx: app.data.staticImg.manager,
        zan: app.data.staticImg.zan,
        zanActive: app.data.staticImg.zanActive,
        currentComment: '',
        tsx: '',
        tex: '',
        tsy: '',
        delTouching: false,
        showDel: false,
        sendCallback: false,
        delCallback: false,

        commentType: 0,  //0:文字评论， 1:录音评论
        isRecording: false,
        isCancelRecord: false,
        commentPlayId: 0,
        commentPlayTimer: 0,
        commentPlaying: false
    },

   onLoad(options) {
    //    console.log(options, 'options')
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
    
                currentComment[0].comment_time = Util.timeToMinAndSec(currentComment[0].media_time);

                currentComment[0].record = null;
                if (currentComment[0].content.indexOf(COMMENT_RECORD_PREFIXER) > -1) {
                    currentComment[0].record = JSON.parse(JSON.parse(currentComment[0].content)[COMMENT_RECORD_PREFIXER]);
                    currentComment[0].content = '';
                }
    
                currentComment[0].replies.map(item => {
                    item.translateX = '',
                    item.delTranstion = ''
                    item.avatar = item.avatar == '' ? self.data.tx : item.avatar
                    if(appStore.login_id == item.user_id) {
                        item.delColor = '#f00'
                    } else {
                        item.delColor = '#ddd'
                    }

                    item.record = null;
                    if (item.content.indexOf(COMMENT_RECORD_PREFIXER) > -1) {
                        item.record = JSON.parse(JSON.parse(item.content)[COMMENT_RECORD_PREFIXER]);
                        item.content = ''
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

        });

        this.initRecord();
    },

     // 发送评论
     sendComment(e, record) {
        let self = this
        wx.showLoading()
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, store, {
            // content: e.detail.value.commentText,
            label: '',
            media_time: self.data.videoTime,
            doc_id: self.data.docId,
            project_id: wx.getStorageSync('project_id'),
            top_id: self.data.commentId
        });

        // 判断是否有录音
        if(record) {
            reqData.content = JSON.stringify(record);
        } else {
            reqData.content = e.detail.value.commentText;
        }



        if (self.data.sendCallback) return
        self.data.sendCallback = true

        Util.ajax('comment', 'post', reqData).then(json => {
            let list = self.data.callList
            wx.showToast({
                title: '回复成功！！'
            })
            let newCall= {
                // content: e.detail.value.commentText,
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

             // 判断是否有录音
             if(record) {
                newCall.content = '';
                newCall.record = JSON.parse(record[COMMENT_RECORD_PREFIXER]);
            } else {
                newCall.content = e.detail.value.commentText;
            }

            list.unshift(newCall)

            self.setData({
                callList: list,
                commentText: ''
            })

            wx.setNavigationBarTitle({title: `${list.length}条回复`})
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
    },
    // 删除回复 end


    initRecord() {
        const self = this;
        this.recordPath = '';
        this.iac = innerAudioContext();
        this.recordTimer = null;

        self.iac.onCanplay(res => {
            console.log(res, '可以播放')
        });

        self.iac.onError((res) => {
            // 播放音频失败的回调
            wx.showToast({
                title: '播放失败',
                icon: 'none'
            });
        });

        this.recorderManager = recorderManager({
            startEvent: (tempFilePath, res) => {
              
            },
            stopEvent:(tempFilePath, res) => {
                if (res.duration < 1000 && !self.data.isCancelRecord) {
                    wx.showToast({
                        title: '录音过短，请重新录音',
                        icon: 'none'
                    });
                    self.setData({
                        isRecording: false
                    });
                    return;
                }

                if (self.data.isCancelRecord) return;
          
                self.recordPath = tempFilePath;
                self.iac.src = tempFilePath; // 这里可以是录音的临时路径
                // self.iac.play();
                // wx.showLoading({
                //     mask: true
                // });
                self.uploadRecord(res);
                // self.sendComment(tempFilePath);
                
            }
        });

      
    },


    toggleCommentType() {
        const self = this;
        this.setData({
            commentType: this.data.commentType == 0 ? 1 : 0
        });

        wx.nextTick(() => {
            if (this.data.commentType == 1) {
                wx.createSelectorQuery().select('#record-btn').boundingClientRect(function(rect){
                    self.recordBtnTop = rect.top;
                }).exec()
            }
        });
      
    },

    startRecord() {
        this.recorderManager.start(RECORD_CONFIG);
        this.setData({
            isRecording: true
        });
        
        let RecordTime = RECORD_DURATION / 1000;
        let t = setInterval(() => {
            --RecordTime;
            if (RecordTime <= 0) {
                clearInterval(t);
                this.setData({
                    isRecording: false
                });
                return;
            }  
        }, 1000);
    },

    stopRecord() {
        this.recorderManager.stop();
        this.setData({
            isRecording: false
        });

        wx.nextTick(() => {
            setTimeout(() => {
                if (this.data.isCancelRecord) {
                    this.setData({
                        isCancelRecord: false
                    });
                }
            }, 500);
        });
        
    },

    cancelRecord(e) {
        const self =this;
        if (e.touches[0].clientY < self.recordBtnTop ) {
            wx.showToast({
                title: '已取消录音',
                duration: 1000,
                icon: 'none'
            });
            this.setData({
                isCancelRecord: true,
                isRecording: false
            });
        }
    },

    // 上传音频
    uploadRecord(record) {
        const self = this;
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, store, {
            filename: record.tempFilePath,
        });
        Util.ajax('voice', 'post', reqData).then(json => {
            const uploadTask = wx.uploadFile({
                url: json.host,
                filePath: record.tempFilePath,
                name: 'file',
                formData: {
                    "key": json.object_key,
                    "OSSAccessKeyId": json.accessid,
                    "policy": json.policy,
                    "signature": json.signature,
                    'success_action_status': '200',
                },
                success: function (uploadReslut) {
                  if (uploadReslut.statusCode != 200) {
                    failc(new Error('上传错误:' + JSON.stringify(res)))
                    // self.commentBlur();
                    wx.showToast({
                        title: '评论失败，请检查网络状态是否良好',
                        icon: 'none'
                    });
                    return false;
                  }
                  
                 
                }
            });

            // 语音最终上传格式为{"<_XY_WXRECORD>":"{\"path\":\"https://xinyuetest.oss-cn-shanghai.aliyuncs.com/wx_voice/c07cbfc9437570293be49cbe918fa92c-2dd9df7bb57c8dd4363a976bf140b63a.mp3\",\"duration\":2,\"fileSize\":12936}"}
            uploadTask.onProgressUpdate((res) => {
                if(res.progress>=100){
                    let finalRecord = {}
                    let tmpRecord = {
                        path: json.host + '/' + json.object_key,
                        duration: Math.ceil(record.duration / 1000),
                        fileSize: record.fileSize
                    }
                    finalRecord[COMMENT_RECORD_PREFIXER] = JSON.stringify(tmpRecord)
                    self.sendComment(null, finalRecord);
                }
            });
        })
    },

    recordPlay(e) {
        let commentPlayId = 0;
        let currentComment = null;
        if (e.currentTarget.dataset.callid) {
            commentPlayId = e.currentTarget.dataset.callid;
            currentComment = this.data.callList.filter(item => item.id ==  e.currentTarget.dataset.callid)[0];
        } else {
            currentComment = this.data.currentComment;
            commentPlayId = this.data.currentComment.id;
        }

        // 判断是否是点击的录音评论
        clearInterval(this.recordTimer);
        if (currentComment.record) {
            this.setData({
                commentPlayId,
                commentPlaying: true
            });
            this.handleRecord(currentComment.record);
        } else {
            this.iac.src = ''; 
            this.iac.pause();
        }
       
    },

    //  处理录音评论播放
    handleRecord(record) {
        this.iac.src = record.path; // 这里可以是录音的临时路径
        this.iac.play();
        let commentPlayTimer = parseInt(record.duration);
        this.setData({ commentPlayTimer });
        this.recordTimer = setInterval(() => {
            if (commentPlayTimer <= 0) {
                clearInterval(this.recordTimer);
                this.setData({
                    commentPlayTimer: 0,
                    commentPlaying: false
                });
                return;
            }
            commentPlayTimer--;
            this.setData({ commentPlayTimer });
        }, 1000)
        //todo::评论语音播放gif图显示
    },
})