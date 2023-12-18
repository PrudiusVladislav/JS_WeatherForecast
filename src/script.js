
const weatherApiKey = 'b8d0c3223793216f2826446f80f57f88';
const weatherApiUrl = 'https://api.openweathermap.org/data/2.5/';
const nearbyCitiesApiUrl = 'http://geodb-free-service.wirefreethought.com/v1/geo/locations/';

async function fetchWeatherData(location, hourly = true, units = 'metric') {
  let apiUrl = weatherApiUrl;
  let queryParam = '';

  if (typeof location === 'string') {
    queryParam = `q=${location}`;
  } else if (Array.isArray(location) && location.length === 2) {
    queryParam = `lat=${location[0]}&lon=${location[1]}`;
  } else {
    throw new Error('Invalid location');
  }

  if (!hourly) {
    apiUrl += `weather?${queryParam}&exclude=current,minutely,hourly,alerts&units=${units}&appid=${weatherApiKey}`;
  } else {
    apiUrl += `forecast?${queryParam}&units=${units}&appid=${weatherApiKey}`;
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

async function validateNearbyCities(cityName) {
  try{
    const data = await fetchWeatherData(cityName, false);
    return true;
  }
  catch(error){
    return false;
  }
}

async function fetchNearbyCities(latitude, longitude, radius, offset = 0) {
  if (!/^[-+]/.test(latitude)) {
    latitude = `+${latitude}`;
  }
  if (!/^[-+]/.test(longitude)) {
    longitude = `+${longitude}`;
  }
  const apiUrl = `${nearbyCitiesApiUrl}${latitude}${longitude}/nearbyCities?radius=${radius}&offset=${offset}`;
  console.log(apiUrl);
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    const cityNames = data.data.map(city => city.name);
    return cityNames;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getValidatedNearbyCities(latitude, longitude, limit = 4, offset = 0) {
  let radius = 50;
  let validCityNames = [];

  while (validCityNames.length < limit) {
    const cityNames = await fetchNearbyCities(latitude, longitude, radius, offset);
    validCityNames = []; // Reset the array before fetching new cities
    for (const cityName of cityNames) {
      if (await validateNearbyCities(cityName)) {
        validCityNames.push(cityName);
        if (validCityNames.length === limit) {
          break;
        }
      }
    }
    radius += 50;
  }

  return validCityNames.slice(0, limit);
}

async function getCoordinates() {
  const coordinates = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
  const latitude = coordinates.coords.latitude;
  const longitude = coordinates.coords.longitude;
  return [latitude, longitude];
}

function getWeatherIconPath(iconName) {
  return `../assets/icons/${iconName}.png`;
}

function refresh_page() {
  window.location.reload();
}

function initializeHourlyWeatherTable() {
  const hourlyWeatherTable = document.getElementById('hourly-weather-table');
  hourlyWeatherTable.innerHTML = ` 
  <tr id="today-weather-time-row">
  <th>TODAY</th>
</tr>
<tr id="today-weather-forecast-row">
  <th>Forecast</th>
</tr>
<tr id="today-weather-temperature-row">
  <th>Temp (°C)</th>
</tr>
<tr id="today-weather-realfeel-row">
  <th>RealFeel</th>
</tr>
<tr id="today-weather-wind-row">
  <th>Wind (km/h)</th>
</tr>`;
}


async function loadHourlyWeatherDataToTable(weatherData, size = 6) {
  const hourlyWeatherTable = document.getElementById('hourly-weather-table');
  hourlyWeatherTable.innerHTML = '';
  initializeHourlyWeatherTable();
  const timeRow = document.getElementById('today-weather-time-row');
  const forecastRow = document.getElementById('today-weather-forecast-row');
  const tempRow = document.getElementById('today-weather-temperature-row');
  const realFeelRow = document.getElementById('today-weather-realfeel-row');
  const windRow = document.getElementById('today-weather-wind-row');

  try {
    weatherData.list.slice(0, size).forEach(item => {
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
  } catch (error) {
    console.log(error);
  }
}

async function loadTodayWeatherData(weatherData) {
  const currentDateElement = document.getElementById('current-weather-date');
  const currentLocation = document.getElementById('current-weather-location');
  const todayWeatherBox = document.getElementById('today-weather-box');

  currentDateElement.innerHTML = '';
  currentLocation.innerHTML = '';
  todayWeatherBox.innerHTML = '';

  currentDateElement.innerHTML = `<p>${new Date().toDateString()}</p>`;

  try {
    const weather = new TodayWeather(
      weatherData.dt,
      weatherData.weather[0].icon,
      weatherData.weather[0].description,
      weatherData.main.temp,
      weatherData.main.feels_like,
      weatherData.sys.sunrise,
      weatherData.sys.sunset
    );

    currentLocation.innerHTML = `<p>${weatherData.name}, ${weatherData.sys.country}</p>`;
    todayWeatherBox.innerHTML += weather.render();

  } catch (error) {
    console.log(error);
  }
}

class HourlyWeather {
  constructor(time, iconName, forecast, temp, realFeel, wind) {
    this.time = time;
    this.iconName = iconName;
    this.forecast = forecast;
    this.temp = temp;
    this.realFeel = realFeel;
    this.wind = wind;
  }

  render_time() {
    return `<td class="hourly-weather-time-icon-cell">
      <p class="hourly-weather-time">${this.time}</p>
      <img src="${getWeatherIconPath(this.iconName)}" class="hourly-weather-icon">
      </td>`;
  }

  render_forecast() {
    return `<td class="hourly-weather-forecast-cell">
      <p class="hourly-weather-forecast">${this.forecast}</p>
      </td>`;
  }

  render_temperature() {
    return `<td class="hourly-weather-temperature-cell">
      <p class="hourly-weather-temperature">${this.temp}</p>
      </td>`;
  }

  render_realFeel() {
    return `<td class="hourly-weather-realFeel-cell">
      <p class="hourly-weather-realFeel">${this.realFeel}</p>
      </td>`;
  }

  render_wind() {
    return `<td class="hourly-weather-wind-cell">
      <p class="hourly-weather-wind">${this.wind}</p>
      </td>`;
  }
}

class TodayWeather {
  constructor(date, iconName, forecast, temp, realFeel, sunrise, sunset) {
    this.date = date;
    this.iconName = iconName;
    this.forecast = forecast;
    this.temp = temp;
    this.realFeel = realFeel;
    this.sunrise = sunrise;
    this.sunset = sunset;
  }

  render() {
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
    </div>`;
  }
}

class NearbyCityWeather {
  constructor(cityName, weatherIcon, temperature) {
    this.cityName = cityName;
    this.weatherIcon = weatherIcon;
    this.temperature = temperature;
  }

  render() {
    return `
          <li class="nearby-city">
              <h4 class="city-name">${this.cityName}</h4>
              <img src="${getWeatherIconPath(this.weatherIcon)}" alt="Weather icon" class="weather-icon">
              <p class="temperature">${this.temperature}°C</p>
          </li>
      `;
  }
}

async function loadFromCoordinates() {
  try{
    const coordinates = await getCoordinates();

    const todayData = await fetchWeatherData(coordinates, false);
    await loadTodayWeatherData(todayData);

    const hourlyData = await fetchWeatherData(coordinates);
    await loadHourlyWeatherDataToTable(hourlyData);

    const cities = await getValidatedNearbyCities(coordinates[0], coordinates[1]);
    const citiesList = document.getElementById('nearby-cities-list');
    citiesList.innerHTML = '';
    for (const city of cities) {
      const data = await fetchWeatherData(city, false);
      console.log(data);
      const weather = new NearbyCityWeather(
        data.name,
        data.weather[0].icon,
        data.main.temp
      );
      citiesList.innerHTML += weather.render();
    }
  }
  catch(error){
    console.log(error);
  }
}

async function loadFromCityName(cityName) {
  try{
    const todayData = await fetchWeatherData(cityName, false);
    await loadTodayWeatherData(todayData);

    const hourlyData = await fetchWeatherData(cityName);
    await loadHourlyWeatherDataToTable(hourlyData);

    const cities = await getValidatedNearbyCities(todayData.coord.lat, todayData.coord.lon);
    const citiesList = document.getElementById('nearby-cities-list');
    citiesList.innerHTML = '';
    for (const city of cities) {
      console.log(city);
      const data = await fetchWeatherData(city, false);
      const weather = new NearbyCityWeather(
        data.name,
        data.weather[0].icon,
        data.main.temp
      );
      citiesList.innerHTML += weather.render();
    }
  }
  catch(error){
    console.log(error);
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  await loadFromCoordinates();
  document.getElementById('btn-search-by-name').addEventListener('click', async function () {
    await loadFromCityName(document.getElementById('input-city-name').value);
  });
});
