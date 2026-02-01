const BOX_COUNT = 8;
const ADMIN_PASSWORD = "dev123";

/* ---------- ELEMENTS ---------- */
const boxesEl = document.getElementById('boxes');
const usernameEl = document.getElementById('username');
const resultsBody = document.getElementById('resultsBody');
const statsEl = document.getElementById('stats');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const resetBtn = document.getElementById('resetBtn');

/* ---------- STATE ---------- */
let played = localStorage.getItem("played");
let opening = false;

/* ---------- INIT ---------- */
init();

async function init() {
  await loadBoxes();
  await syncResults();
}

/* ---------- LOAD BOXES ---------- */
async function loadBoxes() {
  try {
    const res = await fetch('/api/boxes');
    const data = await res.json();

    if (!data || data.length === 0) {
      alert("Коробки ще не готові");
      return;
    }

    renderBoxes(data);

  } catch (err) {
    console.error(err);
    alert("Помилка завантаження коробок");
  }
}

/* ---------- RENDER BOXES ---------- */
function renderBoxes(boxData) {
  boxesEl.innerHTML = '';

  boxData.forEach((_, index) => {
    const box = document.createElement('div');
    box.className = 'box';
    box.dataset.index = index;
    box.innerHTML = '🎁';
    boxesEl.appendChild(box);
  });
}

/* ---------- CLICK ---------- */
boxesEl.addEventListener('click', async e => {

  if (played) {
    alert("Ти вже відкривав коробку!");
    return;
  }

  if (opening) return;

  const box = e.target.closest('.box');
  if (!box) return;

  const username = usernameEl.value.trim();

  if (username.length < 3) {
    alert("Мінімум 3 символи");
    return;
  }

  opening = true;
  const index = box.dataset.index;

  try {

    const res = await fetch('/api/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, index })
    });

    if (!res.ok) {
      opening = false;
      alert(await res.text());
      return;
    }

    const prize = await res.json();

    openBox(box, prize);
    await syncResults();

  } catch (err) {
    console.error(err);
    alert("Помилка при відкритті");
  }

  opening = false;
});

/* ---------- OPEN ---------- */
function openBox(box, prize) {

  played = true;
  localStorage.setItem("played", "true");

  box.classList.add('opened');

  box.innerHTML = `
    <img src="${prize.img}" class="prize-img">
    <span>${prize.title}</span>
  `;

  showModal(prize);
}

/* ---------- SYNC RESULTS ---------- */
async function syncResults() {

  try {

    const res = await fetch('/api/results');
    const data = await res.json();

    resultsBody.innerHTML = '';
    statsEl.innerHTML = '';

    const stats = {};

    data.forEach(r => {
      addRow(r);
      stats[r.prize] = (stats[r.prize] || 0) + 1;
    });

    Object.entries(stats).forEach(([name, count]) => {
      const li = document.createElement('li');
      li.textContent = `${name}: ${count}`;
      statsEl.appendChild(li);
    });

  } catch (err) {
    console.error(err);
  }
}

/* ---------- TABLE ---------- */
function addRow({ name, prize, img, date }) {

  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td>${name}</td>
    <td>
      <img src="${img}" class="table-img">
      ${prize}
    </td>
    <td>${date}</td>
  `;

  resultsBody.appendChild(tr);
}

/* ---------- MODAL ---------- */
function showModal(prize) {

  modalContent.innerHTML = `
    <h3>🎉 Вітаємо!</h3>
    <img src="${prize.img}" class="prize-img">
    <p>${prize.title}</p>
    <button onclick="closeModal()">OK</button>
  `;

  modal.classList.add('active');
}

function closeModal() {
  modal.classList.remove('active');
}

/* ---------- ADMIN RESET ---------- */
resetBtn.onclick = async () => {

  const pass = prompt("Пароль:");
  if (!pass) return;

  const confirmReset = confirm("Скинути гру?");
  if (!confirmReset) return;

  try {

    const res = await fetch('/api/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pass })
    });

    if (!res.ok) {
      alert(await res.text());
      return;
    }

    localStorage.removeItem("played");
    alert("Гру скинуто!");
    location.reload();

  } catch (err) {
    console.error(err);
    alert("Помилка reset");
  }
};

/* ---------- SECRET ADMIN ---------- */
document.addEventListener('keydown', e => {

  if (e.ctrlKey && e.key.toLowerCase() === "a") {
    resetBtn.style.display = "block";
    console.log("ADMIN MODE ENABLED");
  }

});
