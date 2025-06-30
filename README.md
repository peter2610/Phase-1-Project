# Phase 1 Project

PapiFit Kenya – Smart Travel & Outfit Guide

Author: Peter Munyambu
Live Demo:  
License: MIT
Year: 2025

## login

admin log in
username: admin
password: 1234

## API

https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current_weather=true

## Backend API

https://phase-1-project-11-py9r.onrender.com/suggestions

## note: matching logic, weather and activity logic

If you see the message:

"No suggestion available for this weather yet."

Suggestions are weather-specific. For example, if you have a suggestion for "Nairobi" when it's "Clear sky", it won’t appear when the weather is "Overcast" — even though the city is the same.

✅ It simply means that there is no existing suggestion in the database for that exactly weather.
both, The selected city, and The current weather condition (e.g., "Overcast", "Clear sky", "Partly cloudy").

### MVP

This project is a weather-based recommendation app that allows users to view real-time weather for major Kenyan cities. Users can click on a city to see personalized suggestions including suitable activities, outfits, and tasks based on the weather. Users can also search by activity to discover which cities match that activity. The backend (JSON server) is hosted on Render, and the frontend is deployed via GitHub Pages. Admins can log in to add, edit, or delete suggestions, making the system dynamic and customizable. It’s a fully functional MVP focused on user experience, weather data, and smart recommendations.

### how it works

How It Works
PapiFit Kenya displays real-time weather for 10 major cities. Each city card shows temperature and weather conditions. Users can click “See Suggestions” to view suitable activities, outfits, and tasks for that city’s weather. You can also search by activity (like "hiking") to find cities where it’s ideal. Admins can log in to add, edit, or delete suggestions. All weather data comes from the Open-Meteo API, and recommendations are powered by a Render-hosted JSON server.

### user flow

1.Visit the Site
The user lands on the homepage and sees a live weather dashboard showing 10 Kenyan cities.
2.Explore Weather Conditions
Each city card displays temperature and weather conditions (e.g., clear sky, rain).

3.View Recommendations
Clicking “See Suggestions” shows recommended activity, outfit, and task for that city's weather.

4.Search by Activity
Users can enter an activity (e.g., hiking, relax) in the search bar to find cities where the weather supports it.

5. Admin Access (Optional)
   Admins can log in using predefined credentials to add, edit, or delete suggestions for any city and condition.

## Technologies

HTML
Css
Javascript
Openmeteo API
JSON server

## project structure

papifit-kenya/
├── index.html
├── style.css
├── script.js
├── server.js
├── suggestions.json
├── Assets
└── README.md

## Core Features

### Weather Dashboard

Displays live weather for 10 cities: Nairobi, Mombasa, Kisumu, Naivasha, Eldoret, Nanyuki, Malindi, Thika, Garissa, Kericho.

Shows city name, weather condition, temperature, and icon.

Weather data is fetched from the Open-Meteo API using fetch() and parsed as JSON.

### Click-to-View Suggestions

Each city card includes a "See Suggestions" button.

On click, a panel opens with:

Recommended activity
Recommended outfit
A relevant task idea
sample output:
![results on clicking a city](image-1.png)

### Activity Search by Keyword

- Users can enter any activity (e.g., "hiking") in the search bar.
  -The app filters cities with suitable weather and matching activity.
  -It then displays the most favorable city for the activity.
  on searching activity hiking
  sample output:
  ![hiking](image.png)

### User Add Suggestion

. Clicking a weather icon or suggestion area opens a form to add:

Activity
Outfit
Task

. Submitted via POST to the JSON server using fetch().
. Immediately reflected on the page using DOM manipulation.

### Admin Panel

.Accessed by clicking Admin Login.
.Displays all city/weather-based suggestions.

.For each item, admin can:

-Edit (opens fields; PATCH request saves changes)
-Delete (removes item from server and UI via DELETE)

.Admin clicks Logout to hide the admin panel.

## Functional Logic

🔄 Asynchronous API Calls

GET weather data from Open-Meteo API for each city

GET existing suggestions from suggestions.json

POST new user suggestions to JSON server

PATCH updated admin suggestions to server

DELETE removes selected suggestions (admin only)

## JavaScript Concepts Used

.map() → Create weather cards

.filter() → Match suggestions with weather/activity

.forEach() → Render all outfits, activities, tasks

addEventListener() → Enable click, submit, login, logout, edit

fetch() → All server and API interactions

JSON.stringify() & res.json() → Handle data formats

## Event-Driven Actions

Action

Event Type

Description

Click "See Suggestions"

click

Displays outfit, activity, task suggestions for the city

Submit Add Suggestion Form

submit

Adds user-generated suggestion via POST

Search for activity

submit

Filters city with best weather match for the activity

Admin Login/Logout Toggle

click

Shows or hides admin panel

Click Edit on a suggestion

click

Makes suggestion fields editable

Save Changes (Admin)

click

Sends PATCH request to update local data

Delete Suggestion (Admin)

click

Sends DELETE request and removes from UI

## User & Admin Roles

Role

User

✅ can view

✅ can add

❌ cant edit

❌ cant delete

Admin

✅ can view

✅ can add

✅ can edit

✅ can delete

## How to Run the App Locally

.Clone the Repository
-git clone
. Start JSON Server
npm install -g json-server
json-server --watch suggestions.json
.Launch Frontend
Open index.html in a browser.
Use Live Server for hot reloading (optional).

### Example Flow

You open the app and see all cities listed.
You search "swimming" → Mombasa shows up with warm weather.
You click "See Suggestions" → Outfit: Swimsuit, Task: Swim at Nyali Beach.
You want to suggest a new activity. You click on the weather icon.
Form appears. You submit: Activity: Yoga, Outfit: Leggings, Task: Yoga on beach.
You click Admin Login and delete a duplicate suggestion.

## License

This project is licensed under the MIT License.
© 2025 Peter Munyambu. All rights reserved.
Pull requests and contributions are welcome!
