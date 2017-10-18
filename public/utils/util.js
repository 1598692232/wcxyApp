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
console.log('util')

const getCreateTime = time => {
  // console.log(new Date(parseInt(time) * 1000).toLocaleString().substr(0,17))
  let nowTime = Date.parse(new Date())
console.log(nowTime, time)
  let changeTime = (nowTime - time * 1000) / 1000 
  console.log(changeTime, 77)
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

module.exports = {
  formatTime: formatTime,
  getCreateTime: getCreateTime
}
