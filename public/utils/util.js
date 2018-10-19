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
  getCouponTime: getCouponTime
}
