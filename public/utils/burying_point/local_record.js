import { 
    START_PAGE_TIME,
    END_PAGE_TIME,
    FILE_PLAY_TIME,
    RELAY,
    PAGE_NAME,
    All_RECORD
} from './constants';

var Util = require('../util');
import Base64 from '../base64';

/**
 *对Date的扩展，将 Date 转化为指定格式的String
 *月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
 *年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 *例子：
 *(new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 *(new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
 */
Date.prototype.format = function (fmt) {
    let o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

//记录所有的记录
export function recordAll(o) {
    let allRecord = wx.getStorageSync(All_RECORD);;
   
    if (!allRecord) {
        allRecord = [];
    } else {
        allRecord = JSON.parse(allRecord);
    }

    allRecord.push({
        ...o, 
        created_at: (new Date()).format("yyyy-MM-dd hh:mm:ss"), 
        type: '小程序',
        user_id: wx.getStorageSync('user_info').login_id
    });

    wx.setStorageSync(All_RECORD, JSON.stringify(allRecord));
}

// 记录当前页面时间
export function pageStayStorage() {
    recordPageEnd();
    let startTime = JSON.parse(wx.getStorageSync(START_PAGE_TIME));
    let endTime = JSON.parse(wx.getStorageSync(END_PAGE_TIME));
    let o = {
        log_type: 'stayPage',
        begin_at: startTime.date_time,
        page_name: wx.getStorageSync(PAGE_NAME),
        stay_time: endTime.time - startTime.time
    };

    recordAll(o);
}

// 记录转发操作
export function relayStorage(trans_button, share_code, share_user_id) {
    let o = {
        log_type: 'relay',
        trans_button, // 复制链接及密码
        share_code,
        share_user_id
    };
    recordAll(o);
}

// 记录播放时长
// belong_id 项目id
// doc_id 文件id
export function playStorage(belong_id, doc_id, play_time, file_type) {
    let o = {
        log_type: 'play',
        belong_id,
        doc_id,
        play_time,
        file_type
    };
    recordAll(o);
}

export function clearStoragePlayTime() {
    wx.setStorageSync(FILE_PLAY_TIME, 0);
}

export function saveStoragePlayTime(time) {
    wx.setStorageSync(FILE_PLAY_TIME, time);
}

// 记录页面停留的开始时间
export function recordPageStart(page_name) {
    let time = Date.parse(new Date());
    let o = {
        date_time: (new Date()).format("yyyy-MM-dd hh:mm:ss"),
        time: time / 1000
    };
    wx.setStorageSync(START_PAGE_TIME, JSON.stringify(o));
    wx.setStorageSync(PAGE_NAME, page_name);
}

// 记录页面停留的结束时间
export function recordPageEnd() {
    let time = Date.parse(new Date());
    let o = {
        date_time: (new Date()).format("yyyy-MM-dd hh:mm:ss"),
        time: time / 1000
    };
    wx.setStorageSync(END_PAGE_TIME, JSON.stringify(o));
    return time;
}


// 轮询发送埋点
function sendRecord() {
    let data = wx.getStorageSync(All_RECORD);
    let base64 = new Base64();
    data = base64.encode(data);
    recordPageEnd();
    pageStayStorage();
    Util.ajax('save/log2', 'post', {
        data, 
        login_id: wx.getStorageSync('user_info').login_id,
        token: wx.getStorageSync('user_info').token,
    }).then(json => {
        wx.setStorageSync(All_RECORD, '[]');
    })
}

let recordTimer = setInterval(() => {
    sendRecord();
}, 30000);


