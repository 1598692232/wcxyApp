//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    manager: app.data.staticImg.manager,
    realName: '',
    avatar: '',
    scrollHeight: ''
  },
 
  onLoad() {
    let self = this
        
    wx.getSystemInfo({
      success(res) {
          self.setData({
              scrollHeight: res.windowHeight ,
              realName: wx.getStorageSync('user_info').realname,
              avatar:  wx.getStorageSync('user_info').avatar == '' ? app.data.staticImg.manager : wx.getStorageSync('user_info').avatar,
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
