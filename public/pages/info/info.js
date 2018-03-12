let Util = require('../../utils/util.js')

import { drawRect, drawArrow, drawLine } from '../../utils/draw.js'
const app = getApp();

const STAUS = {
    0: '移除标签',
    1: '审核通过',
    2: '进行中',
    3: '待审核',
    4: '意见搜集完成',
};

let au = 'http://video2.uxinyue.com/Act-mp3/84bafc35c2f24a5fa86ad703252c0d4f/946bb58cb645dbb79bbc77e3851075c4-bbc724b4be1dc17641a30fda1d1a65f2.mp3?OSSAccessKeyId=LTAILWCfmthKUqkk&Expires=1520857506&Signature=bfyrUor6oud2MAVO3ROjWNXoDsU%3D'

Page({

    data: {
	    scrollHeight: 0,
	    commentIsFocus: false,
	    commentList:[],
	    commentText: '',
        tx: app.data.staticImg.tx,
        zan: app.data.staticImg.zan,
        zanActive: app.data.staticImg.zanActive,
        page: 1,
        videoTime: '',
        focusTime: 0,
        url: '',
        name: '',
        tsx: '',
        tsy: '',
        tex: '',
        delTouching: false,
        showDel: false,
        muted: false,
        username:'',
        createTime: '',
        versionSelect: false,
        PSelect: false,
        selectY: '',
        selectWidth: '',
        arrowX: '',
        info: '',
        versionNo: 1,
        pNo: '',
        versions: '',
        ps: '',
        versionActive:0,
        Pactive: 0,
        fullScreen: false,
        fullScreenPSelect: false,
        videoClicked: false,
        sendComment: false,
        delComment: false,
        isFocus: false,
        videoCurrentTimeInt: new Date().getTime(),

        colorActive: '#E74A3C',
        colors: ['#E74A3C', '#E67422', '#1ABCA1', '#34A3DB'],
        noSelectColors: ['#E67422', '#1ABCA1', '#34A3DB'],
        colorShow: false,
        colorBlockAnimation: {},
        drawType:  [{name: 'rect', img: './img/kuang.png', activeImg: './img/kuang-active.png'}, 
                    {name: 'arrow', img: './img/jiantou.png', activeImg: './img/jiantou-active.png'},
                    {name: 'line', img: './img/line.png', activeImg: './img/line-active.png'},
                    {name: 'pen', img: './img/huabi.png', activeImg: './img/huabi-active.png'}],
        drawTypeActive: 'rect',
        cxt: '',
        cxtShowBlock: '',
        originPoint:{},
        drawing: false,
        rect: {tool: 'rect', color: '', x: '', y:'', w: '', h: '', size: 3},
        arrow: {tool: 'arrow', color: '', x1: '', y1:'', x2: '', y2: '', size: 3}, 
        line: {tool: 'line', color: '', x1: '', y1:'', x2: '', y2: '', size: 3}, 
        pen: {tool: 'pen', color: '', xs: '', ys:'', size: 3},
        commentDraw: [],
        firstCanvasWidth: '',
        firstCanvasHeight: '',
        cavansShow: false,
        drawControl: [],
        thirdTap:{x: '', y: '', x2:'', y2:'', startTime: 0, endTime: 0},
        fourthTap:{x: '', y: '', x2:'', y2:'', startTime: 0, endTime: 0},
        sendCommentBtnStyle: '',
        prevCommentList: [],
        commentNotice: false,
        commentActiveIndex: 0,
        getTimer: null,
        passwordModal: false,
        shareCode: null,
        options: {},
        linkPassword: '',
        videoPause: false,


        statusList: ['移除标签','审核通过','进行中','待审核','意见搜集完成'],
        statusVal: [0],
        statusActive: '',
        animationSelect: null,
        statusSelectShow: false,
        visibleStatusText:'审核',

        // versionsList: [1,2,3],
        versionVal: [0],
        versionActive: 1,
        animationSelect2: null,
        versionSelectShow: false,
        visibleVersionNo: 0,
        currentVideoTime: '00:00',

        poster: 'http://y.gtimg.cn/music/photo_new/T002R300x300M000003rsKF44GyaSk.jpg?max_age=2592000',
        name: '此时此刻',
        author: '许巍',
        src: au,

        audioPause: true,
        audioProgress: 0,
        audioProgressMaxWidth: 0,
        audioProgressNum: 0,
        audioTime: 0,
    },

    statusChange: function(e) {
        const val = e.detail.value;
        this.setData({
          statusActive: val[0] == 0 ? '审核' : this.data.statusList[val[0]],
          statusVal: val
        })
    },

    versionChange: function (e) {
        const val = e.detail.value;
        this.setData({
          versionActive: this.data.versions[val[0]],
          versionVal: val
        })
    },

    changeBtn(e) {
    
        this.setData({
            commentText: e.detail.value
        });
        
        if (e.detail.value != '' || this.data.commentDraw.length != 0) {
            this.setData({
                sendCommentBtnStyle: '#1125e5'
            })
        } else {
            this.setData({
                sendCommentBtnStyle: ''
            })
        }
    },

    firstCanvasTouchstart() {
        if (this.data.cavansShow && !this.data.isFocus) {
            this.setData({
                cavansShow: false
            })
            this.videoCtx.play()
            this.data.videoPause = false   
        }
    },

    // rgb(230, 116, 34)
    // rgb(26, 188, 161)
    // rgb(52, 163, 219)

    onReady: function (res) {
        let self = this;
        Util.getSystemInfo().then(res => {
            self.windowWidth = res.windowWidth
        })
        
        this.videoCtx = wx.createVideoContext('myVideo');
        this.audioCtx = wx.createAudioContext('myAudio');


  	},

    onLoad(options) {
        this.data.options = options
        let self = this
        wx.createSelectorQuery().select('#play-body').fields({
            dataset: true,
            size: true,
            scrollOffset: true,
            properties: ['scrollX', 'scrollY']
            }, function(res){
                if (!res) return;
                self.setData({
                    firstCanvasWidth: res.width,
                    firstCanvasHeight: res.height,
                    doc_id: options.id,
                    project_id: options.project_id
                })
         
            }).exec()

        wx.createSelectorQuery().select('#info-audio-progress').fields({
            dataset: true,
            size: true,
            scrollOffset: true,
            properties: ['scrollX', 'scrollY']
            }, function(res){
                if (!res) return;
                self.setData({
                    audioProgressMaxWidth: res.width,
                });
            }).exec(function (res) {
             
            })
    },

    onShow() {
        let self = this
        let scene = []
        let opt = {}
        wx.showLoading()
        wx.setStorage({
            key: 'info_data',
            data: ''
        })

        if (self.data.options.scene) {
            scene = decodeURIComponent(self.data.options.scene).split('=')
            // scene.forEach(item => {
            //     let it = item.split('=')
            //     opt[it[0]] = it[1]
            // })
            self.data.shareCode = scene[1]
            // self.setData({
            //     project_id: opt.project_id
            // })
            self.requestLinkShare(1).then(() => self.infoInit())
        } else {
            self.setData({
                project_id: this.data.options.project_id,
                doc_id: this.data.options.id,
                versionActive: this.data.options.id
            })
            self.infoInit()
        }
    },

    enterShareLink(e){
        this.data.linkPassword =  e.detail.value.linkPassword
        this.requestLinkShare(2).then(() => this.infoInit())
    },
 
    requestLinkShare(times) {
        let self = this
        let host = wx.getStorageSync('app').host || 'https://www.uxinyue.com'

        return new Promise((resolve, reject) => {

            let store = wx.getStorageSync('app')
            
            let reqData = Object.assign({}, store, {
                code: self.data.shareCode,
                password: self.data.linkPassword 
            })
            
            wx.request({
                url: host + '/wxapi/sharelink',
                data: reqData,
                header: {
                    'content-type': 'application/json' // 默认值
                },
                method: 'GET',
                success(res){
                    wx.hideLoading()
                    if (res.data.status == 1) {
                        wx.showLoading()
                        self.setData({
                            passwordModal: false,
                            project_id: res.data.data.project_id,
                            doc_id: res.data.data.files[0].id,
                            versionActive: res.data.data.files[0].id
                        })
                        resolve()
                    } else {
                        wx.hideLoading()
                        self.setData({
                            passwordModal: true
                        })
                        if (times != 1) {
                            wx.showModal({
                                title: '提示',
                                content: res.data.msg,
                                showCancel: false
                            })
                        }
                    }
                },
                fail(res) {
                    let rs = JSON.stringify(res)
                    wx.hideLoading()
                    wx.showModal({
                        title: '提示',
                        content: rs,
                        showCancel: false
                    })
                }
            })
        })
       
    },

    setScrollHeight(wh) {
        let self = this;
        let topNodes = ['#myVideo', '.send-comment', '.video-info'];
        let topHeight = 0;
        topNodes.forEach((item, k) => {
            wx.createSelectorQuery().select(item).fields({
                dataset: true,
                size: true,
                scrollOffset: true,
                properties: ['scrollX', 'scrollY']
            }, function(res){
                if (!res) return;
                topHeight += res.height;
                if (k == topNodes.length - 1) {
                    self.setData({
                        scrollHeight: wh - topHeight,
                    })     
                }
            }).exec();
        });
    },

    infoInit() {
        let self = this
        
        Util.getSystemInfo().then(res => {
            let topHeight = 0;
            self.setScrollHeight(res.windowHeight);

            self.setData({
                scrollHeightAll: res.windowHeight,
                // scrollHeight: res.windowHeight - 345,
                selectWidth: res.windowWidth - 20
            })

            let store = wx.getStorageSync('app')

            let reqData = Object.assign({}, store, {
                doc_id: self.data.doc_id,
                project_id: self.data.project_id,
                show_completed: 1
            })

            self.getVideoInfo(store.host, reqData, (data) => {
                data.versions.forEach((item, index)=> {
                    if (index == 0) {
                        item.activeVersion = true
                    } else {
                        item.activeVersion = false
                    }
                })

                data.resolution.forEach((item, k) => {
                    if (k == 0) {
                        item.activeP = true
                    } else {
                        item.activeP = false
                    }
                })

                self.setData({
                    versions: data.versions,
                    ps: data.resolution,
                    visibleStatusText: data.review == 0 ? '审核' :STAUS[data.review],
                    // versionNo: 1,
                    visibleVersion: 0,
                    pNo: data.resolution[0].resolution,
                    url:  data.resolution[0].src,
                    username: data.realname,
                    createTime: Util.getCreateTime(data.created_at),
                    audioTime: data.time
                });

                // console.log(self.data.versions)

                wx.setNavigationBarTitle({ title: data.name })   
            })
            self.getCommentList(Object.assign({}, reqData, {project_id: self.data.project_id}))
        })
    },
 
    toggleColorBlock() {
       let animation = wx.createAnimation({
            duration: 450,
            timingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
        })
        
        this.setData({
            colorShow: !this.data.colorShow
        })

        if (this.data.colorShow) {
            animation.translate('-100%').step()
        } else {
            animation.translate(0).step()
        }

        this.setData({
            colorBlockAnimation:animation.export()
        }) 
    },

    selectColor(e) {
        this.setData({
            colorActive: this.data.noSelectColor[e.currentTarget.dataset.key]
        })
    },

    selectDrawType(e) {
        this.setData({
            drawTypeActive: this.data.drawType[e.currentTarget.dataset.key].name
        }) 
    },

    getVideoInfo(host, reqData, fn) {
        let self = this
        wx.showLoading()

        Util.ajax('file/info', 'get', reqData).then(json => {
            self.setData({
                info: json,
            })
            if (fn != undefined) {
                fn(json)
            }
        }, res => {
            wx.showModal({
                title: '提示',
                content: '获取视频数据失败！',
                showCancel: ''
            })
        })
    },

    getCommentList(reqData){
        let self = this
        clearInterval(self.data.getTimer);

        let intervalGetCommentList = () => {
            self.data.getTimer = setInterval(() => {
                getList()
            }, 5000)
        }

        let getList = () => {
            // listenerSuccess()
            self.data.commentNotice = false
            return Util.ajax('comment', 'get', reqData, 1).then(json => {
                self.data.commentNotice = true
                if (self.data.prevCommentList != json.list) {
                    self.data.prevCommentList = json.list
                } else {
                    return;
                }  

                let appStore = wx.getStorageSync('app')
                json.list.map(item => {
                    item.comment_time = Util.timeToMinAndSec(item.media_time)
                    // item.media_time = parseInt(item.media_time)
                    item.avatar = item.avatar == '' ? self.data.tx : item.avatar
                    item.background = ''
                    item.translateX = ''
                    item.delTranstion = ''
                    if (self.data.commentActiveIndex == item.id) {
                        item.timeBackground = '#1125e5'
                    } else {
                        item.timeBackground = ''
                    }
                    if(appStore.login_id == item.user_id) {
                        item.delColor = '#f00'
                    } else {
                        item.delColor = '#ddd'
                    }
                })
                
                self.setData({
                    commentList: json.list,
                })
            }, res => {
                self.data.commentNotice = true
                // wx.showModal({
                //     title: '提示',
                //     content: '获取评论数据失败！',
                //     showCancel: false
                // })
            })
        }

        intervalGetCommentList()
        getList()
    },

    changeStatus() {
        let self = this;
        let store = wx.getStorageSync('app');
	    let reqData = Object.assign({}, store, {
            doc_id: self.data.doc_id,
            project_id: self.data.project_id,
            review: self.data.statusVal[0],
            _method: 'put'
        });

        self.toggleSelect(null, false, 'statusSelectShow', 'animationSelect');
        Util.ajax('file/review', 'post', reqData).then(json => {
            wx.showToast({
                title: '修改成功！',
                icon: 'success'
            });
            // console.log(statusList[statusVal[0]], 'ppp')
            self.setData({
                visibleStatusText: self.data.statusList[self.data.statusVal[0]]
            });
        }, () => {
            wx.showToast({
                title: '修改失败！'
            });
        });
    },

    changeVersion(e) {
        let self = this;

        if (self.data.versionVal[0] == self.data.visibleVersionNo) {
            self.toggleSelect(null, false, 'versionSelectShow', 'animationSelect2');
            return;
        }

        self.setData({
            cavansShow: false
        });

        
        
        let store = wx.getStorageSync('app')
	    let reqData = Object.assign({}, store, {
            // doc_id: e.currentTarget.dataset.id,
            doc_id: self.data.versionActive.id,
            project_id: this.data.project_id,
            show_completed: 1
        })
       
        self.getVideoInfo(store.host, reqData, (data) => {
            self.setData({
                doc_id: self.data.versionActive.id
            })

            data.versions.forEach(item => {
                if (item.doc_id == self.data.versionActive.id) {
                    item.activeVersion = true
                } else {
                    item.activeVersion = false
                }
            })

            data.resolution.forEach((item, k) => {
                if (item.resolution == self.data.pNo) {
                    item.activeP = true
                    self.setData({
                        url: item.src,
                    })
                } else {
                    item.activeP = false
                }
            })

            self.setData({
                versions: data.versions,
                ps: data.resolution,
                // versionNo: e.currentTarget.dataset.index,
                // versionNo: self.data.versionActive.version_no,
                visibleVersionNo: self.data.versionVal[0],
                username: data.realname,
                createTime: Util.getCreateTime(data.created_at)
            });

            self.toggleSelect(null, false, 'versionSelectShow', 'animationSelect2');

            setTimeout(() => {
                // self.videoCtx.seek(self.data.videoTime)
                self.videoCtx.seek(0)
                self.videoCtx.play()
                self.data.videoPause = false           
            }, 300)
            wx.setNavigationBarTitle({ title: data.name })
        })

        self.getCommentList(reqData)
    },
    
    changeP(e) {
        let self = this
        self.setData({
            cavansShow: false
        })

        self.data.ps.forEach(item => {
            if (item.resolution == e.currentTarget.dataset.resolution) {
                item.activeP = true
                self.setData({
                    url: item.src,
                    pNo: item.resolution,
                })
            } else {
                item.activeP = false
            }             
        })

        self.setData({
            ps: self.data.ps,
        })
        setTimeout(() => {
            self.videoCtx.seek(self.data.videoTime)
            self.videoCtx.play()
            self.data.videoPause = false            
        }, 300)
        
        if (e.currentTarget.dataset.type != undefined && e.currentTarget.dataset.type == 'video') {
            self.setData({
                videoClicked: false
            })
        }  
    },

    //画画空间加个canvas，防止键盘失效，tap手机不起作用，使用touchstart触发
    thirdDrawStart(e) {
        this.data.thirdTap.x = e.touches[0].x
        this.data.thirdTap.y = e.touches[0].y
        this.data.thirdTap.x2 = e.touches[0].x
        this.data.thirdTap.y2 = e.touches[0].y
        this.data.thirdTap.startTime = new Date().getTime()
        this.data.thirdTap.endTime = new Date().getTime()
    },
    
    thirdDrawMove(e) {
        this.data.thirdTap.x2 = e.touches[0].x
        this.data.thirdTap.y2 = e.touches[0].y
        this.data.thirdTap.endTime = new Date().getTime()
    },

    thirdDrawend(e) {
        if (Math.abs(this.data.thirdTap.x - this.data.thirdTap.x2) <= 20 
            && Math.abs(this.data.thirdTap.y - this.data.thirdTap.y2) <= 20
        && this.data.thirdTap.endTime - this.data.thirdTap.startTime <= 500) {
            // let key = this.getDrawControlPosition(this.data.thirdTap.x)

            let key = Math.floor(this.data.thirdTap.x / (this.data.firstCanvasWidth / 8)) ;

            if (key <= 3) {
                this.setData({
                    drawTypeActive: this.data.drawType[key].name
                }) 
            } else {
                this.setData({
                    colorActive: this.data.colors[key % 4]
                })
            }
        }
    },
    // 画板空间事件触发结束

    //input底部canvas，防止键盘失效，tap手机不起作用，使用touchstart触发
    fourthDrawStart(e) {
        this.data.fourthTap.x = e.touches[0].x
        this.data.fourthTap.y = e.touches[0].y
        this.data.fourthTap.x2 = e.touches[0].x
        this.data.fourthTap.y2 = e.touches[0].y
        this.data.fourthTap.startTime = new Date().getTime()
        this.data.fourthTap.endTime = new Date().getTime();

        if (this.data.fourthTap.x > this.data.firstCanvasWidth * 0.14 && this.data.fourthTap.x < this.data.firstCanvasWidth * 0.86) {
            this.data.allowTimeTap = true;
        } else {
            this.data.allowTimeTap = false;
        }
    },
    
    fourthDrawMove(e) {
        this.data.fourthTap.x2 = e.touches[0].x
        this.data.fourthTap.y2 = e.touches[0].y
        this.data.fourthTap.endTime = new Date().getTime()
    },

    fourthDrawend(e) {
        if (Math.abs(this.data.fourthTap.x - this.data.fourthTap.x2) <= 20 
            && Math.abs(this.data.fourthTap.y - this.data.fourthTap.y2) <= 20
        && this.data.fourthTap.endTime - this.data.fourthTap.startTime <= 500) {
            // 触发取消
            if (this.data.fourthTap.x <= this.data.firstCanvasWidth * 0.14) {
                this.commentBlur();
            }

            // 触发发送
            if (this.data.fourthTap.x >= this.data.firstCanvasWidth * 0.86) {
                this.sendComment();
            }

            // 触发时间
            if (this.data.fourthTap.x > this.data.firstCanvasWidth * 0.14 && this.data.fourthTap.x < this.data.firstCanvasWidth * 0.86) {
                if (this.data.commentDraw && !this.data.allowTimeTap) return;
                this.toggelNeedTime()
            }
        }
    },
    // input底部canvas事件触发结束


    //画画开始
    drawStart(e) {     
        if (!this.data.isFocus) return
        this.data.cxt.setLineWidth(1)
        this.data.originPoint.x = e.touches[0].x
        this.data.originPoint.y = e.touches[0].y
        this.data.drawing = true
        //pen
        if (this.data.drawTypeActive == 'pen') {
            this.data.cxt.moveTo( e.touches[0].x, e.touches[0].y)    
            this.data.pen.xs = [this.data.originPoint.x]
            this.data.pen.ys = [this.data.originPoint.y]       
        }
    },

    // rect: {tool: 'rect', color: '', x: '', y:'', w: '', h: ''},
    // arrow: {tool: 'arrow', color: '', x1: '', y1:'', x2: '', y2: ''}, 
    // line: {tool: 'line', color: '', x1: '', y1:'', x2: '', y2: ''}, 
    // pen: {tool: 'pen', color: '', xs: '', ys:''}

    drawMove(e) {
        if (!this.data.drawing || !this.data.isFocus
             || e.touches[0].x > this.data.firstCanvasWidth ||  
             e.touches[0].x < 0 || e.touches[0].y > this.data.firstCanvasHeight ||  e.touches[0].y < 0) return

        if (this.data.drawTypeActive == 'arrow') {
            this.data.cxt.setFillStyle(this.data.colorActive)
        } else {
            this.data.cxt.setStrokeStyle(this.data.colorActive)
            this.data.cxt.setLineWidth(3)
        }

        switch(this.data.drawTypeActive) {
            case 'rect':
                //rect
                this.data.rect.color = this.data.colorActive
                this.data.rect.x = this.data.originPoint.x
                this.data.rect.y = this.data.originPoint.y
                this.data.rect.w = e.touches[0].x - this.data.originPoint.x
                this.data.rect.h = e.touches[0].y - this.data.originPoint.y
                drawRect(this.data.cxt, this.data.originPoint.x, this.data.originPoint.y, e.touches[0].x - this.data.originPoint.x, e.touches[0].y - this.data.originPoint.y )
                this.data.cxt.draw()
                break;
            case 'arrow':
                //arrow
                this.data.arrow.color = this.data.colorActive
                this.data.arrow.x1 = this.data.originPoint.x
                this.data.arrow.y1 = this.data.originPoint.y
                this.data.arrow.x2 = e.touches[0].x
                this.data.arrow.y2 = e.touches[0].y
                drawArrow(this.data.cxt, this.data.originPoint.x, this.data.originPoint.y,  e.touches[0].x , e.touches[0].y)        
                this.data.cxt.draw()
                break
            case 'line':
                //line
                this.data.line.color = this.data.colorActive
                this.data.line.x1 = this.data.originPoint.x
                this.data.line.y1 = this.data.originPoint.y
                this.data.line.x2 = e.touches[0].x
                this.data.line.y2 = e.touches[0].y
                drawLine(this.data.cxt, this.data.originPoint.x, this.data.originPoint.y, e.touches[0].x, e.touches[0].y )
                this.data.cxt.draw()
                break
            case 'pen':
                //pen
                this.data.pen.color = this.data.colorActive
                this.data.pen.xs.push( e.touches[0].x)
                this.data.pen.ys.push( e.touches[0].y)
                drawLine(this.data.cxt,  this.data.originPoint.x, this.data.originPoint.y, e.touches[0].x, e.touches[0].y )
                this.data.originPoint.x = e.touches[0].x
                this.data.originPoint.y = e.touches[0].y
                this.data.cxt.draw(true)
                break
        }
    },

    drawend(e) {
        if (!this.data.isFocus) return
        this.data.drawing = false  
        let drawObj = {}
        switch(this.data.drawTypeActive) {
            case 'rect':
                drawObj = JSON.parse(JSON.stringify( this.data.rect))
                break;
            case 'arrow':
                drawObj = JSON.parse(JSON.stringify( this.data.arrow))
                break;
            case 'line':
                drawObj = JSON.parse(JSON.stringify( this.data.line))
                break;
            case 'pen':
                drawObj = JSON.parse(JSON.stringify( this.data.pen))
                break;
        }
        this.data.commentDraw.push(drawObj)
        this.data.commentDraw.forEach((item, key) => {             
            this.drawAll(item, false)    
        })

        this.data.cxtShowBlock.draw();

        if (this.data.commentDraw) {
            this.setData({
                needTime: true
            });
        }

        if (this.data.commentDraw.length != 0) {
            this.setData({
                sendCommentBtnStyle: '#1125e5'
            })
        }
    },
    // 画画结束

    // 画所有标记
    drawAll(item, isColor) {

        if (item.tool == 'arrow') {
            this.data.cxtShowBlock.setLineWidth(0)
        } else {
            this.data.cxtShowBlock.setLineWidth(3)
        }

        let getPositionXW = (value) => {
            return value * this.data.firstCanvasWidth
        }

        let getPositionYH = (value) => {
            return value * this.data.firstCanvasHeight
        }

        this.data.cxtShowBlock.beginPath()
        
        switch(item.tool) {
            case 'rect':
                //rect
                this.data.cxtShowBlock.setStrokeStyle(item.color)  
                isColor && item.label != '' ? 
                drawRect(this.data.cxtShowBlock, getPositionXW(item.x), getPositionYH(item.y), getPositionXW(item.w), getPositionYH(item.h)) :
                drawRect(this.data.cxtShowBlock, item.x, item.y, item.w, item.h)      
                // this.data.cxt.draw(true)              
                break
            case 'arrow':
                //arrow
                this.data.cxtShowBlock.setFillStyle(item.color)   
                isColor && item.label != '' ?  
                drawArrow(this.data.cxtShowBlock, getPositionXW(item.x1), getPositionYH(item.y1),  getPositionXW(item.x2) , getPositionYH(item.y2)) :
                drawArrow(this.data.cxtShowBlock, item.x1, item.y1,  item.x2 , item.y2)   
                // this.data.cxt.draw(true)
                break
            case 'line':
                //line
                this.data.cxtShowBlock.setStrokeStyle(item.color)  
                isColor && item.label != '' ?
                drawLine(this.data.cxtShowBlock, getPositionXW(item.x1), getPositionYH(item.y1),  getPositionXW(item.x2) , getPositionYH(item.y2)) :                
                drawLine(this.data.cxtShowBlock, item.x1, item.y1,  item.x2 , item.y2 )
                break
            case 'pen':
                //pen
                this.data.cxtShowBlock.setStrokeStyle(item.color)  
                for (let i = 0; i < item.xs.length - 1; i++) {
                    isColor && item.label != '' ? 
                    drawLine(this.data.cxtShowBlock, getPositionXW(item.xs[i]), getPositionYH(item.ys[i]), getPositionXW(item.xs[i + 1]), getPositionYH(item.ys[i + 1])) :
                    drawLine(this.data.cxtShowBlock, item.xs[i], item.ys[i], item.xs[i + 1], item.ys[i + 1] )                        
                }
                break
        }
        this.data.cxtShowBlock.closePath()
    },

    cancelCanvas() {
        this.data.cxtShowBlock.clearRect(0,0, this.data.firstCanvasWidth, this.data.firstCanvasHeight)        
        this.setData({
            cavansShow: false
        })
    },

    initDrawControlPosiotion() {
        let self = this
        let drawControl = []  
        for (let i = 0; i <= 8; i++) {
            drawControl.push(i)
        }
        self.data.drawControl = []
        drawControl.forEach((item, key) => {
            wx.createSelectorQuery().select(`#draw-control${item}`).fields({
                dataset: true,
                size: true,
                scrollOffset: true,
                properties: ['scrollX', 'scrollY']
                }, function(res){
                    if (!res) return;
                    // if (key > 5) {
                    //     res.width += 30
                    // }
                    self.data.drawControl.push(res)
                }).exec()
        })
    },

 	// 评论输入框聚焦
	commentFocus() {
        let self = this;

        let context = wx.createCanvasContext('secondCanvas')
        let context2 = wx.createCanvasContext('firstCanvas')

        self.setData({
            cxt: context,
            cxtShowBlock: context2
        })

        self.data.cxtShowBlock.clearRect(0, 0, self.data.firstCanvasWidth, self.data.firstCanvasHeight)
        self.data.cxt.clearRect(0, 0, self.data.firstCanvasWidth, self.data.firstCanvasHeight)
        self.data.cxtShowBlock.draw();
        self.data.cxt.draw();

        let res = wx.getStorageSync('app')
        // 延时处理拖动不能获取播放时间的问题
        // self.videoCtx.play()
        self.setData({
            muted: true,
            isFocus: true,
            cavansShow: false
        });

        let handlePauseVideoTime = () => {
            self.videoCtx.play()
            setTimeout(() => {
                // self.videoCtx.pause();
                // let ct = new Date().getTime();
                // let vt1 = self.data.videoTime;
                // let ms = ((ct - this.ms) % 1000) / 1000;
                // let vt2= self.data.videoTime + ms - 0.25; 
                // self.data.videoTime = parseInt(vt2) > parseInt(vt1) ? vt1 + 0.5 : vt2;
                // self.data.focusTime = self.data.videoTime;
                // console.log(self.data.focusTime, 'self.data.focusTime')
                // self.videoCtx.seek(self.data.focusTime)
                // self.data.videoPause = true

                self.videoCtx.pause()
                let ct1 = new Date().getTime();
                let ms = ct1 - self.data.videoCurrentTimeInt;
                self.data.focusTime = self.data.videoTime + parseInt(ms) / 1000 - 0.5;
                self.videoCtx.seek(self.data.focusTime)
                self.data.videoPause = true
            }, 500)
        }

        setTimeout(() => {
            self.initDrawControlPosiotion()
        }, 100)
        
        // self.setData({
        //     muted: false
        // })

        if (self.data.videoPause) {
            handlePauseVideoTime()
        } else {
            setTimeout(() => {
                let ct1 = new Date().getTime();
                let ms = ct1 - self.data.videoCurrentTimeInt;
                self.videoCtx.pause();
                self.data.focusTime =  self.data.videoTime + parseInt(ms) / 1000;
                self.data.videoPause = true  
            }, 100)
           
            //这里时间不够准确所以加个延时，将暂停借口移到最上方
            // setTimeout(() => {
            //     let ct = new Date().getTime();
            //     // let ms = ((ct - this.ms) % 1000) / 1000;
            //     let ms = new Date().getMilliseconds() / 1000;
            //     let vt1 = this.data.videoTime;
            //     let vt2 = this.data.videoTime + ms; 
            //     self.data.videoTime = parseInt(vt2) > parseInt(vt1) ? vt1 + 0.5 : vt2;
            //     self.data.focusTime =  self.data.videoTime;
            //     self.data.videoPause = true    
            // }, 100)
                    
        }
        
        // 为了防止暂停播放会+1秒
        // self.data.videoTime = ''
    },
    
    commentBlur() {
        this.data.commentDraw = [];
        this.videoCtx.play()
        this.setData({
            isFocus: false
        });
        // this.data.videoPause = false        
    },

    toggelNeedTime() {
        this.setData({
            needTime: !this.data.needTime
        })
    },

	// 发送评论
    sendComment(e) {
        let self = this

        let res = wx.getStorageSync('app')
        let pids = wx.getStorageSync('project_ids')
        
        let returnTosignin = (text, isLogin) => {
            let infoData = {
                url: self.data.url,
                name: self.data.name,
                project_id: wx.getStorageSync('project_id') || self.data.project_id,
                doc_id: self.data.doc_id,
                username: self.data.username,
                createTime: self.data.createTime,
                coverImg: self.data.coverImg
            }
            setTimeout(() => {
                self.videoCtx.pause()
            }, 1000)

            wx.setStorageSync('info_data', infoData)
            if (isLogin) {
                wx.showModal({
                    title: '提示',
                    content: text,
                    success: function(res) {
                        if (res.confirm) {
                            wx.navigateTo({url: '/pages/user/user'})
                            // wx.reLaunch({
                            //     url: '/pages/list/list'
                            // })
                        }
                    },
                    showCancel: false
                })
            } else {
                wx.showModal({
                    title: '提示',
                    content: text,
                    success: function(res) {
                        if (res.confirm) {
                            wx.navigateTo({url: '/pages/signin/signin'})
                        }
                    }
                })
            }
        }

        if (res.token == '' || !res.token) {
           returnTosignin('评论／回复需登录', false)
           return
        } 

        if (pids == undefined || pids.length == 0 || pids.indexOf(self.data.project_id) < 0) {
            returnTosignin('只有参与该项目的人才能评论', true)
            return
        }
	 
 		let comList = self.data.commentList
 		let time = self.data.focusTime
        let store = wx.getStorageSync('app')

        let getPerValueXW = (value) => {
            return value / self.data.firstCanvasWidth
        }       
        
        let getPerValueYH = (value) => {
            return value / self.data.firstCanvasHeight            
        }

 	
        wx.showLoading()

        if (self.data.sendComment) return
        self.data.sendComment = true

        self.data.commentDraw.forEach((item, key) => {
            switch(item.tool) {
                case 'rect':
                    //rect
                    item.x = getPerValueXW(item.x)
                    item.y = getPerValueYH(item.y)
                    item.w = getPerValueXW(item.w)
                    item.h = getPerValueYH(item.h)
                    break;
                case 'arrow':
                    //arrow
                    this.data.cxtShowBlock.setFillStyle(item.color)    
                    item.x1 = getPerValueXW(item.x1)
                    item.y1 = getPerValueYH(item.y1)
                    item.x2 = getPerValueXW(item.x2)
                    item.y2 = getPerValueYH(item.y2)
                    break
                case 'line':
                    //line
                    item.x1 = getPerValueXW(item.x1)
                    item.y1 = getPerValueYH(item.y1)
                    item.x2 = getPerValueXW(item.x2)
                    item.y2 = getPerValueYH(item.y2)
                    break
                case 'pen':
                    //pen
                    for (let i = 0; i < item.xs.length ; i++) {
                        item.xs[i] = getPerValueXW(item.xs[i])
                        item.ys[i] = getPerValueYH(item.ys[i])
                    }
                    break
            }
        });

        let reqData = Object.assign({}, store, {
	    	content: self.data.commentText,
 			media_time: self.data.focusTime,
 			doc_id: self.data.doc_id,
            project_id: wx.getStorageSync('project_id'),
            label: JSON.stringify(self.data.commentDraw),
        });

        if (!self.data.needTime) {
            delete reqData.media_time;
        }
        
        delete reqData.code;

        Util.ajax('comment', 'post', reqData).then(json => {
            let list = self.data.commentList

            self.data.cxtShowBlock.clearRect(0, 0, self.data.firstCanvasWidth, self.data.firstCanvasHeight)

            wx.showToast({
                title: '评论成功！！'
            });

            let newComment = {
                content: self.data.commentText,
                comment_time: Util.timeToMinAndSec(self.data.focusTime),
                media_time: self.data.needTime ? self.data.focusTime : -1,
                doc_id: self.data.doc_id,
                project_id: wx.getStorageSync('project_id'),
                id: json.id,
                realname: wx.getStorageSync('user_info').realname,
                avatar: wx.getStorageSync('user_info').avatar == '' ? self.data.tx : wx.getStorageSync('user_info').avatar,
                background: '',
                translateX: '',
                delTranstion: '',
                delColor: '#f00',
                user_id: wx.getStorageSync('app').login_id,
                label: JSON.stringify(self.data.commentDraw)
            }
            list.unshift(newComment)
            self.setData({
                commentList: list,
                commentText: '',
                isFocus: false
            })

            self.data.commentDraw = []

        }, res => {
            wx.showModal({
                title: '提示',
                content: '发表评论失败！',
                showCancel: false,
            })
        }).then((res) => {
            self.videoCtx.play()
            self.data.videoPause = false            
            self.data.sendComment = false
        })

    },

	 //跳到指定时间播放
	 toVideoPosition(e) {
        let self = this
        if (e.currentTarget.dataset.time < 0 ) return;
        this.setData({
            cavansShow: true,
            commentActiveIndex: e.currentTarget.dataset.id
        })
        setTimeout(() => {

            let context = wx.createCanvasContext('secondCanvas')
            let context2 = wx.createCanvasContext('firstCanvas')
    
            this.setData({
                cxt: context,
                cxtShowBlock: context2
            })

            wx.createSelectorQuery().select('#firstCanvas').fields({
                dataset: true,
                size: true,
                scrollOffset: true,
                properties: ['scrollX', 'scrollY']
                }, function(res){
                    if (!res) return;
                    self.setData({
                        firstCanvasWidth: res.width,
                        firstCanvasHeight: res.height
                    })
                }).exec()


                setTimeout(() => {
                    this.data.cxtShowBlock.clearRect(0, 0, this.data.firstCanvasWidth, this.data.firstCanvasHeight)
                    this.data.cxtShowBlock.draw()
                    
                    if (this.data.commentList[e.currentTarget.dataset.index].label != "") {
                        let draw = JSON.parse(this.data.commentList[e.currentTarget.dataset.index].label)
                        draw.forEach((item, key) => {             
                            this.drawAll(item, true)    
                        })
                        this.data.cxtShowBlock.draw()
                    }
                }, 100) 
                
        }, 50)

  
        
        // if (this.data.isFocus) return

        // 模拟时间点击
        let time = e.currentTarget.dataset.time;
        let timeInt = parseInt(time);
        let floatTime = time - timeInt + 0.5;
        this.videoCtx.seek(timeInt);

        setTimeout(() => {
            this.videoCtx.pause()
        }, floatTime)
 	
       
        this.data.commentList.map(item => {
            // item.background = ''
            item.timeBackground = '#535353'
            // item.nameColor = ''
        })
        // this.data.commentList[e.currentTarget.dataset.index].background = '#535353'
        this.data.commentList[e.currentTarget.dataset.index].timeBackground = '#1125e5'
        // this.data.commentList[e.currentTarget.dataset.index].nameColor = '#c6c6d0'
        this.setData({
            commentList: this.data.commentList
        })

 		// this.videoCtx.seek(time)
        // this.videoCtx.pause()
        self.data.videoPause = true        
	 },

    // 获取播放时间
    getVideoTime(e) {
        if (this.data.videoTime != parseInt(e.detail.currentTime)) {
            this.data.videoCurrentTimeInt = new Date().getTime();
        }
        this.data.videoTime = parseInt(e.detail.currentTime);
        this.setData({
            currentVideoTime: Util.formatVideoTime(this.data.videoTime)
        });
    },


    getVideoTime2(e) {
        this.data.videoPause = true;
        // let ms = new Date().getMilliseconds() / 1000;
        // this.data.videoTime = this.data.videoTime + ms; 
        // console.log(this.data.videoTime , 'this.data.videoTime ')
    },

    listenerPlay(e) {
        this.ms = new Date().getTime();

        this.data.videoPause = false
    },

    //  跳转回复页面
	 toBackPage(e) {
	 	// let commentCurrent = JSON.stringify(this.data.commentList[e.currentTarget.dataset.index])
        let res = wx.getStorageSync('app')
        let self = this
        if (res.token == '') {
            let infoData = {
                url: self.data.url,
                name: self.data.name,
                project_id: wx.getStorageSync('project_id') || self.data.project_id,
                doc_id: self.data.doc_id,
                username: self.data.username,
                createTime: self.data.createTime,
                coverImg: self.data.coverImg
            }

            wx.setStorageSync('info_data', infoData)

            wx.showModal({
              title: '提示',
              content: '评论／回复需登录',
              success: function(res) {
                if (res.confirm) {
                    wx.reLaunch({url: '/pages/signin/signin'})
                }
              }
            })

        } else { 

            wx.navigateTo({
              url: `/pages/call_back/call_back?commentId=${e.currentTarget.dataset.index}
              &docId=${this.data.doc_id}&projectId=${this.data.project_id}&avatar=${e.currentTarget.dataset.avatar}`
            })
        }
	 	
	 },

    onShareAppMessage () {
        //  self.data.shareCode = scene[1]
        let url = '/pages/info/info?id=' + this.data.doc_id + '&project_id=' + this.data.project_id

        if (this.data.shareCode ) {
            url = '/pages/info/info?scene=' + this.data.options.scene
        }
	    return {
	        title: this.data.info.name,
	        path: url,
	        imageUrl: this.data.info.cover_img[0]
	    }
	},

    // 删除评论 start
    delTouchStart(e) {

        this.data.commentList.map(item => {
            item.translateX = ''
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
        let tmy = e.touches[0].clientY
        let moveX = tmx - this.data.tsx
        if (!this.data.delTouching || Math.abs(tmy - this.data.tsy) > 5) return

        if (!this.data.showDel) {
            if (moveX > 0) return
            if (moveX < -100) {
                
               moveX = -100
                // moveX = -(Math.pow(Math.abs(moveX + 60), 0.8) + 60)
            }
            // if (moveX > 0) {
            //     moveX = Math.pow(moveX, 0.5)
            // }

            this.data.commentList[e.currentTarget.dataset.index].translateX = moveX
            this.setData({
                commentList: this.data.commentList,
                tex: tmx
            })
        } else {
            if (moveX < 0) return

            if (moveX > 100) {
                moveX = 0
                // moveX = Math.pow(Math.abs(moveX - 60), 0.5)
            } 
            // if (moveX < 0) {
                
                // moveX = -(Math.pow(Math.abs(moveX), 0.8) + 60)
            // } 
            // else {
            //     moveX = moveX - 60
            // }

            this.data.commentList[e.currentTarget.dataset.index].translateX = moveX
            this.setData({
                commentList: this.data.commentList,
                tex: tmx
            })
        }

     },

    delTouchEnd(e) {
        if (!this.data.delTouching) return

        this.setData({
            delTouching: false
        })

        if (this.data.commentList[e.currentTarget.dataset.index].translateX < -15) {
            this.data.commentList[e.currentTarget.dataset.index].translateX = -90
            this.data.commentList[e.currentTarget.dataset.index].delTranstion = 'del-transtion'
            this.setData({
                commentList: this.data.commentList,
                showDel: true,
            })
        } else {
            this.data.commentList[e.currentTarget.dataset.index].translateX = 0
            this.data.commentList[e.currentTarget.dataset.index].delTranstion = 'del-transtion'
            this.setData({
                commentList: this.data.commentList,
                showDel: false
            })
        }

        setTimeout(() => {
            if (this.data.commentList.length == 0 ||
                this.data.commentList[e.currentTarget.dataset.index].delTranstion == undefined) return
            this.data.commentList[e.currentTarget.dataset.index].delTranstion = 0
            this.setData({
                commentList: this.data.commentList,
            })
        }, 300)
    },

    handleDelComment(e) {
        let store = wx.getStorageSync('app')

        if (e.currentTarget.dataset.userid !== store.login_id) {
            wx.showModal({
                title: '提示',
                content: '你不是评论发布者，不能删除！',
                showCancel: false
            })
            return
        }

        let project_id = wx.getStorageSync('project_id')
        let reqData = Object.assign({}, {
            project_id: project_id,
            comment_id: this.data.commentList[e.currentTarget.dataset.index].id,
            doc_id: this.data.doc_id,
        }, store)
        let self = this

        self.setData({
            cavansShow: false
        })

        wx.showLoading({
            title: '正在删除...'
        })

        if (self.data.delComment) return
        self.data.delComment = true
        Util.ajax('comment', 'delete', reqData).then(json => {
            self.data.commentList.splice(e.currentTarget.dataset.index, 1)
            self.setData({
                commentList: self.data.commentList
            })
            wx.showToast({
                title: '删除成功！',
                icon: 'success'
            })
        }, res => {
            wx.showModal({
                title: '提示',
                content: '删除评论失败！',
                showCancel: false,
            })
        }).then(() => {
            self.data.delComment = false
        })
    },
    // 删除评论 end

    selectVersionAndP(e) {
        let self = this
        if (e.currentTarget.dataset.id == 'version-select') {
            self.setData({
                versionSelect: true
            })
        } else {
            this.setData({
                PSelect: true
            })    
        }
        
        let $ = wx.createSelectorQuery()

        $.select(`#${e.currentTarget.dataset.id}`).boundingClientRect()
        $.selectViewport().scrollOffset()
        $.exec(function(res){
            self.setData({
                arrowX:e.currentTarget.dataset.id == 'version-select' ? 10 : res[0].left + 10,
                selectY: res[0].top + 50,
            })     
        })

    },

    hideSelect() {
        this.setData({
            PSelect: false,
            versionSelect: false,
        })
    },

    handleFullScreen(e) {
        this.setData({
            fullScreen: e.detail.fullScreen ? true : false
        })
    },

    showPSelect() {
        this.setData({
            videoClicked: true
        })
    },
    hidePselect(){
        this.setData({
            videoClicked: false
        })
    },

    toggleSelect(e, isShow, fieldShow, feildAnimationSelect) {
        let show = null;
        let showField = null;
        let animationSelect = null;

        if (e) {
            show = e.currentTarget.dataset.show;
            showField = e.currentTarget.dataset.field;
            animationSelect = e.currentTarget.dataset.animation;
        } else {
            show = isShow;
            showField = fieldShow;
            animationSelect = feildAnimationSelect;
        }

        let animation = wx.createAnimation({
            duration: 300,
            timingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
        });

        let o = {};
        let o2 = {};

        if (show) {
            animation.translateY('-100%').step();
            o[showField] = show;
            this.setData(o);
            setTimeout(() => {
                o2[animationSelect] = animation.export();
                this.setData(o2);
            });
        } else {
            animation.translateY('0px').step();
            o2[animationSelect] = animation.export();
            this.setData(o2);
            setTimeout(() => {
                o[showField] = show;
                this.setData(o);
            }, 300);
        }
    },

    toggleAudio() {
        if (this.data.audioPause) {
            this.audioCtx.play();
            this.setData({
                audioPause: false
            });
        } else {
            this.audioCtx.pause();
            this.setData({
                audioPause: true
            });
        }
    },

    audioUpdate(e) {
        this.setData({
            audioProgress: e.detail.currentTime / e.detail.duration,
            audioProgressNum: e.detail.currentTime / e.detail.duration * this.data.audioProgressMaxWidth,
            audioTime: e.detail.duration
        })
    },

    audioTouchstart(e) {
        let offestX = this.windowWidth * 0.14 + this.windowWidth * 0.05;
        this.audioTouch = {
            x1: e.touches[0].clientX,
            offestX,
            startX: this.data.audioProgressNum,
            audioProgress: this.data.audioProgress
        }
    },

    audioTouchmove(e) {
        this.audioTouch.x2 = e.touches[0].clientX;
        let moveX = this.audioTouch.x2 - this.audioTouch.x1;
        let audioProgressNum = this.audioTouch.startX +  moveX;
        let audioProgress = audioProgressNum / this.data.audioProgressMaxWidth
        this.setData({
            audioProgress,
            audioProgressNum,
            audioPause: true
        });
        this.audioTouch.audioProgress = audioProgress;
        this.audioCtx.pause()
    },

    audioTouchend(e) {
        let currentTime = this.audioTouch.audioProgress * this.data.audioTime;
        this.audioCtx.seek(currentTime);
        this.audioCtx.play();
        this.setData({
            audioPause: false
        });
    }

})