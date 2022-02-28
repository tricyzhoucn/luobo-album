// pages/photo/photo.js
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    albumId: undefined,
    data: {
        albumId: '',
        photos: [],
        photosIds: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // 因为this.setState异步
        // 如果albumid在data中
        // 可能onshow取不到
        this.albumId = options.id
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
        this.getPhotos()
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

    },
    async getPhotos(){
        const db = wx.cloud.database({})
        const userinfo = await db.collection('album').doc(app.globalData.id).get()
        const albums = userinfo.data.albums
        const photos = albums[this.albumId].photos
        app.globalData.allData.albums[this.albumId].photos = photos
        const fileList = photos.map(photo => photo.fileID)
        const photosIds = []
        const realUrlsRes = await wx.cloud.getTempFileURL({ fileList }) 
        const realUrls = realUrlsRes.fileList.map(file => {
            photosIds.push(file.fileID)
            return file.tempFileURL
        })
        this.setData({
            albumIndex: this.albumId,
            photos: realUrls,
            photosIds: photosIds
        })
    },
    async previewImage(e){
        const curIndex = e.currentTarget.dataset.index
        const curUrl = this.data.photos[curIndex]
        wx.previewImage({
            current: curUrl,
            urls: this.data.photos,
        })
    },
    // 长按事件
    longpress (e) {
        const imgIndex = e.currentTarget.dataset.index
        // 展示操作菜单
        wx.showActionSheet({
            itemList: ['删除照片'],
            success: res => {
                if (res.tapIndex === 0) {
                    this.deleteFile(imgIndex)
                }
            }
        })
    },

    // 删除照片
    async deleteFile (idx) {
        const fileId = this.data.photosIds[idx]
        // 删除文件
        return wx.cloud.deleteFile({
            fileList:[fileId]
        }).then(res => {
            // 删除记录
            this.saveImageDelete(fileId)
        })
    },

    async saveImageDelete(fileId){
        const photos = app.globalData.allData.albums[this.albumId].photos
        const newFileIds = this.data.photosIds.filter(id=>id!==fileId)
        const newPhotos = photos.filter(photo=>!!~newFileIds.indexOf(photo.fileID))
        app.globalData.allData.albums[this.albumId].photos = newPhotos
        const db = wx.cloud.database({})
        db.collection('album').doc(app.globalData.id).update({
            data:{
                albums:db.command.set(app.globalData.allData.albums)
            }
        }).then(result=>{
            console.log('写入成功', result)
            wx.navigateBack()
        })
    }
})