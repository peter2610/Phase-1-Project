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

// Show single recommendation
function showRecommendation(weather) {
  const { city, temp, condition } = weather;
  const match = suggestions.find(s => s.city === city && s.weather === condition);

  recPanel.innerHTML = `
    <div class="recommendation-card" id="recommendation-card">
      <h2>${city} - ${temp}°C ${condition}</h2>
      <p><strong>Activity:</strong> ${match?.activity || "N/A"}</p>
      <p><strong>Outfit:</strong> ${match?.outfit || "N/A"}</p>
      <p><strong>Task:</strong> ${match?.idea || "N/A"}</p>
      <button id="suggest-btn">Add Suggestion</button>
      <button id="show-all-btn">Show All Suggestions</button>
    </div>
  `;

  document.getElementById("suggest-btn").addEventListener("click", () =>
    showAddForm(city, condition, match?.activity || "")
  );

  document.getElementById("show-all-btn").addEventListener("click", showAllSuggestions);

  document.getElementById("recommendation-card").scrollIntoView({ behavior: "smooth" });
}

// Add suggestion
function showAddForm(city, weather, activity = "") {
  const form = document.createElement("form");
  form.innerHTML = `
    <label>Activity: <input name="activity" value="${activity}" required></label><br/>
    <label>Outfit: <input name="outfit" required></label><br/>
    <label>Task: <input name="idea" required></label><br/>
    <button type="submit">Submit</button>
  `;
  recPanel.appendChild(form);

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const newSug = {
      city,
      weather,
      activity: e.target.activity.value.trim(),
      outfit: e.target.outfit.value.trim(),
      idea: e.target.idea.value.trim()
    };

    await fetch("http://localhost:3000/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSug)
    });

    await loadSuggestions();
    form.remove();
    showRecommendation({ city, temp: "--", condition: weather });
  });
}

