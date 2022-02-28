// pages/photo/add.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        currentPhoto: false,
        albumIndex: -1,
        albums: [],
        photosOrigin: [],
        photosNew: [],
        newphotos_url: [],
        index: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad (options) {
        this.setData({
            // 上传到哪
            albumIndex: options.id,
            // 
            photosOrigin: app.globalData.allData.albums[options.id].photos
        })
    },
    
    formSubmit(e){
        wx.showLoading({
          title: '加载中',
        })
        // 并发上传图片
        const uploadTasks = this.data.photosNew.map(item => this.uploadPhoto(item.src))
        Promise.all(uploadTasks).then(result => {
            this.addPhotos(result, e.detail.value.desc)
            wx.hideLoading()
        }).catch(()=>{
            wx.hideLoading()
            wx.showToast({title: '上传图片错误', icon: 'error'})
        })
    },

    chooseImage: function(){
        const items = this.data.photosNew
        wx.chooseImage({
          count: 9,
          sizeType: ['original', 'compressed'],
          sourceType: ['album', 'camera'],
          success: res => {
              let tempFilePaths = res.tempFilePaths
              for(const tempFilePath of tempFilePaths){
                  items.push({
                      src: tempFilePath
                  })
              }
              this.setData({photosNew: items})
          }
        })
    },

    uploadPhoto(filePath){
        return wx.cloud.uploadFile({
            cloudPath: `${Date.now()}-${Math.floor(Math.random(0, 1)*10000000)}.png`,
            filePath
        })
    },

    previewImage(e){
        const current = e.target.dataset.src
        const photos = this.data.photosNew.map(photo => photo.src)
        wx.previewImage({
            current: current.src,
            urls: photos,
        })
    },

    cancel(e){
        const index = e.currentTarget.dataset.index
        const photos = this.data.photosNew.filter((p, idx) => idx !== index)
        this.setData({
            photosNew: photos
        })
    },

    addPhotos(photos, comment){
        const db = wx.cloud.database()
        const oldPhotos = app.globalData.allData.albums[this.data.albumIndex].photos
        const albumPhotos = photos.map(photo=>({
            fileID: photo.fileID,
            comments: comment
        }))

        app.globalData.allData.albums[this.data.albumIndex].photos = [...oldPhotos, ...albumPhotos]
        // 写入集合 
        db.collection('album').doc(app.globalData.id).update({
        data: { 
            albums: db.command.set(app.globalData.allData.albums)
        }})
        .then(result => {
            console.log('写入成功', result)
            wx.navigateBack() 
        })
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