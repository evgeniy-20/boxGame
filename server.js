const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = "dev123";

// ===== TELEGRAM =====
const TG_TOKEN = "8313933859:AAHcTq4kbxCqXGLi-DWDilyFUzhKzkGGA-c";
const CHAT_ID = "561860670";

const bot = new TelegramBot(TG_TOKEN, { polling: false });


// ===== FILE =====
const DATA_FILE = path.join(__dirname, 'data.json');

// ===== PRIZES =====
const prizes = [
  { img: "images/Bacon.webp", title: "50 бекону" },
  { img: "images/Plank.webp", title: "20 дошок" },
  { img: "images/білий цукор.webp", title: "50 білого цукру" },
  { img: "images/лимонний крем.webp", title: "20 лимонного крему" },
  { img: "images/мед.webp", title: "20 меду" },
  { img: "images/масло.webp", title: "20 масла" },
  { img: "images/пила.webp", title: "50 пил передати " },
  { img: "images/свіжа паста.webp", title: "50 свіжої пасти" },
  { img: "images/клейкова стрічка.webp", title: "20 клейкової стрічки передати Богдані" },
  { img: "images/пила.webp", title: "50 пил передати Богдані" },
  { img: "images/свіжа паста.webp", title: "50 свіжої пасти передати Богдані" },
  { img: "images/клейкова стрічка.webp", title: "20 клейкової стрічки" },
];

// ===== MIDDLEWARE =====
app.use(bodyParser.json());
app.use(express.static('public'));

// ===== UTILS =====
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { boxes: [], results: [] };
  }
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

// ===== INIT BOXES =====
function initBoxes() {
  const data = loadData();

  if (!data.boxes || data.boxes.length === 0) {
    data.boxes = shuffleArray([...prizes]).slice(0, 8);
    saveData(data);
  }
}

initBoxes();

// ===== API =====

// GET BOXES
app.get('/api/boxes', (req, res) => {
  const data = loadData();
  res.json(data.boxes);
});

// GET RESULTS
app.get('/api/results', (req, res) => {
  const data = loadData();
  res.json(data.results);
});

// OPEN BOX
app.post('/api/open', (req, res) => {

  const { username, index } = req.body;

  if (!username || index === undefined) {
    return res.status(400).send('Invalid request');
  }

  const data = loadData();
  const prize = data.boxes[index];

  if (!prize) {
    return res.status(400).send('Коробка не існує');
  }

  const result = {
    name: username,
    prize: prize.title,
    img: prize.img,
    date: new Date().toLocaleString("uk-UA")
  };

  data.results.push(result);
  saveData(data);

  // ===== TELEGRAM MESSAGE =====
  bot.sendMessage(CHAT_ID,
`🎁 ВІДКРИТА КОРОБКА

👤 Імʼя: ${username}
🏆 Приз: ${prize.title}
📦 Коробка: №${Number(index) + 1}
🕒 ${result.date}`
  ).catch(err => console.log("TG ERROR:", err.message));

  res.json(prize);
});

// RESET
app.post('/api/reset', (req, res) => {

  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(403).send('Wrong password');
  }

  const data = {
    boxes: shuffleArray([...prizes]).slice(0, 8),
    results: []
  };

  saveData(data);

  bot.sendMessage(CHAT_ID, "♻ Адмін скинув гру та перемішав коробки");

  res.send('Reset done!');
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`SERVER STARTED → http://localhost:${PORT}`);
});
