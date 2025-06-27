// index.js
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
let currentSuggestion = null;

// Load all suggestions
async function loadSuggestions() {
  try {
    const res = await fetch("http://localhost:3000/suggestions");
    suggestions = await res.json();
  } catch (err) {
    console.error("Failed to load suggestions:", err);
  }
}

// Get weather data
async function getCityWeather(city) {
  const coords = {
    Nairobi: { lat: -1.2864, lon: 36.8172 },
    Mombasa: { lat: -4.0435, lon: 39.6682 },
    Kisumu: { lat: -0.0917, lon: 34.7680 },
    Naivasha: { lat: -0.7177, lon: 36.4325 },
    Eldoret: { lat: 0.5143, lon: 35.2698 },
    Nanyuki: { lat: 0.0167, lon: 37.0667 },
    Malindi: { lat: -3.2192, lon: 40.1169 },
    Thika: { lat: -1.0333, lon: 37.0693 },
    Garissa: { lat: -0.4532, lon: 39.6460 },
    Kericho: { lat: -0.3675, lon: 35.2836 }
  };

  const { lat, lon } = coords[city];
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
  const data = await res.json();
  const current = data.current_weather;

  const weatherCodeMap = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    61: "Light rain",
    71: "Light snow",
    80: "Rain showers"
    // You can add more codes if needed
  };

  return {
    city,
    temp: current.temperature,
    condition: weatherCodeMap[current.weathercode] || `Code ${current.weathercode}`,
    icon: "https://img.icons8.com/fluency/48/000000/weather.png"
  };
}


// Display all cities
async function displayWeather() {
  dashboard.innerHTML = "";
  for (const city of cities) {
    try {
      const weather = await getCityWeather(city);
      const card = document.createElement("div");
      card.className = "weather-card";
      card.innerHTML = `
        <h3>${weather.city}</h3>
        <img src="${weather.icon}" alt="${weather.condition}" 
             class="weather-icon"
             data-city="${weather.city}"
             data-temp="${weather.temp}"
             data-condition="${weather.condition}" />
        <p>${weather.temp}°C - ${weather.condition}</p>
        <button data-city="${weather.city}" data-weather="${weather.condition}">
          See Suggestions
        </button>
      `;
      card.querySelector("img").addEventListener("click", () => showRecommendation(weather));
      card.querySelector("button").addEventListener("click", () => showRecommendation(weather));
      dashboard.appendChild(card);
    } catch (error) {
      console.warn(`Could not fetch weather for ${city}`, error);
    }
  }
}

// Show single recommendation
function showRecommendation(weather) {
  const { city, temp, condition } = weather;
  const match = suggestions.find(s =>
    s.city === city &&
    s.weather.toLowerCase() === condition.toLowerCase()
  );

  recPanel.innerHTML = `
    <div class="recommendation-card" id="recommendation-card">
      <h2>${city} - ${temp}°C ${condition}</h2>
      <p><strong>Activity:</strong> ${match?.activity || "N/A"}</p>
      <p><strong>Outfit:</strong> ${match?.outfit || "N/A"}</p>
      <p><strong>Task:</strong> ${match?.idea || "N/A"}</p>
      <button id="suggest-btn">Add Suggestion</button>
    </div>
  `;

  document.getElementById("suggest-btn").addEventListener("click", () =>
    showAddForm(city, condition, match?.activity || "", temp)
  );

  document.getElementById("recommendation-card").scrollIntoView({ behavior: "smooth" });
}

// Add suggestion form
function showAddForm(city, weather, activity = "", temp = "--") {
  const form = document.createElement("form");
  form.innerHTML = `
  <label for="activity">Activity:</label>
  <input id="activity" name="activity" value="${activity}" required><br/>

  <label for="outfit">Outfit:</label>
  <input id="outfit" name="outfit" required><br/>

  <label for="idea">Task:</label>
  <input id="idea" name="idea" required><br/>

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
    showRecommendation({ city, temp, condition: weather });
  });
}

// Admin area
function renderAdmin() {
  const container = document.getElementById("admin-content");
  container.innerHTML = "";

  if (!document.getElementById("edit-form")) {
    const editFormDiv = document.createElement("div");
    editFormDiv.id = "edit-form";
    editFormDiv.classList.add("hidden");
    editFormDiv.innerHTML = `
      <h3>Edit Suggestion</h3>
      <form id="edit-suggestion-form">
        <label for="edit-activity">Activity:</label>
        <input id="edit-activity" name="activity" required /><br/>

        <label for="edit-outfit">Outfit:</label>
        <input id="edit-outfit" name="outfit" required /><br/>

        <label for="edit-task">Task:</label>
        <input id="edit-task" name="idea" required /><br/>
    <button id="save-edit" type="button">Save Changes</button> 
    <button type="button" id="cancel-edit">Cancel</button>
      </form>
    `;
    container.appendChild(editFormDiv);
  }

  suggestions.forEach(s => {
    const item = document.createElement("div");
    item.className = "admin-item";
    item.innerHTML = `
    <div class="admin-item-box">
      <strong>${s.city}</strong> / ${s.weather}<br/>
      Activity: ${s.activity}<br/>
      Outfit: ${s.outfit}<br/>
      Task: ${s.idea}<br/>
      <button class="patch" type="button" data-id="${s.id}">Edit</button>
      <button class="del" type="button" data-id="${s.id}">Delete</button>
    </div>
  `;
    item.querySelector(".patch").addEventListener("click", () => {
      currentSuggestion = s;
      document.getElementById("edit-activity").value = s.activity;
      document.getElementById("edit-outfit").value = s.outfit;
      document.getElementById("edit-task").value = s.idea;
      document.getElementById("edit-form").classList.remove("hidden");
    });
    item.querySelector(".del").addEventListener("click", deleteSuggestion);
    container.appendChild(item);
  });
}

// PATCH Handler

document.addEventListener("click", async (e) => {
  if (e.target && e.target.id === "save-edit") {
    if (!currentSuggestion) return;

    const updatedData = {
      activity: document.getElementById("edit-activity").value.trim(),
      outfit: document.getElementById("edit-outfit").value.trim(),
      idea: document.getElementById("edit-task").value.trim()
    };

    await fetch(`http://localhost:3000/suggestions/${currentSuggestion.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedData)
    });

    alert("Suggestion updated successfully.");
    currentSuggestion = null;
    document.getElementById("edit-form").classList.add("hidden");
    await loadSuggestions();
    renderAdmin();
  }
});


