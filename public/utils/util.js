const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const getCreateTime = time => {
  let nowTime = Date.parse(new Date())
  let changeTime = (nowTime - time * 1000) / 1000 
  if (changeTime < 60) {
      return '刚刚'
  } else if(changeTime > 60 && changeTime <= 3600) {
      return parseInt(changeTime / 60) + '分钟前'
  } else if(changeTime > 3600 && changeTime <= 3600 * 24) {
      return parseInt(changeTime / 3600) + '小时前'
  } else if(changeTime > 3600 * 24) {
      return parseInt(changeTime / 3600 / 24) + '天前'
  }
}

const getCouponTime = time => {
    if(time.toString().length<=10){
        time=time*1000
    }
    var date = new Date(time)
    var month = date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1;
    var day = date.getDate()<10 ? '0'+date.getDate() : date.getDate(); 
    var hour  = date.getHours()<10 ? '0'+date.getHours() : date.getHours();
    var minute = date.getMinutes()<10 ? '0'+date.getMinutes():date.getMinutes();
    return month+'.'+day+'\n'+hour+':'+minute
}

const getCreateTimeDate = time => {
    if(time.toString().length<=10){
        time=time*1000
    }
    var date = new Date(time)
    var month = date.getMonth()+1;
    var day = date.getDate(); 
    return month+'月'+day+'日'
}

const getTimeDate = time => {
    if(time.toString().length<=10){
        time=time*1000
    }
    var date = new Date(time)
    var year = date.getFullYear();
    var month = date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1;
    var day = date.getDate()<10 ? '0'+date.getDate() : date.getDate(); 
    var hour  = date.getHours()<10 ? '0'+date.getHours() : date.getHours();
    var minute = date.getMinutes()<10 ? '0'+date.getMinutes():date.getMinutes();
    return year+'-'+month+'-'+day+'\n'+hour+':'+minute
}

const timeToMinAndSec = time => {
    if (time >= 1) {
        let minute = parseInt(time / 60) < 10 ? `0${parseInt(time / 60)}` : parseInt(time / 60)
        let seconds = parseInt(time % 60) < 10 ? `0${parseInt(time % 60)}` : parseInt(time % 60)
        return `${minute}:${seconds}`
    } else {
      return '00:00'
    }
}

let i=0
const ajax = (url, type, data, failHide, failClick) => {
    let hosts = wx.getStorageSync('app').host;  
    let host = (!hosts || hosts == '') ? 'http://www.uxinyue.com:81' : hosts;

    return new Promise((resolve, reject) => {
        wx.request({
            url: host + '/wxapi/' + url,
            data: data,
            header: {
                'content-type': 'application/json' // 默认值
            },
            method: type,
            credentials: 'include',
            success(res){
                wx.hideLoading()
                if (parseInt(res.data.status) == 1) {
                    resolve(res.data.data)
                } else {
                    reject(res)
                }
            },
            fail(res) {
                i++;
                if(i<=3){
                    wx.showLoading()
                    ajax(url, type, data)
                }else{
                    wx.showModal({
                        title: '提示',
                        content: '网络请求失败',
                        showCancel: false,
                        success(res) {
                            if (res.confirm) {
                                failClick && failClick();
                                // wx.showLoading()
                                // ajax(url, type, data)
                                // wx.hideLoading()
                            } 
                        }
                    })
                }  
                // if (failHide) return 
                // let rs = JSON.stringify(res)
                wx.hideLoading()
                // wx.showModal({
                //     title: '提示',
                //     content: '网络请求失败',
                //     showCancel: false,
                //     success(res) {
                //         if (res.confirm) {
                //             // failClick()
                //             wx.showLoading()
                //             ajax(url, type, data)
                //             // wx.hideLoading()
                //         } 
                //     }
                // })
            }
        })
    })
}

const setStorage = (key, data, completeCallback) => {
    return new Promise((resolve, reject) => {
        wx.setStorage({
            key: key,
            data: data,
            success(res) {
                resolve(res)
            },
            fail() {
                reject(res)
            },
            complete(res) {
                if (completeCallback) completeCallback(res)
            }
        })
    })
}

const getStorage = (key, data, completeCallback) => {
    return new Promise((resolve, reject) => {
        wx.getStorage({
            key: key,
            success(res) {
                resolve(res)
            },
            fail() {
                reject(res)
            },
            complete(res) {
                if (completeCallback) completeCallback(res)
            }
        })
    })
}

