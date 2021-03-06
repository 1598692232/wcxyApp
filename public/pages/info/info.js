let Util = require('../../utils/util.js')

import { drawRect, drawArrow, drawLine } from '../../utils/draw.js'
const app = getApp()
//4f5875 b7bbd5
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
        videoTime: 0,
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
        sendCommentBtnStyle: '',
        prevCommentList: [],
        commentNotice: false,
        commentActiveIndex: 0
    },

    changeBtn(e) {
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
        }
    },

    // rgb(230, 116, 34)
    // rgb(26, 188, 161)
    // rgb(52, 163, 219)

    onReady: function (res) {
	    this.videoCtx = wx.createVideoContext('myVideo')
  	},

    onLoad(options) {
        let self = this
        wx.showLoading()
        wx.setStorage({
            key: 'info_data',
            data: ''
        })

        self.setData({
            project_id: options.projectId,
            doc_id: options.id,
            versionActive: options.id
        })
        wx.setNavigationBarTitle({title: options.name})        
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

        let getTimer = null

        // 监听请求是否成功
        let listenerSuccess = () => {
            setInterval(() => {
                if (!self.data.commentNotice) {
                    clearInterval(getTimer)
                    intervalGetCommentList()
                }
            }, 5000)
        }

        let intervalGetCommentList = () => {
            getTimer = setInterval(() => {
                getList()
            }, 5000)
        }

        let getList = () => {
            // listenerSuccess()
            self.data.commentNotice = false
            return Util.ajax('comment', 'get', reqData).then(json => {
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
                wx.showModal({
                    title: '提示',
                    content: '获取评论数据失败！',
                    showCancel: false
                })
            })
        }

        getList()
        setTimeout(() => {
            intervalGetCommentList()
        }, 5000)
    },

    changeVersion(e) {
        let self = this
        let store = wx.getStorageSync('app')
	    let reqData = Object.assign({}, store, {
	    	doc_id: e.currentTarget.dataset.id,
            project_id: this.data.project_id,
            show_completed: 1
        })

       
        self.getVideoInfo(store.host, reqData, (data) => {
            self.setData({
                doc_id:  e.currentTarget.dataset.id
            })

            data.versions.forEach(item => {
                if (item.doc_id == e.currentTarget.dataset.id) {
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
                versionNo: e.currentTarget.dataset.index,
                username: data.realname,
                createTime: Util.getCreateTime(data.created_at)
            })
            setTimeout(() => {
                self.videoCtx.seek(self.data.videoTime)
                self.videoCtx.play()
            }, 300)
        })

        self.getCommentList(reqData)
    },
    
    changeP(e) {
        let self = this
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
        }, 300)
        
        if (e.currentTarget.dataset.type != undefined && e.currentTarget.dataset.type == 'video') {
            self.setData({
                videoClicked: false
            })
        }  
    },

    onShow() {
        let self = this
        
        Util.getSystemInfo().then(res => {
            self.setData({
                scrollHeightAll: res.windowHeight,
                scrollHeight: res.windowHeight - 345,
                selectWidth: res.windowWidth - 20
            })

            let store = wx.getStorageSync('app')
        
            let reqData = Object.assign({}, store, {
                doc_id: self.data.doc_id,
                project_id: this.data.project_id,
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
                    versionNo: 1,
                    pNo: data.resolution[0].resolution,
                    url:  data.resolution[0].src,
                    username: data.realname,
                    createTime: Util.getCreateTime(data.created_at)
                })
            })
            self.getCommentList(reqData)
        })

    },

    //canvas遮罩，获取画图工具dom，返回Number
    getDrawControlPosition(x) {
        let drawControl = this.data.drawControl
        let self = this
        let tapIndex = ''
        // self.initDrawControlPosiotion()

        // setTimeout(() => {

            if(self.data.colorShow) {
                if (x > 0 && x < self.data.drawControl[6].width) {
                    return 6
                }
                // 这里的处理可能存在的bug：画板控制器闪屏或者js报错
                drawControl.forEach((item, key) => {
                    if (key <= 3) return
                    let offX = 0;
                    if (key > 5) {
                        for(let i = 6; i < key; i++){
                            if (self.data.drawControl[i]) {
                                offX += self.data.drawControl[i].width
                            }
                        }
                    } else {
                        for(let i = 0; i < key; i++){
                            if (self.data.drawControl[i]) {
                                offX += self.data.drawControl[i].width
                            }
                        }
                      
                    }
                   
                    if (item && x > offX && x < offX + item.width) {
                        tapIndex = key
                    } 
                    
                    if (tapIndex == '') {
                        tapIndex = 8
                    }
                   
                })
                
            } else {
                if (x > 0 && x < self.data.drawControl[0].width) {
                    return 0
                }
    
                drawControl.forEach((item, key) => {
                    if (key == 0) return
                    let offX = 0;
        
                    for(let i = 0; i < key; i++){
                        if (self.data.drawControl[i]) {
                            offX += self.data.drawControl[i].width
                        }
                    }
        
                    if (item && x > offX && x < offX + item.width) {
                        tapIndex = key
                    }
                })
            }

        // }, 100)
        
        return tapIndex;
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
                
            let key = this.getDrawControlPosition(this.data.thirdTap.x)
    
            if (key <= 3) {
                this.setData({
                    drawTypeActive: this.data.drawType[key].name
                }) 
                return 
            }
            
            let colors = ''
            switch(key) {
                case 4: 
                    this.toggleColorBlock()
                    break;
                case 5:
                    this.data.cxtShowBlock.clearRect(0,0, this.data.firstCanvasWidth, this.data.firstCanvasHeight)
                    this.data.commentDraw = []
                    this.videoCtx.play()
                    this.setData({
                        isFocus: false,
                        sendCommentBtnStyle: ''
                    })
                    break;
                case 6:
                    this.setData({
                        colorActive: this.data.noSelectColors[0]
                    })
                    colors = this.data.colors.filter(item => item != this.data.colorActive)
                    this.setData({
                        noSelectColors: colors
                    })

                    this.toggleColorBlock()
                    break;
                case 7:
                    this.setData({
                        colorActive: this.data.noSelectColors[1]
                    })
                    colors = this.data.colors.filter(item => item != this.data.colorActive)
                    this.setData({
                        noSelectColors: colors
                    })
                    this.toggleColorBlock()
                    break;
                case 8:
                    this.setData({
                        colorActive: this.data.noSelectColors[2]
                    })
                    colors = this.data.colors.filter(item => item != this.data.colorActive)
                    this.setData({
                        noSelectColors: colors
                    })
                    this.toggleColorBlock()
                    break;
            }

        }
    },
    // 画板空间事件触发结束

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

        this.data.cxtShowBlock.draw()

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
                    if (key > 5) {
                        res.width += 30
                    }
                    self.data.drawControl.push(res)
                }).exec()
        })
    },

 	// 评论输入框聚焦
	commentFocus() {
        let self = this

        let res = wx.getStorageSync('app')
        
        // 延时处理拖动不能获取播放时间的问题
        self.videoCtx.play()
        self.setData({
            muted: true,
            isFocus: true,
            cavansShow: false
        })

        setTimeout(() => {
            let context = wx.createCanvasContext('secondCanvas')
            let context2 = wx.createCanvasContext('firstCanvas')
    
            self.setData({
                cxt: context,
                cxtShowBlock: context2
            })

            self.data.cxtShowBlock.clearRect(0, 0, self.data.firstCanvasWidth, self.data.firstCanvasHeight)
            self.data.cxtShowBlock.draw()

            wx.createSelectorQuery().select('#firstCanvas').fields({
                dataset: true,
                size: true,
                scrollOffset: true,
                properties: ['scrollX', 'scrollY']
                }, function(res){
                    self.setData({
                        firstCanvasWidth: res.width,
                        firstCanvasHeight: res.height
                    })
                    self.initDrawControlPosiotion()
                }).exec()

            self.videoCtx.pause()
            let videoTime = self.data.videoTime
            self.setData({
                videoTime: videoTime - 0.5,
                muted: false
            })
            self.videoCtx.seek(videoTime - 0.5)
            self.setData({
                focusTime: parseInt(self.data.videoTime)
            })
        }, 500)
    },
    
    commentBlur() {
        this.videoCtx.play()
        // setTimeout(() => {
            this.setData({
                isFocus: false
            })
        // }, 500)

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

            wx.setStorageSync('info_data', infoData)
            if (isLogin) {
                wx.showModal({
                    title: '提示',
                    content: text,
                    success: function(res) {
                        if (res.confirm) {
                            wx.navigateTo({url: '/pages/signin/signin'})
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

        if (res.token == '') {
           returnTosignin('评论／回复需登录', false)
           return
        } 

        if (pids.indexOf(self.data.project_id) < 0) {
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
        })
   
        let reqData = Object.assign({}, store, {
	    	content: e.detail.value.commentText,
 			label: '',
 			media_time: self.data.focusTime,
 			doc_id: self.data.doc_id,
            project_id: wx.getStorageSync('project_id'),
            label: JSON.stringify(self.data.commentDraw)
        })

        Util.ajax('comment', 'post', reqData).then(json => {
            let list = self.data.commentList

            self.data.cxtShowBlock.clearRect(0, 0, self.data.firstCanvasWidth, self.data.firstCanvasHeight)

            wx.showToast({
                title: '评论成功！！'
            })

            let newComment = {
                content: e.detail.value.commentText,
                comment_time: Util.timeToMinAndSec(self.data.focusTime),
                media_time: self.data.focusTime,
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
                commentText: ''
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
            self.data.sendComment = false
        })

	 },

	 //跳到指定时间播放
	 toVideoPosition(e) {
        let self = this
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
	 	let time = e.currentTarget.dataset.time

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

 		this.videoCtx.seek(time)
        this.videoCtx.pause()

	 },

	 // 获取播放时间
	 getVideoTime(e) {
 		this.setData({
 			videoTime: e.detail.currentTime
 		})
	 },


     getVideoTime2(e) {
        this.setData({
            videoTime: this.data.videoTime
        })
     },


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
        let url = '/pages/info/info?id=' + this.data.doc_id + '&projectId=' + this.data.project_id
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
    }

})