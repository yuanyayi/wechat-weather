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
// 获取地址权限状态
const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

const UNPROMPTED_TIPS = "点击获取当前位置"
const UNAUTHORIZED_TIPS = "点击开启位置权限"
const AUTHORIZED_TIPS = ""

// 引入腾讯定位js库
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({
  data: {
    city: '',
    now: {
      temp: 0,
      weatherBg: '/images/sunny-bg.png'
    },
    forecast: [],
    today: {
      dateText: '',
      tempText: '',
    },
    locationAuthType: UNPROMPTED,
    locationTipsText: UNPROMPTED_TIPS
  },
  // 页面从这里开始，onLoad函数：
  onLoad() {
    qqmapsdk = new QQMapWX({
      key: '7JNBZ-LD7CQ-5BO5H-GTLZZ-ZDEP6-IFFU2'
    });
    this.getLocation()
  },
  // 下拉刷新
  onPullDownRefresh() {
    this.getNow(() => {
      wx.stopPullDownRefresh()
    })
  },
  // 获取现在的天气
  getNow(callback) {
    let _this = this
    wx.request({
      url: 'https://test-miniprogram.com' + '/api/weather/now?city=' + _this.data.city,
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
    if(!this.data.city || this.data.city.replace(' ','') == ''){
      return false
    }
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city
    })
  },
  _formatDateObj(date) {
    if (date instanceof Date)
      return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-')
    else return false
  },
  onTapLocation() {
    if (this.data.locationType === UNAUTHORIZED) {
      wx.openSetting()
    } else {
      this.getLocation()
      this.getNow()
    }
  },
  getLocation() {
    var _this = this
    // 获取经纬度
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success: (res) => {
        // console.log(res)
        this.setData({
          locationType: AUTHORIZED,
          locationTipsText: AUTHORIZED_TIPS
        })
        // 根据经纬度获取城市名
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: (res) => {
            // 更新城市
            if (res.result.address_component.city !== _this.data.city) {
              _this.setData({
                city: res.result.address_component.city
              })
              this.getNow()
            }
          }
        })
      },
      // 权限被禁止：
      fail: () => {
        this.setData({
          locationType: UNAUTHORIZED,
          locationTipsText: UNAUTHORIZED_TIPS
        })
      }
    })
  }
})