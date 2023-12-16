
const weatherApiKey = 'b8d0c3223793216f2826446f80f57f88';
const weatherApiUrl = 'https://api.openweathermap.org/data/2.5/';

async function fetchWeatherData(latitude,longitude, hourly=true,
  apiUrl=weatherApiUrl, apiKey=weatherApiKey, units='metric') {
    if (!hourly){
      apiUrl += `weather?lat=${latitude}&lon=${longitude}&exclude=current, minutely, hourly, alerts&units=${units}&appid=${apiKey}`;
    }
    else{
      apiUrl += `forecast?lat=${latitude}&lon=${longitude}&units=${units}&appid=${apiKey}`;
    }
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

async function getCoordinates() {
  const coordinates = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
  const latitude = coordinates.coords.latitude;
  const longitude = coordinates.coords.longitude;
  return [latitude, longitude];
}

function getWeatherIconPath(iconName){
  return `../assets/icons/${iconName}.png`;
}

async function loadHourlyWeatherDataToTable(latitude, longitude, size=6) {
  const timeRow = document.getElementById('today-weather-time-row');
  const forecastRow = document.getElementById('today-weather-forecast-row');
  const tempRow = document.getElementById('today-weather-temperature-row');
  const realFeelRow = document.getElementById('today-weather-realfeel-row');
  const windRow = document.getElementById('today-weather-wind-row');
  

  try{
    const data = await fetchWeatherData(latitude, longitude);
    data.list.slice(0, size).forEach(item => {
      const weather = new HourlyWeather(
        item.dt_txt,
        item.weather[0].icon,
        item.weather[0].description,
        item.main.temp,
        item.main.feels_like,
        item.wind.speed
      );

      timeRow.innerHTML += weather.render_time();
      forecastRow.innerHTML += weather.render_forecast();
      tempRow.innerHTML += weather.render_temperature();
      realFeelRow.innerHTML += weather.render_realFeel();
      windRow.innerHTML += weather.render_wind();
    });
  }
  catch(error){
    console.log(error);
  }
}

async function loadTodayWeatherData(latitude, longitude) {
  const currentDateElement = document.getElementById('current-weather-date');
  const currentLocation = document.getElementById('current-weather-location');
  const todayWeatherBox = document.getElementById('today-weather-box');
  currentDateElement.innerHTML = `<p>${new Date().toDateString()}</p>`;

  try{
    const data = await fetchWeatherData(latitude, longitude, false);
    const weather = new TodayWeather(
      data.dt,
      data.weather[0].icon,
      data.weather[0].description,
      data.main.temp,
      data.main.feels_like,
      data.sys.sunrise,
      data.sys.sunset
    );
    currentLocation.innerHTML = `<p>${data.name}, ${data.sys.country}</p>`;
    todayWeatherBox.innerHTML += weather.render();
  
  }
  catch(error){
    console.log(error);
  }
}


class HourlyWeather{
    constructor(time, iconName, forecast, temp, realFeel, wind){
        this.time = time;
        this.iconName = iconName;
        this.forecast = forecast;
        this.temp = temp;
        this.realFeel = realFeel;
        this.wind = wind;
    }

    render_time(){
      return `<td class="hourly-weather-time-icon-cell">
      <p class="hourly-weather-time">${this.time}</p>
      <img src="${getWeatherIconPath(this.iconName)}" class="hourly-weather-icon">
      </td>`
    }

    render_forecast(){
      return `<td class="hourly-weather-forecast-cell">
      <p class="hourly-weather-forecast">${this.forecast}</p>
      </td>`
    }

    render_temperature(){
      return `<td class="hourly-weather-temperature-cell">
      <p class="hourly-weather-temperature">${this.temp}</p>
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

class TodayWeather{
  constructor(date, iconName, forecast, temp, realFeel, sunrise, sunset){
    this.date = date;
    this.iconName = iconName;
    this.forecast = forecast;
    this.temp = temp;
    this.realFeel = realFeel;
    this.sunrise = sunrise;
    this.sunset = sunset;
  }

  render(){
    const options = { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' };
    const sunriseTime = new Date(this.sunrise).toLocaleTimeString('en-US', options);
    const sunsetTime = new Date(this.sunset).toLocaleTimeString('en-US', options);

    return `<div class="today-weather-icon">
    <img src="${getWeatherIconPath(this.iconName)}">
    </div>
    <div class="today-weather-forecast">
    <p>${this.forecast}</p>
    </div>
    <div class="today-weather-temperature">
    <p>${this.temp}</p>
    </div>
    <div class="today-weather-realFeel">
    <p>${this.realFeel}</p>
    </div>
    <div class="today-weather-sunrise">
    <p>${sunriseTime}</p>
    </div>
    <div class="today-weather-sunset">
    <p>${sunsetTime}</p>
    </div>`
  }

}

async function getinfo(){
  const coordinates = await getCoordinates();
  await loadTodayWeatherData(coordinates[0], coordinates[1]);
  await loadHourlyWeatherDataToTable(coordinates[0], coordinates[1]);
}