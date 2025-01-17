// pages/menu/menu.js
const config = require('../config/config');
const util = require('../../utils/util.js');
var Zan = require('../../wxss/dist/index');

Page(Object.assign({}, Zan.Switch, {
  test:function(e, index){
    console.log(e, index)
  },
  test2: function(e){
    //console.log(e)
  },
  /**
   * 页面的初始数据
   */
  data: {
    config,
    checked: true,
    dishesObjects: null,
    loading: true,
    edited: false,
    eatType: ["早餐", "午餐", "晚餐", "夜宵"],
    eatTypeIndex: 0
  },

  handleZanSwitchChange(e) {
    console.log(e)

    var param = {}
    var key = "dishesObjects[" + e.componentId + "].on"
    param[key] = e.checked
    this.setData(param);
    this.setData({
      edited : true
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.eatTypeIndex = options.eatType;
    this.setData({
      eatTypeIndex: options.eatType
    })
  },
  getDishesObjects(){
    var that = this

    util.request(config.WxApiRoot+"/api/food/search", { "eatType": that.data.eatTypeIndex }).then(function (res) {
      console.log(res.pageData);
      that.setData({
        dishesObjects: res.pageData,
        loading: false
      });

    });
    // wx.getStorage({
    //   key: 'dishesObjects',
    //   success: function (res) {
    //     console.log("成功获取到数据...")
    //     console.log(res)
    //     that.setData({
    //       dishesObjects: res.data,
    //       loading: false
    //     });
    //   },
    //   fail: function (e) {
    //     console.log(e,"没有找到，从配置中加载默认数据")
    //     //没有找到，从配置中加载默认数据
    //     wx.setStorage({
    //       key: "dishesObjects",
    //       data: config.dishesObjects,
    //       success: function (res){
    //         console.log("存储成功，重新读取...");
    //         that.getDishesObjects();
    //       },
    //       fail: function () {
    //         console.log("存储失败，提示用户...");
    //       }
    //     })
    //   }
    // })
  },
 
  deleteDish: function(e){
    var index = e.currentTarget.dataset.did
    var foodId = this.data.dishesObjects[index].foodId


    util.request(config.WxApiRoot +"/api/food/delete/" + foodId).then(function (res) {
      console.log(res);
      
    });
    this.getDishesObjects();
    // array.splice(index, 1)
    // this.setData({
    //   dishesObjects : array
    // })
    // this.setData({
    //   edited: true
    // })
  },
  setDefault: function(){
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定要恢复默认吗？',
      success: function (res) {
        that.setData({
          dishesObjects:null,
          loading: true
        })
        wx.removeStorage({
          key: 'dishesObjects',
          success: function (res) {
            that.getDishesObjects()
          }
        })
      }
    })
  },
  showAdd: function(){
    if(this.data.edited){
      wx.showModal({
        title: '提示',
        content: '修改未保存，确定要跳转吗？',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../menu_add/menu_add'
            })
          }
        }
      })
    }else{
      wx.navigateTo({
        url: '../menu_add/menu_add?eatType=' + this.data.eatTypeIndex
      })
    }
  },
  onUnload: function(){
    console.log("返回")
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
    console.log("hihi")
    this.getDishesObjects()
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
}))