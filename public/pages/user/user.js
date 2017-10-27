//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    manager: app.data.staticImg.manager,
    realName: wx.getStorageSync('app').realname,
    avatar: wx.getStorageSync('app').avatar == '' ? app.data.staticImg.manager : wx.getStorageSync('app').avatar,
    scrollHeight: ''
  },
 
  onLoad() {
    let self = this
    wx.getSystemInfo({
      success(res) {
          self.setData({
              scrollHeight: res.windowHeight 
          })
      }
    });
  },

  loginOut() {
      wx.navigateTo({
        url: '/pages/signin/signin?login_out=1'
      })
  }
})
