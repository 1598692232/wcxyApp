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

const timeToMinAndSec = time => {
    if (time >= 0) {
        let minute = parseInt(time / 60) < 10 ? `0${parseInt(time / 60)}` : parseInt(time / 60)
        let seconds = time % 60 < 10 ? `0${time % 60}` : time % 60
        return `${minute}:${seconds}`
    } else {
      return '00:00'
    }
}

module.exports = {
  formatTime: formatTime,
  getCreateTime: getCreateTime,
  timeToMinAndSec: timeToMinAndSec
}
