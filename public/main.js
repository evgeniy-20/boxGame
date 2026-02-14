const boxesEl = document.getElementById("grid");
const usernameEl = document.getElementById("name");
const levelEl = document.getElementById("level");
const resultsBody = document.getElementById("history");
const resetBtn = document.getElementById("resetBtn");

let played = localStorage.getItem("played");

/* ===== INIT ===== */

init();

async function init() {
  await loadBoxes();
  await syncResults();
}

/* ===== LANGUAGE SYSTEM ===== */

const translations = {
  ua: {
    choose_box: "🎁 Обери коробку",
    your_name: "Твоє ім'я",
    level_50: "До 50 рівня",
    level_100: "До 100 рівня",
    level_126: "До 126 рівня",
    results: "Результати",
    name: "Імʼя",
    level: "Рівень",
    prizes: "Призи",
    date: "Дата",
    reset: "🗑 Скинути"
  },
  en: {
    choose_box: "🎁 Choose a box",
    your_name: "Your name",
    level_50: "Up to level 50",
    level_100: "Up to level 100",
    level_126: "Up to level 126",
    results: "Results",
    name: "Name",
    level: "Level",
    prizes: "Prizes",
    date: "Date",
    reset: "🗑 Reset"
  },
  ru: {
    choose_box: "🎁 Выбери коробку",
    your_name: "Твоё имя",
    level_50: "До 50 уровня",
    level_100: "До 100 уровня",
    level_126: "До 126 уровня",
    results: "Результаты",
    name: "Имя",
    level: "Уровень",
    prizes: "Призы",
    date: "Дата",
    reset: "🗑 Сброс"
  }
};

function setLanguage(lang) {
  localStorage.setItem("lang", lang);

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    el.innerText = translations[lang][key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    el.placeholder = translations[lang][key];
  });
}

const savedLang = localStorage.getItem("lang") || "ua";
setLanguage(savedLang);

document.querySelectorAll(".lang-switch button").forEach(btn => {
  btn.addEventListener("click", async () => {
    setLanguage(btn.dataset.lang);
    await syncResults();
  });
});


/* ===== LEVEL CHANGE ===== */

levelEl.addEventListener("change", async () => {
  const level = levelEl.value;

  await fetch("/api/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level })
  });

  localStorage.removeItem("played");
  played = null;

  await loadBoxes();
  await syncResults();
});

/* ===== BOXES ===== */

async function loadBoxes() {
  const res = await fetch("/api/boxes");
  const data = await res.json();
  renderBoxes(data);
}

function renderBoxes(boxData) {
  boxesEl.innerHTML = "";
  boxData.forEach((boxData, index) => {
    const box = document.createElement("div");
    box.className = "box";
    box.dataset.index = index;
    box.innerHTML = boxData.opened ? "❌" : "🎁";
    boxesEl.appendChild(box);
  });
}

boxesEl.addEventListener("click", async e => {
  if (played) return alert("You already opened a box");

  const box = e.target.closest(".box");
  if (!box) return;

  const username = usernameEl.value.trim();
  const level = levelEl.value;
  const lang = localStorage.getItem("lang") || "ua";

  if (username.length < 3) return alert("Minimum 3 characters");

  const res = await fetch("/api/open", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      index: box.dataset.index,
      level,
      lang
    })
  });

  if (!res.ok) return alert(await res.text());

  const prizes = await res.json();

  played = true;
  localStorage.setItem("played", "true");

  box.classList.add("opened");
  box.innerHTML = prizes.map(p => `
    <div class="prize-item">
      <img src="${p.img}" class="prize-img">
      <div>${p.title}</div>
    </div>
  `).join("");

  await syncResults();
});

/* ===== RESULTS ===== */

async function syncResults() {
  const res = await fetch("/api/results");
  const data = await res.json();

  const lang = localStorage.getItem("lang") || "ua";

  resultsBody.innerHTML = "";

  data.forEach(r => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${r.name}</td>
      <td>${r.level}</td>
      <td>${r.prizes.map(p => p.title[lang] || p.title.ua).join(", ")}</td>
      <td>${new Date(r.date).toLocaleString(lang)}</td>
    `;

    resultsBody.appendChild(tr);
  });
}

/* ===== ADMIN ===== */

document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key.toLowerCase() === "a") {
    resetBtn.style.display = "block";
  }
});

resetBtn.onclick = async () => {
  if (!confirm("Reset game?")) return;

  const res = await fetch("/api/reset", { method: "POST" });

  alert(await res.text());
  localStorage.removeItem("played");
  location.reload();
};