const getSystemInfo = (completeCallback) => {
    return new Promise((resolve, reject) => {
        wx.getSystemInfo({
            success(res) {
                resolve(res)
            },
            fail() {
                reject(res)
            },
            complete(res) {
                if (completeCallback) completeCallback(res)
            }
        })
    })
}

const formatVideoTime = (videoTime) => {
    let m = parseInt(videoTime / 60);
    let s = parseInt(videoTime) % 60;
    m = m >= 10 ? m : '0' + m;
    s = s >= 10 ? s : '0' + s;
    return m + ':' + s;
}


/**
 * base64加解密
 */
const Base64 = () => { 

    // private method for UTF-8 encoding 
    let _utf8_encode = function (string) { 
      string = string.replace(/\r\n/g,"\n"); 
      let utftext = ""; 
      for (var n = 0; n < string.length; n++) { 
       let c = string.charCodeAt(n); 
       if (c < 128) { 
        utftext += String.fromCharCode(c); 
       } else if((c > 127) && (c < 2048)) { 
        utftext += String.fromCharCode((c >> 6) | 192); 
        utftext += String.fromCharCode((c & 63) | 128); 
       } else { 
        utftext += String.fromCharCode((c >> 12) | 224); 
        utftext += String.fromCharCode(((c >> 6) & 63) | 128); 
        utftext += String.fromCharCode((c & 63) | 128); 
       } 
      
      } 
      return utftext; 
     }; 

       // private method for UTF-8 decoding 

  let _utf8_decode = function (utftext) { 
    let string = "", c1, c2; 
    let i = 0; 
    let c = c1 = c2 = 0; 
    while ( i < utftext.length ) { 
     c = utftext.charCodeAt(i); 
     if (c < 128) { 
      string += String.fromCharCode(c); 
      i++; 
     } else if((c > 191) && (c < 224)) { 
      c2 = utftext.charCodeAt(i+1); 
      string += String.fromCharCode(((c & 31) << 6) | (c2 & 63)); 
      i += 2; 
     } else { 
      c2 = utftext.charCodeAt(i+1); 
      c3 = utftext.charCodeAt(i+2); 
      string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)); 
      i += 3; 
     } 
    } 
    return string; 
   }; 
  
  // private property 
  let _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="; 
   
  // public method for encoding 
  this.encode = function (input) { 
   let output = ""; 
   let chr1, chr2, chr3, enc1, enc2, enc3, enc4; 
   let i = 0; 
   input = _utf8_encode(input); 
   while (i < input.length) { 
    chr1 = input.charCodeAt(i++); 
    chr2 = input.charCodeAt(i++); 
    chr3 = input.charCodeAt(i++); 
    enc1 = chr1 >> 2; 
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4); 
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6); 
    enc4 = chr3 & 63; 
    if (isNaN(chr2)) { 
     enc3 = enc4 = 64; 
    } else if (isNaN(chr3)) { 
     enc4 = 64; 
    } 
    output = output + 
    _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + 
    _keyStr.charAt(enc3) + _keyStr.charAt(enc4); 
   } 
   return output; 
  }; 
   
  // public method for decoding 
  this.decode = function (input) { 
   let output = ""; 
   let chr1, chr2, chr3; 
   let enc1, enc2, enc3, enc4; 
   let i = 0; 
   input = input.replace(/[^A-Za-z0-9\+\/\=]/g, ""); 
   while (i < input.length) { 
    enc1 = _keyStr.indexOf(input.charAt(i++)); 
    enc2 = _keyStr.indexOf(input.charAt(i++)); 
    enc3 = _keyStr.indexOf(input.charAt(i++)); 
    enc4 = _keyStr.indexOf(input.charAt(i++)); 
    chr1 = (enc1 << 2) | (enc2 >> 4); 
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2); 
    chr3 = ((enc3 & 3) << 6) | enc4; 
    output = output + String.fromCharCode(chr1); 
    if (enc3 != 64) { 
     output = output + String.fromCharCode(chr2); 
    } 
    if (enc4 != 64) { 
     output = output + String.fromCharCode(chr3); 
    } 
   } 
   output = _utf8_decode(output); 
   return output; 
  }; 
   

 } 

module.exports = {
  formatTime: formatTime,
  getCreateTime: getCreateTime,
  getCreateTimeDate: getCreateTimeDate,
  getTimeDate: getTimeDate,
  timeToMinAndSec: timeToMinAndSec,
  ajax: ajax,
  setStorage: setStorage,
  getStorage: getStorage,
  getSystemInfo: getSystemInfo,
  formatVideoTime,
  getCouponTime: getCouponTime,
  Base64
}
