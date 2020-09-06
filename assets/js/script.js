// global variable for future reference
var searchFormEl = document.querySelector("#search-form");
var cityInputEl = document.querySelector("#user-city");
var searchHistoryEl = document.querySelector("#search-history");
var clearHistoryEl = document.querySelector("#clear-history");
var currentCityEl = document.querySelector("#current-city");
var currentTempEl = document.querySelector("#current-temp");
var currentHumidityEl = document.querySelector("#current-humidity");
var currentWindSpeedEl = document.querySelector("#current-wind-speed");
var currentUVIEl = document.querySelector("#current-UVI");
var currentCityIconEl = document.querySelector("#icon");


//create an array to store city data
var cities = [];

//load items from local storage
var loadCities = function () {
  //get items from storage if there are any
  cities = JSON.parse(localStorage.getItem("cities")) || [];

  //loop to make search history
  for (var i = 0; i < cities.length; i++) {
    var listEL = document.createElement("li");
    listEL.textContent = cities[i].toUpperCase();
    searchHistoryEl.appendChild(listEL);
  }
};

//pull data from weather API
var weatherNow = function (city) {
  var apiUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&units=imperial" +
    "&appid=729f5bb07186b173f99eddc857ac24ca";

  fetch(apiUrl).then(function(response) {
    if (response.ok) {
      response.json().then(function (data) {
        //display weather
        displayWeather(data, city);
      });
    } else {
      // redirect if not successful
      document.location.replace("./index.html");
    }
  });
};

var searchHandler = function (event) {
  event.preventDefault();
  var city = cityInputEl.value.trim();
  //create the search history dynamic list
  if (city) {
    weatherNow(city);
    fiveDayForecast(city);
    displaySearchHistory(city);
    cityInputEl.value = "";
  } else {
    return;
  }

  // store city in localStorage if not already there
  if (cities.indexOf(city) === -1) {
    cities.push(city);
    JSON.stringify(localStorage.setItem("cities", JSON.stringify(cities)));
  } else {
    return;
  }
};
//build search history list once a city has been searched
var displaySearchHistory = function (city) {
  //only add the city to the list if it doesn't already exist
  if (cities.indexOf(city) === -1) {
    var listEL = document.createElement("li");
    listEL.textContent = city.toUpperCase();
    $("#search-history").append(listEL);
  } else {
    return;
  }
};

//redisplay history city from history list
var historyCity = function (event) {
  var listEL = event.target;
  if (event.target.matches("li")) {
    weatherNow(listEL.textContent);
    fiveDayForecast(listEL.textContent);
  }
};

//CLear local storage history of cities
var clearHistory = function (event) {
  localStorage.clear();
  document.location.replace("./index.html");
};

//One City Daily Forecasy
var displayWeather = function (cityWeather) {
  //reformat datew
  var currentDate = moment.unix(cityWeather.dt).format("MM/DD/YYYY");
  //weather icon
  var icon = cityWeather.weather[0].icon;
  var iconUrl = "https://openweathermap.org/img/w/" + icon + ".png";
  currentCityIconEl.setAttribute("src", iconUrl);

  //current name and date
  currentCity = cityWeather.name + " " + currentDate;
  currentCityEl.textContent = currentCity;

  //current temperature
  var cityTemperature = Math.floor(cityWeather.main.temp);
  currentTempEl.textContent = cityTemperature;

  //current humidity
  var cityHumidity = cityWeather.main.humidity;
  currentHumidityEl.textContent = cityHumidity;

  //current wind speed
  var cityWindSpeed = cityWeather.wind.speed;
  currentWindSpeedEl.textContent = cityWindSpeed;

  //current uv index
  uvIndex(cityWeather);
};

//display that city's five day weather forecast
var fiveDayForecast = function (city) {
  var apiUrl =
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
    city +
    "&units=imperial" +
    "&appid=729f5bb07186b173f99eddc857ac24ca";

  fetch(apiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (cityWeather) {
      //loop through five day weather and display it in the corresponding html cards
      for (var i = 0; i < 5; i++) {
        //get date for each day
        var currentDate = moment
          .unix(cityWeather.list[(i + 1) * 8 - 1].dt)
          .format("dddd MM/DD/YYYY");
        //get weather icon for each day
        var icon = cityWeather.list[(i + 1) * 8 - 1].weather[0].icon;
        var iconUrl = "https://openweathermap.org/img/w/" + icon + ".png";
        //getting temperature for each day
        var cityTemperature = Math.floor(
          cityWeather.list[(i + 1) * 8 - 1].main.temp
        );
        //getting humidity for each day
        var cityHumidity = cityWeather.list[(i + 1) * 8 - 1].main.humidity;
        //update cards to display the appropriate weather for each day
        $("#forecast-city-date" + i).html(currentDate);
        $("#forecast-icon" + i).attr("src", iconUrl);
        $("#forecast-temp" + i).html("<br>" + cityTemperature);
        $("#forecast-humidity" + i).html("<br>" + cityHumidity);
      }
    });
};

var uvIndex = function (cityWeather) {
  //getting UV Index for the city searched for
  var currentLat = cityWeather.coord.lat;
  var currentLon = cityWeather.coord.lon;
  var uvApiUrl =
    "https://api.openweathermap.org/data/2.5/uvi?appid=729f5bb07186b173f99eddc857ac24ca&lat=" +
    currentLat +
    "&lon=" +
    currentLon;
  var uvIndex = fetch(uvApiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var currentUvIndex = data.value;
      currentUVIEl.textContent = currentUvIndex;

      //display appropriate color according to UVI severity
      if (currentUvIndex < 4) {
        currentUVIEl.classList = "favorable";
      } else if (currentUvIndex > 4 && currentUvIndex < 7) {
        currentUVIEl.classList = "moderate";
      } else if (currentUvIndex > 7) {
        currentUVIEl.classList = "severe";
      }
    });
};

//event listeners
searchFormEl.addEventListener("submit", searchHandler);
clearHistoryEl.addEventListener("click", clearHistory);
document.addEventListener("click", historyCity);

loadCities();