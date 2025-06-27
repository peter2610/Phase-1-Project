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

// Display weather cards
async function displayWeather() {
  dashboard.innerHTML = "";
  for (const city of cities) {
    try {
      const weather = await getCityWeather(city);
      const card = document.createElement("div");
      card.className = "weather-card";
      card.innerHTML = `
        <h3>${weather.city}</h3>
        <img 
          src="${weather.icon}" 
          alt="${weather.condition}" 
          class="weather-icon"
          data-city="${weather.city}"
          data-temp="${weather.temp}"
          data-condition="${weather.condition}"
        />
        <p>${weather.temp}°C - ${weather.condition}</p>
        <button data-city="${weather.city}" data-weather="${weather.condition}">See Suggestions</button>
      `;
      card.querySelector("img").addEventListener("click", () => showRecommendation(weather));
      card.querySelector("button").addEventListener("click", () => showRecommendation(weather));
      dashboard.appendChild(card);
    } catch (err) {
      console.error("Weather fetch failed:", err);
    }
  }
}
