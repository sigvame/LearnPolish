const levels = ["a1", "a2", "b1", "b2"];

const textContent = document.getElementById("textContent");
const textActions = document.getElementById("textActions");
const markReadBtn = document.getElementById("markReadButton");
const markReadingBtn = document.getElementById("markReadingButton");

let allTextsByLevel = {};
let currentLevel = null;
let currentTextId = null;

function getData() {
    const data = JSON.parse(localStorage.getItem("czytanie_data")) || {};
    return {
      readTexts: Array.isArray(data.readTexts) ? data.readTexts : [],
      inProgressTexts: Array.isArray(data.inProgressTexts) ? data.inProgressTexts : [],
      openTextId: data.openTextId || null,
      openLevel: data.openLevel || null
    };
  }

function saveData(data) {
  localStorage.setItem("czytanie_data", JSON.stringify(data));
}

async function loadTextsForLevel(level) {
    try {
      const res = await fetch(`texts/${level}.json`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const texts = await res.json();
      allTextsByLevel[level] = texts;
      renderTextsList(level);
    } catch (e) {
      console.error("Ошибка загрузки текстов:", e);
      const ul = document.getElementById(`list-${level}`);
      ul.innerHTML = `<li style="color:red;">Nie udało się załadować tekstów.</li>`;
    }
  }
  

function renderTextsList(level) {
  const ul = document.getElementById(`list-${level}`);
  const data = getData();
  ul.innerHTML = "";

  const texts = allTextsByLevel[level] || [];
  texts.forEach(text => {
    const li = document.createElement("li");
    li.textContent = text.title;

    if (data.readTexts.includes(text.id)) {
      li.classList.add("read");
      li.textContent += " ✔️";
    } else if (data.inProgressTexts.includes(text.id)) {
      li.classList.add("reading");
      li.textContent += " 📘";
    }

    li.addEventListener("click", () => {
      currentLevel = level;
      currentTextId = text.id;

      showText(text);

      const data = getData();
      data.openTextId = text.id;
      data.openLevel = level;
      saveData(data);

      document.getElementById(`list-${level}`).classList.remove("open");
      const offcanvasEl = document.getElementById('menuOffcanvas');
      const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
      if (offcanvas) offcanvas.hide();
    });

    ul.appendChild(li);
  });
}

function showText(text) {
  const paragraphs = text.content
    .split('\n\n')
    .map(p => `<p>${p.trim()}</p>`)
    .join('');

  textContent.innerHTML = `<h2>${text.title}</h2><hr>${paragraphs}`;
  textActions.style.display = "block";
  updateMarkButtons();
}

function updateMarkButtons() {
  const data = getData();
  const id = currentTextId;
  const isRead = data.readTexts.includes(id);
  const isReading = data.inProgressTexts.includes(id);

  markReadBtn.textContent = isRead ? "✗ Cofnij przeczytany" : "✔️ Oznacz jako przeczytany";
  markReadBtn.className = isRead ? "btn btn-outline-danger me-2" : "btn btn-success me-2";

  markReadingBtn.textContent = isReading ? "✗ Cofnij czytam" : "📘 Oznacz jako czytam";
  markReadingBtn.className = isReading ? "btn btn-outline-primary" : "btn btn-primary";
}

markReadBtn.addEventListener("click", () => {
  const data = getData();
  const id = currentTextId;
  if (!id) return;

  if (data.readTexts.includes(id)) {
    data.readTexts = data.readTexts.filter(rid => rid !== id);
  } else {
    data.readTexts.push(id);
    data.inProgressTexts = data.inProgressTexts.filter(pid => pid !== id);
  }
  saveData(data);
  updateMarkButtons();
  renderTextsList(currentLevel);
});

markReadingBtn.addEventListener("click", () => {
  const data = getData();
  const id = currentTextId;
  if (!id) return;

  if (data.inProgressTexts.includes(id)) {
    data.inProgressTexts = data.inProgressTexts.filter(pid => pid !== id);
  } else {
    data.inProgressTexts.push(id);
    data.readTexts = data.readTexts.filter(rid => rid !== id);
  }
  saveData(data);
  updateMarkButtons();
  renderTextsList(currentLevel);
});

document.querySelectorAll("#sidebar h3").forEach(h3 => {
  h3.addEventListener("click", () => {
    const level = h3.dataset.level;
    const ul = document.getElementById(`list-${level}`);

    if (!allTextsByLevel[level]) {
      loadTextsForLevel(level);
    }

    if (ul.classList.contains("open")) {
      ul.classList.remove("open");
    } else {
      document.querySelectorAll("#sidebar ul").forEach(u => u.classList.remove("open"));
      ul.classList.add("open");
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const data = getData();
  if (data.openLevel) {
    const ul = document.getElementById(`list-${data.openLevel}`);
    ul.classList.add("open");

    if (!allTextsByLevel[data.openLevel]) {
      loadTextsForLevel(data.openLevel).then(() => {
        const texts = allTextsByLevel[data.openLevel] || [];
        const text = texts.find(t => t.id === data.openTextId);
        if (text) {
          currentLevel = data.openLevel;
          currentTextId = data.openTextId;
          showText(text);
        }
      });
    } else {
      const texts = allTextsByLevel[data.openLevel] || [];
      const text = texts.find(t => t.id === data.openTextId);
      if (text) {
        currentLevel = data.openLevel;
        currentTextId = data.openTextId;
        showText(text);
      }
    }
  }
});



