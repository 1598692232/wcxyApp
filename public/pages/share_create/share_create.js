let Util = require('../../utils/util.js')
var dateTimePicker = require('../../utils/dateTimePicker.js');
const app = getApp()

Page({
    data: {
        scrollHeight: 0,
        shareList: [],
        createShareList: [],
        shareListWidth: 0,
        inputValue: '',
        name: '',
        focus: false,
        allowApproval: true,
        showAllVersions: true,
        enableDownloading: true,
        requirePassword: true,
        deadline: false,
    },
    onLoad(options) {
		let self = this;
        Util.getSystemInfo().then(result => {
            self.setData({
                scrollHeight: result.windowHeight,
                shareListWidth: self.data.createShareList.length * 200
            })
            wx.setNavigationBarTitle({title: '创建分享'})
        })
        // 获取完整的年月日 时分秒，以及默认显示的数组
        var obj1 = dateTimePicker.dateTimePicker(this.data.startYear, this.data.endYear);
        // 精确到分的处理，将数组的秒去掉
        var lastArray = obj1.dateTimeArray.pop();
        var lastTime = obj1.dateTime.pop();
        this.setData({
            dateTimeArray1: obj1.dateTimeArray,
            dateTime1: obj1.dateTime
        });
        console.log(wx.getStorageSync('share_file'));
    },
    // 时间选择器
    changeDateTime1(e) {
        this.setData({ dateTime1: e.detail.value });
    },
    changeDateTimeColumn1(e) {
        var arr = this.data.dateTime1, dateArr = this.data.dateTimeArray1; 
        arr[e.detail.column] = e.detail.value;
        dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);
        this.setData({ 
         dateTimeArray1: dateArr,
         dateTime1: arr
        });
    },
    
    onShow() {
        let self = this
        let store = wx.getStorageSync('app')
        let reqData = Object.assign({}, store, {
            project_id: wx.getStorageSync('project_id')
        })
        self.setData({
            txList: [{name:'1月之前的后期素材',time:'1天前',num:7},{name:'1月之前的后期素材',time:'1天前',num:7}],
            createShareList: [{img:'',name:'月之前的后期素材.mp4'},{img:'',name:'月之前的后期素材.mp4'},{img:'',name:'月之前的后期素材.mp4'},{img:'',name:'月之前的后期素材.mp4'},],
            
        })
    },
    // 链接名称
    bindKeyInput(e) {
        this.setData({
            name: e.detail.value
        })
        console.log(this.data.name,'input66666666666666')
    },
    bindButtonTap: function() {
        this.setData({
            focus: true
        })
    },
    // 允许审阅
    switch1Change: function (e){
        this.setData({
            allowApproval: e.detail.value
        })
        console.log('允许审阅，携带值为', this.data.allowApproval)
    },
    // 显示所有版本
    switch2Change: function (e){
        this.setData({
            showAllVersions: e.detail.value
        })
        console.log('显示所有版本，携带值为', this.data.showAllVersions)
    },
    // 允许下载
    switch3Change: function (e){
        this.setData({
            enableDownloading: e.detail.value
        })
        console.log('允许下载，携带值为', this.data.enableDownloading)
    },
    // 密码
    switch4Change: function (e){
        this.setData({
            requirePassword: e.detail.value
        })
        console.log('密码，携带值为', this.data.requirePassword)
    },
    // 有效期
    switch1ChangeTime(e) {
        this.setData({
            deadline: e.detail.value
        })
        console.log('有效期，携带值为', this.data.deadline)
    },

    // 取消分享
    toCloseShareList(e) {
        wx.navigateBack()
    },
    // 保存分享
    toShareListView(e) {
        wx.navigateTo({
            url: '/pages/share_list_view/share_list_view'
        })
    },

})