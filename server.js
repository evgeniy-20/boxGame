const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const ADMIN_PASSWORD = "dev123";

const DATA_FILE = path.join(__dirname, 'data.json');

// --- PRIZES --- //
const prizes = [
  { img: "images/Bacon.webp", title: "50 бекону" },
  { img: "images/Plank.webp", title: "20 дошок" },
  { img: "images/білий цукор.webp", title: "50 лопат" },
  { img: "images/лимонний крем.webp", title: "20 лимонного крему" },
  { img: "images/мед.webp", title: "20 меду" },
  { img: "images/масло.webp", title: "20 масла" },
  { img: "images/пила.webp", title: "50 пил" },
  { img: "images/свіжа лопша.webp", title: "50 свіжої лопші" }
];

// --- MIDDLEWARE --- //
app.use(bodyParser.json());
app.use(express.static('public'));

// --- UTILS --- //
function loadData() {
  if (!fs.existsSync(DATA_FILE)) return { boxes: [], results: [] };
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- INIT BOXES --- //
function initBoxes() {
  const data = loadData();
  if (!data.boxes || data.boxes.length === 0) {
    data.boxes = shuffleArray([...prizes]).slice(0, 8);
    saveData(data);
  }
}
initBoxes();

// --- API ROUTES --- //
app.get('/api/boxes', (req, res) => {
  const data = loadData();
  res.json(data.boxes);
});

app.get('/api/results', (req, res) => {
  const data = loadData();
  res.json(data.results);
});

app.post('/api/open', (req, res) => {
  const { username, index } = req.body;
  if (!username || index === undefined) return res.status(400).send('Invalid request');

  const data = loadData();
  const prize = data.boxes[index];
  if (!prize) return res.status(400).send('Коробка не існує');

  const result = {
    name: username,
    prize: prize.title,
    img: prize.img,
    date: new Date().toLocaleString("uk-UA")
  };

  data.results.push(result);
  saveData(data);

  res.json(prize);
});

app.post('/api/reset', (req, res) => {
  const { password } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(403).send('Wrong password');

  const data = { boxes: shuffleArray([...prizes]).slice(0, 8), results: [] };
  saveData(data);
  res.send('Reset done, boxes shuffled!');
});

// --- START SERVER --- //
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
