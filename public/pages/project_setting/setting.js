// pages/project_setting/setting.js
let Util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAdvanced: 0,//高级设置开关
    settings:{
      name: null,
      is_open: 1,
      is_notice: 1,
      collaborator_download: 1,
      collaborator_invite: 1,
      my_comment: 1,
      my_upload: 1,
      my_join: 1,
      else_comment: 1,
      else_upload: 1, 
      else_join: 1
    },//设置数据
    projectId: null,
    editIconLeft: 260,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let operate = options.operate;
    let self = this;
    if (operate == 'modify'){
      let projectId = options.projectId;
      let projectName = options.projectName;

      if(projectId == null && projectId == undefined) {
        failc(new Error('系统异常,无法获取数据。'))
        return false;
      }
      wx.getStorage({
        key: 'settingProjectData',
        success: function(res) {
          self.setData( {
            settings: res.data,
            projectId: res.data.id
          });
          console.log(self.data);
        },
      })

      wx.setNavigationBarTitle({
        title: '设置项目'
      });
      this.loadData(projectId);//加载数据
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  loadData: function(projectId) {

  },

  changeAdvanced: function(e) {
    this.setData({
      isAdvanced: !this.data.isAdvanced,
    });
  },

  createProject:function(params) {
    let store = wx.getStorageSync('app')
    let reqData = Object.assign({}, store, params)

    Util.ajax('project', 'post', reqData).then(json => {
      wx.showToast({
        title:'创建成功',
      });
      console.log(json);
      wx.navigateTo({
        url: '/pages/project_list/project_list?project_id=' + json.id + '&projectName=' + params.name
        + '&project_type=admin'
      })
    }, res => {
      wx.showModal({
        title: '提示',
        content: res.data.msg,
      })
    })
  },

  updateProject:function(params) {
    let store = wx.getStorageSync('app')
    let reqData = Object.assign({}, store, params)

    Util.ajax('project', 'put', reqData).then(json => {
      wx.showToast({
        title: '修改成功',
      });
      this.data.projectId = json.projectId;
      projectName = json.name;
      this.setData({
        settings: json,
      });
      wx.navigateBack(1);//返回上一页
    }, res => {
      wx.showModal({
        title: '提示',
        content: res.msg,
      })
    })
  },
  onSubmit:function() {
    console.log(this.data.settings);
    if (this.data.settings.name == null || this.data.settings.name == "" ){
      wx.showModal({
        title: '提示',
        content: '请输入项目名称',
      })
      return false;
    }
    if(this.data.projectId == null) {
      this.createProject(this.data.settings);
    }else{
      this.data.settings['project_id'] = this.data.projectId;
      this.updateProject(this.data.settings);
    }
  },
  changeForm: function(e) {
    let key = e.currentTarget.dataset.name;
    console.log(typeof (e.detail.value) === "boolean");
    this.data.settings[key] = typeof (e.detail.value) === "boolean" ? Number(e.detail.value) : e.detail.value;
    this.setData(this.data.settings);
  }
})