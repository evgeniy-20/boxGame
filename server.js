require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

const DATA_FILE = path.join(__dirname, "data.json");

/* ===== TELEGRAM ===== */

const bot = new TelegramBot(process.env.TG_TOKEN);
const CHAT_ID = process.env.CHAT_ID;

async function sendToTelegram(text) {
  try {
    await bot.sendMessage(CHAT_ID, text);
  } catch (err) {
    console.log("Telegram error:", err.message);
  }
}

/* ===== TELEGRAM TEXTS ===== */

const tgTranslations = {
  ua: {
    opened: "🎁 Відкрита коробка!",
    level: "⭐ Рівень",
    prizes: "🏆 Призи",
    date: "📅 Дата"
  },
  en: {
    opened: "🎁 Box opened!",
    level: "⭐ Level",
    prizes: "🏆 Prizes",
    date: "📅 Date"
  },
  ru: {
    opened: "🎁 Коробка открыта!",
    level: "⭐ Уровень",
    prizes: "🏆 Призы",
    date: "📅 Дата"
  }
};

/* ===== PRIZES ===== */

const prizesByLevel = {
  50: [
    {
      img: "level to 50/яблучне варення.webp", title: { ua: "10 яблучного варення", en: "10 apple jam", ru: "10 яблочного варенья" }
    },
    {
      img: "level to 50/шоколадне морозиво.webp", title: { ua: "10 шоколадного морозива", en: "10 chocolate ice cream", ru: "10 шоколадного мороженого" }
    },
    {
      img: "level to 50/цвяхи.webp", title: { ua: "10 цвяхів", en: "10 nails", ru: "10 гвоздей" }
    },
    {
      img: "level to 50/тканина.webp", title: { ua: "10 тканини", en: "10 fabric", ru: "10 тканины" }
    },
    {
      img: "level to 50/сокира.webp", title: { ua: "10 сокир", en: "10 axes", ru: "10 топоров" }
    },
    {
      img: "level to 50/сметана.webp", title: { ua: "10 сметани", en: "10 cream", ru: "10 сметаны" }
    },
    {
      img: "level to 50/сир.webp", title: { ua: "10 сиру", en: "10 cheese", ru: "10 сыра" }
    },
    {
      img: "level to 50/сир фета.webp", title: { ua: "10 сиру фета", en: "10 feta cheese", ru: "10 фета сыра" }
    },
    {
      img: "level to 50/раки.webp", title: { ua: "10 раків", en: "10 crabs", ru: "10 раков" }
    },
    {
      img: "level to 50/пила.webp", title: { ua: "10 пил", en: "10 saws", ru: "10 пилов" }
    },
    {
      img: "level to 50/печево.webp", title: { ua: "10 печева", en: "10 cakes", ru: "10 печенья" }
    },
    {
      img: "level to 50/панелі.webp", title: { ua: "10 панелей", en: "10 panels", ru: "10 панелей" }
    },
    {
      img: "level to 50/ожинове варення.webp", title: { ua: "10 ожинового варення", en: "10 quince jam", ru: "10 ежевичного варенья" }
    },
    {
      img: "level to 50/молоко.webp", title: { ua: "30 молока", en: "30 milk", ru: "30 молока" }
    },
    {
      img: "level to 50/мед.webp", title: { ua: "30 меду", en: "30 honey", ru: "30 меда" }
    },
    {
      img: "level to 50/масло.webp", title: { ua: "30 масла", en: "30 butter", ru: "30 масла" }
    },
    {
      img: "level to 50/лопата.webp", title: { ua: "20 лопат", en: "20 shovels", ru: "20 лопат" }
    },
    {
      img: "level to 50/коричневий цукор.webp", title: { ua: "30 коричневого цукру", en: "30 brown sugar", ru: "30 коричневого сахара" }
    },
    {
      img: "level to 50/клейкова стрічка.webp", title: { ua: "10 клейкової стрічки", en: "10 packing tape", ru: "10 лент" }
    },
    {
      img: "level to 50/качине перо.webp", title: { ua: "10 пір\`я", en: "10 duck feathers", ru: "10 перьев" }
    },
    {
      img: "level to 50/Віск.webp", title: { ua: "10 віску", en: "10 wax", ru: "10 воска" }
    },
    {
      img: "level to 50/білий цукор.webp", title: { ua: "10 білого цукру", en: "10 white sugar", ru: "10 белого сахара" }
    },
    {
      img: "level to 50/Screw.webp", title: { ua: "10 шурупів", en: "10 screws", ru: "10 шурупов" }
    },
    {
      img: "level to 50/Plank.webp", title: { ua: "10 дощок", en: "10 planks", ru: "10 досок" }
    },
    {
      img: "level to 50/Bacon.webp", title: { ua: "10 бекону", en: "10 bacon", ru: "10 бекона" }
    },
  ],
  100: [
    {
      img: "level to 100/Screw.webp", title: { ua: "10 шурупів", en: "10 screws", ru: "10 шурупов" }
    },
    {
      img: "level to 100/Plank.webp", title: { ua: "10 дошок", en: "10 planks", ru: "10 досок" }
    },
    {
      img: "level to 100/бобовий соус.webp", title: { ua: "10 бобового соусу", en: "10 bean sauce", ru: "10 бобового соуса" }
    },
    {
      img: "level to 100/арахісові горішки з медом.webp", title: { ua: "10 арахісових горішків з медом", en: "10 peanuts with honey", ru: "10 арахисовых орехов с медом" }
    },
    {
      img: "level to 100/шоколадне морозиво.webp", title: { ua: "10 шоколадного морозива", en: "10 chocolate ice cream", ru: "10 шоколадного мороженого" }
    },
    {
      img: "level to 100/шоколад.webp", title: { ua: "10 шоколаду", en: "10 chocolate", ru: "10 шоколада" }
    },
    {
      img: "level to 100/лимонний крем.webp", title: { ua: "10 лимонного крему", en: "10 lemon cream", ru: "10 лимонного крема" }
    },
    {
      img: "level to 100/клейкова стрічка.webp", title: { ua: "10 клейкової стрічки", en: "10 packing tape", ru: "10 лент" }
    },
    {
      img: "level to 100/майонез.webp", title: { ua: "10 майонезу", en: "10 mayonnaise", ru: "10 майонеза" }
    },
    {
      img: "level to 100/Оливкове масло.webp", title: { ua: "10 оливкового масла", en: "10 olive oil", ru: "10 оливкового масла" }
    },
    {
      img: "level to 100/свіжа паста.webp", title: { ua: "10 свіжої пасті", en: "10 fresh paste", ru: "10 свежей пасты" }
    },
    {
      img: "level to 100/раки.webp", title: { ua: "10 раків", en: "10 crabs", ru: "10 раков" }
    },
  ],
  126: [
    {
      img: "level to 126/Plank.webp", title: { ua: "10 дошок", en: "10 planks", ru: "10 досок" }
    },
    {
      img: "level to 126/Screw.webp",
      title: { ua: "10 шурупів", en: "10 screws", ru: "10 шурупов" }
    },
    {
      img: "level to 126/клейкова стрічка.webp",
      title: { ua: "10 клейкової стрічки", en: "10 packing tape", ru: "10 лент" }
    },
    {
      img: "level to 126/фруктофий милкшейк.webp",
      title: { ua: "10 фруктового милкшейку", en: "10 fruit milkshake", ru: "10 фруктового молочного коктейля" }
    },
    {
      img: "level to 126/лопата.webp",
      title: { ua: "20 лопат", en: "20 shovels", ru: "20 лопат" }
    },
    {
      img: "level to 126/арахісовий ірис.webp",
      title: { ua: "10 арахісового ірису", en: "10 peanut butter", ru: "10 арахисового ириса" }
    },
    {
      img: "level to 126/вафлі з ягодами.webp",
      title: { ua: "10 вафель з ягодами", en: "10 waffles with berries", ru: "10 вафель с ягодами" }
    },
    {
      img: "level to 126/звичайний кекс.webp",
      title: { ua: "10 звичайного кексу", en: "10 regular cake", ru: "10 обычного кекса" }
    },
  ]
};

