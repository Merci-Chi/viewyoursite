const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, 'sites-data.json');

// Path to our data file
const DATA_FILE = path.join(__dirname, 'sites-data.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  const initialData = {
    sites: [
      { name: 'Del Carmen Hair Salon', path: 'DelCarmeHairSalon' },
      { name: 'Shop Vezzy', path: 'SHOPVEZZY' },
      { name: 'Studio 47 Hair Salon', path: 'Studio47HairSalon' },
      { name: 'Favorite Place to Shop', path: 'favoriteplacetoshop' },
      { name: 'Green House Water Heaters', path: 'GreenHouseWaterHeaters' }
    ],
    htmlContent: {}
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// Read data from file
function readData() {
  const raw = fs.readFileSync(DATA_FILE);
  return JSON.parse(raw);
}

// Write data to file
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API endpoints

// Get all sites
app.get('/api/sites', (req, res) => {
  const data = readData();
  res.json(data.sites);
});

// Get HTML content for a specific site
app.get('/api/html/:path', (req, res) => {
  const data = readData();
  const html = data.htmlContent[req.params.path] || '';
  res.json({ html });
});

// Create a new site
app.post('/api/sites', (req, res) => {
  const { name, html } = req.body;
  
  if (!name || !html) {
    return res.status(400).json({ error: 'Name and HTML are required' });
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'site';

  const data = readData();

  // Check if site already exists
  if (data.sites.some(s => s.path === slug)) {
    return res.status(409).json({ error: 'Site with this name already exists' });
  }

  // Add site to list
  data.sites.push({ name, path: slug });
  
  // Save HTML content
  data.htmlContent[slug] = html;

  writeData(data);

  res.status(201).json({ 
    message: 'Site created successfully', 
    site: { name, path: slug } 
  });
});

// Update HTML content for a site
app.put('/api/html/:path', (req, res) => {
  const { html } = req.body;
  const sitePath = req.params.path;
  
  const data = readData();
  
  if (!data.sites.some(s => s.path === sitePath)) {
    return res.status(404).json({ error: 'Site not found' });
  }

  data.htmlContent[sitePath] = html;
  writeData(data);

  res.json({ message: 'HTML updated successfully' });
});

// Delete a site
app.delete('/api/sites/:path', (req, res) => {
  const sitePath = req.params.path;
  const data = readData();

  const siteIndex = data.sites.findIndex(s => s.path === sitePath);
  if (siteIndex === -1) {
    return res.status(404).json({ error: 'Site not found' });
  }

  data.sites.splice(siteIndex, 1);
  delete data.htmlContent[sitePath];
  writeData(data);

  res.json({ message: 'Site deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
