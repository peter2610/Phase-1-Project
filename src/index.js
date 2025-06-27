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

// Admin view
function renderAdmin() {
  const container = document.getElementById("admin-content");
  container.innerHTML = "";
  suggestions.forEach(s => {
    const item = document.createElement("div");
    item.className = "admin-item";
    item.innerHTML = `
      <p>
        ${s.city} / ${s.weather} / ${s.activity}<br/>
        Outfit: <input value="${s.outfit}" data-id="${s.id}" class="outfit"><br/>
        Task: <input value="${s.idea}" data-id="${s.id}" class="idea"><br/>
        <button class="patch" type="button" data-id="${s.id}">Edit</button>
        <button class="del" type="button" data-id="${s.id}">Delete</button>
      </p>
    `;
    item.querySelector(".patch").addEventListener("click", patchSuggestion);
    item.querySelector(".del").addEventListener("click", deleteSuggestion);
    container.appendChild(item);
  });
}

// PATCH
async function patchSuggestion(e) {
  if (!isAdmin) return alert("Admin login required.");
  const id = e.target.dataset.id;
  const outfit = document.querySelector(`.outfit[data-id="${id}"]`).value;
  const idea = document.querySelector(`.idea[data-id="${id}"]`).value;

  await fetch(`http://localhost:3000/suggestions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ outfit, idea })
  });

  await loadSuggestions();
  renderAdmin();
}

// DELETE
async function deleteSuggestion(e) {
  if (!isAdmin) return alert("Admin login required.");
  const id = e.target.dataset.id;

  await fetch(`http://localhost:3000/suggestions/${id}`, {
    method: "DELETE"
  });

  await loadSuggestions();
  renderAdmin();
}

// Show all suggestions
function showAllSuggestions() {
  recPanel.innerHTML = "<h2>All Suggestions</h2>";
  suggestions.forEach(s => {
    const div = document.createElement("div");
    div.className = "suggestion";
    div.innerHTML = `
      <h4>${s.city} - ${s.weather}</h4>
      <p><strong>Activity:</strong> ${s.activity}</p>
      <p><strong>Outfit:</strong> ${s.outfit}</p>
      <p><strong>Task:</strong> ${s.idea}</p>
    `;
    recPanel.appendChild(div);
  });
}

// Handle login
loginBtn.addEventListener("click", () => {
  loginForm.classList.toggle("hidden");
});

document.getElementById("login-form").addEventListener("submit", e => {
  e.preventDefault();
  const user = document.getElementById("admin-username").value;
  const pass = document.getElementById("admin-password").value;

  if (user === "admin" && pass === "1234") {
    isAdmin = true;
    adminPanel.classList.remove("hidden");
    loginForm.classList.add("hidden");

    logoutBtn.id = "logout-btn";
    logoutBtn.textContent = "Log Out";
    adminPanel.appendChild(logoutBtn);

    logoutBtn.addEventListener("click", () => {
      isAdmin = false;
      adminPanel.classList.add("hidden");
      logoutBtn.remove();
    });
  } else {
    alert("Wrong credentials.");
  }
});

// Search
function handleSearch(e) {
  e.preventDefault();
  const activity = document.getElementById("activity").value.trim().toLowerCase();
  if (!activity) return alert("Please enter an activity.");
  const match = suggestions.find(s => s.activity.toLowerCase() === activity);
  if (!match) return alert("No match found.");
  showRecommendation(match);
}

// Init
document.addEventListener("DOMContentLoaded", async () => {
  await loadSuggestions();
  await displayWeather();
  renderAdmin();
  searchBtn.addEventListener("click", handleSearch);
});

