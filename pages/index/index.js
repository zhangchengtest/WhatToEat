var Zan = require('../../wxss/dist/index');

const config = require('../config/config');
const util = require('../../utils/util.js');
const app = getApp()
const timer = null


console.log("开始检查更新...")
const updateManager = wx.getUpdateManager()

updateManager.onCheckForUpdate(function (res) {
  // 请求完新版本信息的回调
  console.log(res.hasUpdate)
})

updateManager.onUpdateReady(function () {
  wx.showModal({
    title: '更新提示',
    content: '新版本已经准备好，是否重启应用？',
    success: function (res) {
      if (res.confirm) {
        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
        updateManager.applyUpdate()
      }
    }
  })
})

updateManager.onUpdateFailed(function () {
  // 新的版本下载失败
  wx.showToast({
    title: '新的版本下载失败',
    icon: 'none',
    duration: 2000
  })
})

Page(Object.assign({}, Zan.TopTips, {
  data: {
    config,
    dishesObjects: null,
    dish: "吃什么呢？",
    keyword: '',
    btnText:"随机选择",
    isProcess:false,
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    count : 0,
    loading: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    // people: ["不限",'1狗', '2-4人', '5-8人', '8人以上'],
    // peopleIndex: 0,
    budget: ["不限", "随便凑合", "大吃一顿"],
    budgetIndex: 0,
    eatType: ["早餐", "午餐",  "晚餐", "夜宵"],
    eatTypeIndex: 0
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onPeopleChange(e) {
    this.showTopTips();
    this.setData({
      peopleIndex: e.detail.value
    });
  },
  onBudgetChange(e) {
    this.showTopTips();
    this.setData({
      budgetIndex: e.detail.value
    });
  },
  onEatTypeChange(e) {
    this.setData({
      eatTypeIndex: e.detail.value,
      dish: this.data.eatType[e.detail.value] + "吃什么呢？"
    });
   
    this.getDishesObjects();
    
  },
  toCustomMenu: function () {
    wx.navigateTo({
      url: '../menu/menu?eatType=' + this.data.eatTypeIndex
    })
  },
  toPie: function () {
    wx.navigateTo({
      url: '../pie/pie'
    })
  },
  toAbout: function () {
    wx.navigateTo({
      url: '../about/about'
    })
  },
  bindClickTap: function () {
    if (!this.data.hasUserInfo){
      wx.showModal({
        title: '提示',
        content: '请先登录',
        showCancel: false
      })
    }else{
      var that = this
      clearInterval(this.data.timer);
      if (this.data.isProcess) {
        console.log("停止")
        this.setData({
          isProcess: false,
          btnText: "随机选择"
        })

      } else {
        console.log("开始")

        console.log("length:"+that.data.dishesObjects.length)
        var newDishes = that.data.dishesObjects;
        console.log("length:" + newDishes)
        if (newDishes.length > 0) {
          this.setData({
            isProcess: true,
            btnText: "就它吧"
          })
          this.data.timer = setInterval(function () {
            var randomIndex = Math.floor((Math.random() * 100 % newDishes.length))
            var dishObject = newDishes[randomIndex]
            if (!newDishes[randomIndex].keyword) {
              newDishes[randomIndex].keyword = newDishes[randomIndex].name
            }
            that.setData({
              dish: newDishes[randomIndex].name,
              keyword: newDishes[randomIndex].keyword
            })
          }, 10);
        } else {
          wx.showModal({
            title: '提示',
            content: '菜单为空，请到自定义菜单中添加',
            showCancel: false
          })
        }
      }
    }
  },
  onLoad: function () {
    
    this.setData({
      dish: this.data.eatType[this.data.eatTypeIndex] + "吃什么呢？"
    })
   
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
        loading: false
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
            loading: false
          })
        }
      })
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
            loading: false
          })
        }
      })
    }
    this.checkUpdate();
    
  },
  getUserInfo: function(e) {
    console.log("hello");
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  showTopTips() {
    //this.showZanTopTips('条件选择暂时没法用，因为还没写完，我传上来看看效果');
  },
 
  getDishesObjects() {
    var that = this


    util.request(config.WxApiRoot+"/api/food/search", { "eatType": that.data.eatTypeIndex } ).then(function (res) {
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
    //     console.log(e, "没有找到，从配置中加载默认数据")
    //     //没有找到，从配置中加载默认数据
    //     wx.setStorage({
    //       key: "dishesObjects",
    //       data: config.dishesObjects,
    //       success: function (res) {
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
  recordData(dishName){
    wx.getStorage({
      key: 'confirmDishes',
      success: function (res) {
        console.log(res)
        if (res.data[dishName]){
          res.data[dishName] += 1
        } else {
          res.data[dishName] = 1
        }
        wx.setStorage({
          key: "confirmDishes",
          data: res.data
        })
      },
      fail: function (e) {
        var obj = new Object();
        obj[dishName] = 1;
        wx.setStorage({
          key: "confirmDishes",
          data: obj
        })
      }
    })
  },
  onShow: function () {
    this.getDishesObjects()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

    return {
      title: '不知道吃什么？进来选',
      path: '/pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  checkUpdate(){
  },
  bindGetUserInfo: function (e) {
    console.log("hello2");
    console.log(e.detail.userInfo)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
}))
