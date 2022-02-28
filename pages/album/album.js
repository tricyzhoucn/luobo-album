// pages/album.js
// 获取应用实例
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    isLoaded: false,

    data: {
        albums: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        // 检查数据库中用户
        this.checkUser()
    },

    async checkUser () {
        const db = wx.cloud.database({})
        // 创建者和管理员可读写 其他用户只能读取自己用户信息
        const user = await db.collection('album').get()
        // 有用户获取信息
        if(user.data.length){
          const userinfo = user.data[0]
          app.globalData.hasUser = true
          app.globalData.id = userinfo._id
          app.globalData.allData.albums = userinfo.albums
          app.globalData.nickName = userinfo.nickName
        }
        // 没有就增加用户
        this.addUser(app.globalData.userInfo)
        // 从用户信息中获取相册
        this.getAlbums()
      },
    
      async addUser (user) {
        if (app.globalData.hasUser) {
            return
        }
        // 在此插入储存用户代码
        const db = wx.cloud.database({})
        let result = await db.collection('album').add({
          data:{
            nickName: user.nickName,
            albums: []
          }
        })
        app.globalData.hasUser = true
        app.globalData.id = result._id
        app.globalData.allData.albums = []
        app.globalData.nickName = user.nickName
      }, 

      async getAlbums(){
        const albums = app.globalData.allData.albums
        for(const album of albums){
            if(!album){
                continue
            }
            if(album.photos.length){
                const fileID = album.photos[0].fileID
                // 获取封面连接
                const { fileList } = await wx.cloud.getTempFileURL({
                    fileList: [fileID]
                })
                // 设置第一张照片为相册封面
                album.coverURL = fileList[0].tempFileURL
                continue
            }
            // 相册中无照片选择默认封面
            album.coverURL = '/images/default-cover.png'
        }
        this.setData({ albums: albums})
        this.isLoaded = true
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
        if (this.isLoaded) {
            this.getAlbums()
        }
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
})