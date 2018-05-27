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

Page({
  data: {
    now: {
      temp: 0,
      weather: '',
      weatherBg: '/images/sunny-bg.png'
    },
    forecast: []
  },
  // 启动时调用启动页面的onLoad函数：
  onLoad() {
    this.getNow()
  },
  onPullDownRefresh (){
    this.getNow(()=>{
      wx.stopPullDownRefresh()
    })
  },
  getNow(callback){
    let _this=this
    wx.request({
      url: 'https://test-miniprogram.com'+'/api/weather/now?city='+'北京市',
      success: (req) => {
        if (req.data.code != 200) return false;
        console.log(req.data.result)
        let data = req.data.result
        let nowHour = new Date().getHours()
        _this.setData({
          now: {
            temp: data.now.temp +'˚',
            weather: weatherMap[data.now.weather],
            weatherBg: '/images/' + data.now.weather +'-bg.png'
          },
          forecast: data.forecast.map((el,index) => {
            if(index == 0){
              el.time = '现在'
            }else {
              let tempTime = nowHour + (index * 3)
              el.time = (tempTime >= 24 ? tempTime % 24 : tempTime) + '时'
            }
            el.temp += '˚'
            el.weatherIcon = '/images/' + el.weather + '-icon.png'
            return el
          })
        })
        wx.setNavigationBarColor({
          frontColor: '#000000',
          backgroundColor: weatherColorMap[data.now.weather],
        })
      },
      complete: callback
    })
  }
})