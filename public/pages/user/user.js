//index.js
//获取应用实例
let Util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    manager: app.data.staticImg.manager,
    realName: '',
    avatar: '',
    scrollHeight: '',
    end_at: '',
    storage_bili: '',
    project_count: '',
    member_count: '',
    storage: '',
    project: '',
    member: '',
    storage_jindu: '',
    project_jindu: '',
    member_jindu: ''
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

    let store = wx.getStorageSync('app')
    let reqData = Object.assign({}, {token: store.token},{login_id:store.login_id})
    Util.ajax('usage', 'get', reqData).then((data) => {
        let project_count = `${Math.floor(((data.project_count / data.project_max) * 100))}`
        let member_count = `${Math.floor(((data.member_count / data.member_max) * 100))}`
        self.setData({
          storage_jindu : Math.floor(((data.storage / data.storage_max) * 100)),
          project_jindu: data.project_max == '无限' ? '无限' : project_count,
          member_jindu: data.member_max == '无限' ? '无限' : member_count,

          end_at : data.end_at,
          storage_bili : Math.floor(((data.storage / data.storage_max) * 100)) + '%',
          project_count: data.project_max == '无限' ? '无限' : project_count>100?(parseInt(project_count) / 100).toFixed(2) + '倍': project_count + '%',
          member_count: data.member_max == '无限' ? '无限' : member_count>100 ? (parseInt(member_count) / 100).toFixed(2) + '倍': member_count + '%',
          
          storage: (data.storage / 1024 / 1024 / 1024).toFixed(2) + '/' + (data.storage_max / 1024 / 1024 / 1024).toFixed(1),
          project: data.project_count + '/' + data.project_max,
          member: data.member_count + '/' + data.member_max
        })
        self.onReady()
      }, () => {
          wx.showModal({
              title: '提示',
              content: '未获取到当前用户信息',
              showCancel: false
          })
      })
  },
  onReady: function () {  
    let self = this
    let oneRad = self.data.storage_jindu
    let twoRad = self.data.project_jindu=='无限'?1:self.data.project_jindu
    let threeRad = self.data.member_jindu=='无限'?1:self.data.member_jindu
    // 页面渲染完成  
    var cxt_arc = wx.createCanvasContext('canvasArc');//创建并返回绘图上下文context对象。  
    cxt_arc.setLineWidth(1);  
    cxt_arc.setStrokeStyle('#ffffff');  
    cxt_arc.setLineCap('round')  
    cxt_arc.beginPath();//开始一个新的路径  
    cxt_arc.arc(46, 46, 45, 0, 2*Math.PI, false);//设置一个原点(106,106)，半径为100的圆的路径到当前路径  
    cxt_arc.stroke();//对当前路径进行描边 
      
    cxt_arc.setLineWidth(2);  
    cxt_arc.setStrokeStyle('#0345C7');  
    cxt_arc.setLineCap('round')  
    cxt_arc.beginPath();//开始一个新的路径  
    
    cxt_arc.arc(46, 46, 45, -Math.PI * 1 / 2, -Math.PI * 1 / 2 + 2*Math.PI * oneRad, false);  
    cxt_arc.stroke();//对当前路径进行描边 
    cxt_arc.beginPath();
    
    // var rad = 2*Math.PI/4+Math.PI * 1 / 2;
    // console.log(rad,'radooo')
    // var x = 50 * Math.cos(rad);
    // var y = 50 * Math.sin(rad);
    // console.log(x,'x')
    // console.log(y,'y')
    // cxt_arc.arc(x, y, 2, 0, 2 * Math.PI, false);
    // cxt_arc.setFillStyle('#ffffff');
    // cxt_arc.fill(); 
  
    cxt_arc.draw();  


    var cxt_arc2 = wx.createCanvasContext('canvasArc2');//创建并返回绘图上下文context对象。  
    cxt_arc2.setLineWidth(1);  
    cxt_arc2.setStrokeStyle('#ffffff');  
    cxt_arc2.setLineCap('round')  
    cxt_arc2.beginPath();//开始一个新的路径  
    cxt_arc2.arc(46, 46, 45, 0, 2*Math.PI, false);//设置一个原点(106,106)，半径为100的圆的路径到当前路径  
    cxt_arc2.stroke();//对当前路径进行描边  
      
    cxt_arc2.setLineWidth(2);  
    cxt_arc2.setStrokeStyle('#0345C7');  
    cxt_arc2.setLineCap('round')  
    cxt_arc2.beginPath();//开始一个新的路径  

    cxt_arc2.arc(46, 46, 45, -Math.PI * 1 / 2, -Math.PI * 1 / 2 + 2*Math.PI * twoRad, false);  
    cxt_arc2.stroke();//对当前路径进行描边  
  
    cxt_arc2.draw();  


    var cxt_arc3 = wx.createCanvasContext('canvasArc3');//创建并返回绘图上下文context对象。  
    cxt_arc3.setLineWidth(1);  
    cxt_arc3.setStrokeStyle('#ffffff');  
    cxt_arc3.setLineCap('round')  
    cxt_arc3.beginPath();//开始一个新的路径  
    cxt_arc3.arc(46, 46, 45, 0, 2*Math.PI, false);//设置一个原点(106,106)，半径为100的圆的路径到当前路径  
    cxt_arc3.stroke();//对当前路径进行描边  
      
    cxt_arc3.setLineWidth(2);  
    cxt_arc3.setStrokeStyle('#0345C7');  
    cxt_arc3.setLineCap('round')  
    cxt_arc3.beginPath();//开始一个新的路径  
    cxt_arc3.arc(46, 46, 45, -Math.PI * 1 / 2, -Math.PI * 1 / 2 + 2*Math.PI * threeRad, false);  
    cxt_arc3.stroke();//对当前路径进行描边  
  
    cxt_arc3.draw(); 

      
  },  
  onShow: function () {  
    // 页面显示  
    let self = this
    self.setData({
      realName: wx.getStorageSync('user_info').realname?wx.getStorageSync('user_info').realname:wx.getStorageSync('user_info').nickName,
      avatar:  wx.getStorageSync('user_info').avatar?wx.getStorageSync('user_info').avatar:wx.getStorageSync('user_info').avatarUrl,
    })
  },  
  onHide: function () {  
    // 页面隐藏  
  },  
  onUnload: function () {  
    // 页面关闭  
  }, 

  // loginOut() {
  //     wx.navigateTo({
  //       url: '/pages/signin/signin?login_out=1'
  //     })
  // }
})
