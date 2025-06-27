// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'suggestions.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Utility: Read suggestions from file
function readSuggestions() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Utility: Write suggestions to file
function writeSuggestions(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET all suggestions
app.get('/suggestions', (req, res) => {
  const suggestions = readSuggestions();
  res.json(suggestions);
});

// POST new suggestion
app.post('/suggestions', (req, res) => {
  const suggestions = readSuggestions();
  const newSuggestion = { id: Date.now(), ...req.body };
  suggestions.push(newSuggestion);
  writeSuggestions(suggestions);
  res.status(201).json(newSuggestion);
});

// PATCH a suggestion
app.patch('/suggestions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let suggestions = readSuggestions();
  const index = suggestions.findIndex(s => s.id === id);

  if (index === -1) return res.status(404).json({ message: 'Not found' });

  suggestions[index] = { ...suggestions[index], ...req.body };
  writeSuggestions(suggestions);
  res.json(suggestions[index]);
});

// DELETE a suggestion
app.delete('/suggestions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let suggestions = readSuggestions();
  const filtered = suggestions.filter(s => s.id !== id);

  if (suggestions.length === filtered.length) {
    return res.status(404).json({ message: 'Not found' });
  }

  writeSuggestions(filtered);
  res.json({ message: 'Deleted successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