// Cancel Button

document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "cancel-edit") {
    currentSuggestion = null;
    document.getElementById("edit-form").classList.add("hidden");
  }
});

// DELETE
async function deleteSuggestion(e) {
  if (!isAdmin) return alert("Admin login required.");
  const id = e.target.dataset.id;

  if (confirm("Are you sure you want to delete this suggestion?")) {
    await fetch(`http://localhost:3000/suggestions/${id}`, {
      method: "DELETE"
    });
    alert("Suggestion deleted.");
    await loadSuggestions();
    renderAdmin();
  }
}

// Login
loginBtn.addEventListener("click", () => {
  loginForm.classList.toggle("hidden");
});

document.getElementById("login-form").addEventListener("submit", e => {
  e.preventDefault();
  const user = document.getElementById("admin-username").value;
  const pass = document.getElementById("admin-password").value;

  if (user === "admin" && pass === "1234") {
    isAdmin = true;
    localStorage.setItem("isAdmin", "true");
    adminPanel.classList.remove("hidden");
    loginForm.classList.add("hidden");

    if (!document.getElementById("logout-btn")) {
      logoutBtn.id = "logout-btn";
      logoutBtn.textContent = "Log Out";
      adminPanel.appendChild(logoutBtn);
      logoutBtn.addEventListener("click", () => {
        isAdmin = false;
        localStorage.removeItem("isAdmin");
        adminPanel.classList.add("hidden");
        logoutBtn.remove();
      });
    }
  } else {
    alert("Wrong credentials.");
  }
});

// Search by activity
async function handleSearch(e) {
  e.preventDefault();
  const activity = document.getElementById("activity").value.trim().toLowerCase();
  if (!activity) return alert("Please enter an activity.");

  const matches = suggestions.filter(s => s.activity.toLowerCase() === activity);

  if (matches.length === 0) {
    return alert("No cities found with that activity.");
  }

  recPanel.innerHTML = `<h2>Activity: ${activity}</h2>`;

  for (const match of matches) {
    const weather = await getCityWeather(match.city);
    const card = document.createElement("div");
    card.className = "recommendation-card";
    card.innerHTML = `
      <h3>${weather.city} - ${weather.temp}°C ${weather.condition}</h3>
      <p><strong>Activity:</strong> ${match.activity}</p>
      <p><strong>Outfit:</strong> ${match.outfit}</p>
      <p><strong>Task:</strong> ${match.idea}</p>
      <button data-city="${match.city}" data-weather="${match.weather}">Suggest Another</button>
    `;

    card.querySelector("button").addEventListener("click", () =>
      showAddForm(match.city, match.weather, match.activity, weather.temp)
    );

    recPanel.appendChild(card);
  }

  recPanel.scrollIntoView({ behavior: "smooth" });
}

// Init
document.addEventListener("DOMContentLoaded", async () => {
  if (localStorage.getItem("isAdmin") === "true") {
    isAdmin = true;
    adminPanel.classList.remove("hidden");
    if (!document.getElementById("logout-btn")) {
      logoutBtn.id = "logout-btn";
      logoutBtn.textContent = "Log Out";
      adminPanel.appendChild(logoutBtn);
      logoutBtn.type = "button";
      logoutBtn.addEventListener("click", () => {
        isAdmin = false;
        localStorage.removeItem("isAdmin");
        adminPanel.classList.add("hidden");
        logoutBtn.remove();
      });
    }
  }

  await loadSuggestions();
  await displayWeather();
  renderAdmin();
  searchBtn.addEventListener("click", handleSearch);
  // ✅ Global Safety Net
// 🔒 Prevent accidental form submits from reloading page
document.addEventListener("submit", function (e) {
  e.preventDefault();
});

// 🔒 Prevent all anchor tags like <a href="#"> from causing reload
document.addEventListener("click", function (e) {
  if (e.target.tagName === "A" && e.target.getAttribute("href") === "#") {
    e.preventDefault();
  }
});

// 🔒 Prevent <button> without type from defaulting to 'submit'
document.addEventListener("click", function (e) {
  if (e.target.tagName === "BUTTON" && !e.target.hasAttribute("type")) {
    e.target.setAttribute("type", "button");
  }
});

});
