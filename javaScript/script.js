const searchInput = document.getElementById("location-search");
const locationPng = document.getElementById("location");
const searchBtn = document.getElementById("location-search_btn");
const showCity = document.getElementById("header-city");
const showCountry = document.getElementById("header-country");
const showWeatherIcon = document.getElementById("header-icon");
const currentTemp = document.getElementById("header-temp");
const showWeatherDes = document.getElementById("header-condition_des");
const conditionFeels = document.getElementById("feels-temp");
const conditionHumidity = document.getElementById("humidity");
const conditionWind = document.getElementById("wind-speed");
const todayCondition = document.querySelector(".today-condition");
const lowTempContainer = document.querySelector(".data-low_temp");
const highTempContainer = document.querySelector(".high-temp");

const mainLoader = document.querySelector(".loader-main");
const header = document.querySelector(".header-container");
const main = document.querySelector(".main-container");

const API_KEY = "4909aa408fcfcf10b98e609a9458c16d";
const BASE_URL = "https://api.openweathermap.org/data/2.5/";
const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
let cityName = "Tehran";

const showData = async (data) => {
  mainLoader.style.display = "block";
  header.style.display = "none";
  main.style.display = "none";
  showCity.innerText = await data.name;
  showCountry.innerText = await data.sys.country;
  showWeatherIcon.src =
    await `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
  currentTemp.innerText = await parseInt(data.main.temp);
  headerTempStyle(data.main.temp);
  showWeatherDes.innerText = await data.weather[0].description;
  conditionFeels.innerText = await `Feels Like: ${data.main.feels_like} °`;
  conditionHumidity.innerText = await `Humidity: ${data.main.humidity} %`;
  conditionWind.innerText = await `Wind: ${data.wind.speed} m/s`;
  mainLoader.style.display = "none";
  header.style.display = "flex";
  main.style.display = "flex";
};

const todayForecastWeather = (data) => {
  todayCondition.innerHTML = "";
  data.list.forEach((item) => {
    const temp = parseInt(item.main.temp) + "°";
    const icon = item.weather[0].icon;
    const time = item.dt_txt.slice(10, 16);
    const dataJSX = `<div class="js-style1">
    <img src="http://openweathermap.org/img/w/${icon}.png">
    <span>${temp}</span>
    <span>${time}</span>
    </div>`;
    todayCondition.innerHTML += dataJSX;
  });
};

const futureDataShow = (data) => {
  lowTempContainer.innerHTML = "";
  highTempContainer.innerHTML = "";

  const result1 = data.list.filter((obj) => obj.dt_txt.includes("00:00:00"));
  const result2 = data.list.filter((obj) => obj.dt_txt.includes("12:00:00"));

  result1.forEach((item) => {
    const forecast = `
      <div class=data-container>
        <div class="data">
        <span class="future-day">${
          DAYS[new Date(item.dt * 1000).getDay()]
        }</span>
        <span class="future-date">${item.dt_txt.slice(0, 10)}</span>
        </div>
        <span class="future-temp">${parseInt(item.main.temp)} / </span>
      </div>
      <hr>
    `;
    lowTempContainer.innerHTML += forecast;
  });
  result2.forEach((i) => {
    const forecast = `
      <span class="future-temp">${parseInt(i.main.temp)}</span>
    `;
    highTempContainer.innerHTML += forecast;
  });
};

const headerTempStyle = (data) => {
  if (data <= 10) {
    currentTemp.style.color = "#6fb6f8";
  } else if (data <= 20) {
    currentTemp.style.color = "#ff8906";
  } else if (data <= 30) {
    currentTemp.style.color = "#f25f4c";
  }
};

const searchHandler = (data) => {
  cityName = searchInput.value;
  if (!searchInput.value || data.cod === "404") {
    cityName = "Tehran";
    setTimeout(() => {
      searchInput.value = "City Not Found";
      searchInput.style.color = "#f25f4c";
      searchInput.style.fontWeight = "bold";
    });
    setTimeout(() => {
      searchInput.value = "";
      searchInput.style.color = "#a7a9be";
      searchInput.style.fontWeight = "normal";
    }, 2000);
  }
  searchInput.value = "";
  fetchData();
};

const fetchFutureLocationData = async (lat, lon) => {
  const data = await fetch(
    `${BASE_URL}forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );
  const result = await data.json();
  futureDataShow(result);
};

const fetchLocationForecastData = async (lat, lon) => {
  const data = await fetch(
    `${BASE_URL}forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&cnt=5`
  );
  const result = await data.json();
  todayForecastWeather(result);
};

const fetchLocationData = async (lat, lon) => {
  const data = await fetch(
    `${BASE_URL}weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );
  const result = await data.json();
  showData(result);
};

const positionCallback = (position) => {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  fetchLocationData(lat, lon);
  fetchLocationForecastData(lat, lon);
  fetchFutureLocationData(lat, lon);
};

const errorCallback = (error) => {
  alert(error.message);
  console.log(error);
};

const locationHandler = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(positionCallback, errorCallback);
  } else {
    alert("Your Browser Dose Not Support GeoLocation");
  }
};

const fetchFutureData = async () => {
  const data = await fetch(
    `${BASE_URL}forecast?q=${cityName}&appid=${API_KEY}&units=metric`
  );
  const result = await data.json();
  futureDataShow(result);
};

const fetchTodayForecastData = async () => {
  const data = await fetch(
    `${BASE_URL}forecast?q=${cityName}&appid=${API_KEY}&units=metric&cnt=5`
  );
  const result = await data.json();
  todayForecastWeather(result);
};

const fetchData = async () => {
  try {
    const data = await fetch(
      `${BASE_URL}weather?q=${cityName}&appid=${API_KEY}&units=metric`
    );
    const result = await data.json();
    showData(result);
    fetchTodayForecastData();
    fetchFutureData();
    mainLoader.style.display = "none";
    header.style.display = "flex";
    main.style.display = "flex";
    if (result.cod === "404") {
      searchHandler(result);
    }
    console.log(result.cod);
  } catch (err) {
    alert("Please refresh again");
  }
};

window.addEventListener("DOMContentLoaded", fetchData);
searchBtn.addEventListener("click", searchHandler);
locationPng.addEventListener("click", locationHandler);

setTimeout(() => {
  location.reload();
}, 3600000);
