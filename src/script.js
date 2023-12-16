
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

async function loadWeatherDataToTable(latitude, longitude, size=6) {
  const timeRow = document.getElementById('today-weather-time-row');
  const forecastRow = document.getElementById('today-weather-forecast-row');
  const tempRow = document.getElementById('today-weather-temperature-row');
  const realFeelRow = document.getElementById('today-weather-realfeel-row');
  const windRow = document.getElementById('today-weather-wind-row');
  const currentLocation = document.getElementById('current-weather-location');

  try{
    const data = await fetchWeatherData(latitude, longitude);
    const location = `${data.city.name}, ${data.city.country}`;
    currentLocation.innerHTML = `<p>${location}</p>`;
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

async function getinfo(){
  const coordinates = await getCoordinates();
  await loadWeatherDataToTable(coordinates[0], coordinates[1]);
}