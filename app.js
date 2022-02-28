// app.js
App({
  onLaunch() {

    // 初始化云函数
    wx.cloud.init({
      env: 'clouddev-7g02quzx6ce1a531',
      traceUser: true
    })

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // this.globalData.code = res.code
      }
    })
  },
  globalData: {
      hasUser: false, // 数据库中是否有用户
      hasUserInfo: false, // 小程序的userInfo是否有获取
      userInfo: null,
      checkResult: null,
      code: null,
      openId: null,
      flag: 0,
      nickName: '',
      allData: {
          albums: []
      },
      id: null
  }
})
