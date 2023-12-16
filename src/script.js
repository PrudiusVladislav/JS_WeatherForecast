
const weatherApiKey = 'b8d0c3223793216f2826446f80f57f88';
const weatherApiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

const cityApiKey = "pk.74e5addfb02ad9ed9e2d96ef9df5d8de"
const cityApiUrl = "https://us1.locationiq.com/v1/reverse.php"

async function getCity(latitude, longitude, apiUrl=cityApiUrl, apiKey=cityApiKey) { 
  const url = `${apiUrl}?key=${apiKey}&lat=${latitude}&lon=${longitude}&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return `${data.address.city}, ${data.address.country}`;
  } catch (error) {
    return null;
  }
}

async function fetchWeatherData(city, apiUrl=weatherApiUrl, apiKey=weatherApiKey, units='metric') {
  const url = `${apiUrl}?q=${city}&units=${units}&appid=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

function getWeatherIconPath(iconName){
  return `../assets/icons/${iconName}.png`;
}

function loadWeatherDataToTable(cityName) {
  const timeRow = document.getElementById('today-weather-time-row');
  const forecastRow = document.getElementById('today-weather-forecast-row');
  const tempRow = document.getElementById('today-weather-temperature-row');
  const realFeelRow = document.getElementById('today-weather-realfeel-row');
  const windRow = document.getElementById('today-weather-wind-row');

  fetchWeatherData(cityName).then(data => {
    data.list.forEach(item => {
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
  }).catch(error => {
    // handleFetchWeatherDataError(error);
    console.log(error);
  });
}



class HourlyWeather{
    constructor(time, iconName, forecast, temp, realFeel, wind){
        this.time = time;
        this.iconName = iconName;
        this.temp = forecast;
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

function getinfo(){
  loadWeatherDataToTable("London");
}