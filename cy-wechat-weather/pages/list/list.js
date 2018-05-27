const daysList = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
Page({
  data:{
    weathers:[]
  },
  onLoad(){
    this._getWeatherList()
  },
  onPullDownRefresh() {
    this._getWeatherList(() => {
      wx.stopPullDownRefresh()
    })
  },
  _getWeatherList(callback){
    let _this = this;
    wx.request({
      url: 'https://test-miniprogram.com' + '/api/weather/future',
      data: {
        city: '北京市',
        time: new Date().getTime()
      },
      success: (req) => {
        if (req.data.code != 200) return false;
        _this._formatWeathers(req.data.result)
      },
      complete: callback
    })
  },
  _formatWeathers(result){
    let today = new Date()
    this.setData({
      weathers: result.map((el, index)=>{
        let temp = new Date()
        el.day = today.getDay() + index >= 7 ? daysList[(today.getDay() + index) % 7] : daysList[today.getDay() + index];
        el.date = this.formatDateObj(new Date(temp.setDate(today.getDate()+index)));
        el.tempStr = `${el.minTemp}˚-${el.maxTemp}˚`;
        el.weatherIcon = `/images/${el.weather}-icon.png`;
        return el
      })
    })
    console.log(this.data)
  },
  formatDateObj(date) {
    if (date instanceof Date)
      return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-')
    else return false
  }
})