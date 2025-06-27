const cities = [
  "Nairobi", "Mombasa", "Kisumu", "Naivasha", "Eldoret",
  "Nanyuki", "Malindi", "Thika", "Garissa", "Kericho"
];

const dashboard = document.getElementById("weather-dashboard");
const recPanel = document.getElementById("recommendation-panel");
const adminPanel = document.getElementById("admin-panel");
const searchBtn = document.getElementById("search-btn");
const loginBtn = document.getElementById("admin-login-btn");
const loginForm = document.getElementById("admin-login-form");
const logoutBtn = document.createElement("button");

let suggestions = [];
let isAdmin = false;

// Load suggestions
async function loadSuggestions() {
  const res = await fetch("http://localhost:3000/suggestions");
  suggestions = await res.json();
}

// Weather API
async function getCityWeather(city) {
  const res = await fetch(`https://wttr.in/${city}?format=j1`);
  const data = await res.json();
  const current = data.current_condition[0];
  return {
    city,
    temp: current.temp_C,
    condition: current.weatherDesc[0].value,
    icon: "https://img.icons8.com/fluency/48/000000/weather.png"
  };
}
