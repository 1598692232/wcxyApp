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
        name: '新建链接',
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

        let dateTimeArray1 = obj1.dateTimeArray;
        let dateTime1 = obj1.dateTime;
        let timestr = dateTimeArray1[0][dateTime1[0]] + '-' + dateTimeArray1[1][dateTime1[1]] + '-' + dateTimeArray1[2][dateTime1[2]] + ' ' + dateTimeArray1[3][dateTime1[3]] + ':' + dateTimeArray1[4][dateTime1[4]];
        let timeInt = (new Date(Date.parse(timestr.replace(/-/g,"/")))).getTime() / 1000;

        this.setData({
            dateTimeArray1: obj1.dateTimeArray,
            dateTime1: obj1.dateTime,
            dateTimeText: timestr, 
            shareTimelimit: timeInt,
            createShareList: wx.getStorageSync('share_file')
        });
    },

    onShow() {
        let shareCreated = wx.getStorageSync('share_created');
        if (shareCreated == 1) {
            wx.navigateBack();
            return;
        }
    },

    // 时间选择器
    changeDateTime1(e) {
        let dateTimeArray1 = this.data.dateTimeArray1;
        let dateTime1 = this.data.dateTime1;
        this.setData({ dateTime1: e.detail.value });
        let timestr = dateTimeArray1[0][dateTime1[0]] + '-' + dateTimeArray1[1][dateTime1[1]] + '-' + dateTimeArray1[2][dateTime1[2]] + ' ' + dateTimeArray1[3][dateTime1[3]] + ':' + dateTimeArray1[4][dateTime1[4]];
        let timeInt = (new Date(Date.parse(timestr.replace(/-/g,"/")))).getTime() / 1000;
        this.setData({ dateTimeText: timestr, shareTimelimit: timeInt });
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
            // createShareList: [{img:'',name:'月之前的后期素材.mp4'},{img:'',name:'月之前的后期素材.mp4'},{img:'',name:'月之前的后期素材.mp4'},{img:'',name:'月之前的后期素材.mp4'},],
        })
    },
    // 链接名称
    bindKeyInput(e) {
        this.setData({
            name: e.detail.value
        });
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
        });
    },
    // 显示所有版本
    switch2Change: function (e){
        this.setData({
            showAllVersions: e.detail.value
        })
    },
    // 允许下载
    switch3Change: function (e){
        this.setData({
            enableDownloading: e.detail.value
        })
    },
    // 密码
    switch4Change: function (e){
        this.setData({
            requirePassword: e.detail.value
        })
    },
    // 有效期
    switch1ChangeTime(e) {
        this.setData({
            deadline: e.detail.value
        })
    },

    // 取消分享
    toCloseShareList(e) {
        wx.navigateBack()
    },
    // 保存分享
    toShareListView(e) {
        let doc_ids = [];
        for (let i in this.data.createShareList) {
            doc_ids.push(this.data.createShareList[i].id);
        }

        let params = {
            project_id: wx.getStorageSync('project_id'),
            doc_ids: doc_ids.join(','),
            name: this.data.name,
            review: this.data.allowApproval ? 1 : 0,
            show_all_version: this.data.showAllVersions ? 1 : 0,
            download: this.data.enableDownloading ? 1 : 0,
            switch_password: this.data.requirePassword ? 1: 0,
            deadline: this.data.deadline ? this.data.shareTimelimit : this.data.deadline
        }
        
        params = Object.assign({}, wx.getStorageSync('app'), params);

        Util.ajax('sharelink', 'post', params).then((data) => {
            wx.setStorageSync('share_created', 1);
            wx.redirectTo({
                url: '/pages/share_list_view/share_list_view?code=' + data.code + '&password=' + data.password
            })
        }, (res) => {
            wx.showModal({
                title: '提示',
                content: res.msg,
                showCancel: false
            })
        });

     
    },

})