/* ===== UTILS ===== */

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
  return arr.sort(() => Math.random() - 0.5);
}

/* ===== INIT ===== */

function initBoxes(level) {
  const data = loadData();
  const prizes = prizesByLevel[level];
  if (!prizes) return;

  const shuffled = shuffleArray([...prizes, ...prizes, ...prizes, ...prizes]);

  data.boxes = [];

  for (let i = 0; i < 8; i++) {
    data.boxes.push({
      opened: false,
      prizes: shuffled.splice(0, 5)
    });
  }

  saveData(data);
}

/* ===== API ===== */

app.post("/api/init", (req, res) => {
  const { level } = req.body;

  saveData({ boxes: [], results: [] });
  initBoxes(level);

  res.send("Boxes initialized");
});

app.get("/api/boxes", (req, res) => {
  res.json(loadData().boxes);
});

app.get("/api/results", (req, res) => {
  res.json(loadData().results);
});

app.post("/api/open", async (req, res) => {
  const { username, index, level, lang } = req.body;

  const data = loadData();
  const box = data.boxes[index];

  if (!box) return res.status(400).send("Box not found");
  if (box.opened) return res.status(400).send("Already opened");

  box.opened = true;

  const result = {
    name: username,
    level,
    prizes: box.prizes, // ⬅️ ЗБЕРІГАЄМО ВСІ МОВИ
    date: new Date().toISOString()
  };

  data.results.push(result);
  saveData(data);

  /* ===== TELEGRAM ===== */
  const t = tgTranslations[lang] || tgTranslations.ua;

  const prizeList = box.prizes
    .map(p => p.title[lang] || p.title.ua)
    .join(", ");

  sendToTelegram(
`${t.opened}
👤 ${username}
${t.level}: ${level}
${t.prizes}: ${prizeList}
${t.date}: ${new Date(result.date).toLocaleString(lang)}`
  );

  /* ===== RESPONSE TO FRONT ===== */
  res.json(
    box.prizes.map(p => ({
      img: p.img,
      title: p.title[lang] || p.title.ua
    }))
  );
});

app.post("/api/reset", (req, res) => {
  saveData({ boxes: [], results: [] });
  res.send("Reset done");
});

app.listen(PORT, () => {
  console.log(`SERVER STARTED → http://localhost:${PORT}`);
});
