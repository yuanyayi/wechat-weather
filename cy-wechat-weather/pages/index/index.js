const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}
const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({
  data: {
    city: '',
    now: {
      temp: 0,
      weather: '',
      weatherBg: '/images/sunny-bg.png'
    },
    forecast: [],
    today:{
      dateText: '',
      tempText: '',
    }
  },
  // 启动时调用启动页面的onLoad函数：
  onLoad() {
    this.getLocation()
    qqmapsdk = new QQMapWX({
      key: '7JNBZ-LD7CQ-5BO5H-GTLZZ-ZDEP6-IFFU2'
    });
  },
  onPullDownRefresh() {
    this.getNow(()=>{
      wx.stopPullDownRefresh()
    })
  },
  getNow(callback){
    let _this=this
    wx.request({
      url: 'https://test-miniprogram.com'+'/api/weather/now?city='+_this.data.city,
      success: (req) => {
        if (req.data.code != 200) return false;
        // console.log(req.data.result)
        _this._setNow(req.data.result)
        _this._setForecast(req.data.result)
        _this._setToday(req.data.result)
        wx.setNavigationBarColor({
          frontColor: '#000000',
          backgroundColor: weatherColorMap[req.data.result.now.weather],
        })
      },
      complete: callback
    })
  },
  _setNow(data) {
    this.setData({
      now: {
        temp: data.now.temp + '˚',
        weather: weatherMap[data.now.weather],
        weatherBg: '/images/' + data.now.weather + '-bg.png'
      }
    })
  },
  _setForecast(data) {
    let nowHour = new Date().getHours()
    this.setData({
      forecast: data.forecast.map((el, index) => {
        if (index == 0) {
          el.time = '现在'
        } else {
          let tempTime = nowHour + (index * 3)
          el.time = (tempTime >= 24 ? tempTime % 24 : tempTime) + '时'
        }
        el.temp += '˚'
        el.weatherIcon = '/images/' + el.weather + '-icon.png'
        return el
      })
    })
  },
  _setToday(data) {
    let date = new Date()
    this.setData({
      today: {
        dateText: this._formatDateObj(date),
        tempText: data ? [data.today.maxTemp + '˚', data.today.minTemp + '˚'].join(' - ') : ' -- '
      }
    })
  },
  onTapDayWeather() {
    wx.showToast()
    wx.navigateTo({
      url: '/pages/list/list?city='+this.data.city
    })
  },
  _formatDateObj(date){
    if (date instanceof Date)
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-')
    else return false
  },
  onTapLocationTips() {
    this.getLocation()
    this.getNow()
  },
  getLocation(){
    var _this = this
    // 获取经纬度
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success: function (res) {
        // console.log(res)
        // 获取城市名
        _this._getLocationCity(res.latitude, res.longitude)
      },
    })
  },
  _getLocationCity(mylatitude, mylongitude){
    var _this = this;
    qqmapsdk.reverseGeocoder({
      location:{
        latitude: mylatitude,
        longitude: mylongitude
      },
      success: (res) => {
        // 更新城市
        // console.log(res.result.address_component)
        if (res.result.address_component.city !== _this.data.city){
          _this.setData({
            city: res.result.address_component.city
          })
          this.getNow()
        }
      }
    })
  }
})