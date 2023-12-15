




class HourlyWeather{
    constructor(time, forecast, temp, realFeel, wind){
        this.time = time;
        this.temp = forecast;
        this.temp = temp;
        this.realFeel = realFeel;
        this.wind = wind;
    }

    render_time(){
      return `<td class="hourly-weather-time-icon-cell">
      <p class="hourly-weather-time">${this.time}</p>
      <img src="${getIconPath(this.forecast)}" class="hourly-weather-icon">
      </td>`
    }

    render_forecast(){
      return `<td class="hourly-weather-forecast-cell">
      <p class="hourly-weather-forecast">${this.forecast}</p>
      </td>`
    }

    render_realFeel(){
      return `<td class="hourly-weather-realFeel-cell">
      <p class="hourly-weather-realFeel">${this.realFeel}</p>
      </td>`
    }

    render_wind(){
      return `<td class="hourly-weather-wind-cell">
      <p class="hourly-weather-wind">${this.wind}</p>
      </td>`
    }
}