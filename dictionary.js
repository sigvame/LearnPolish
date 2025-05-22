let words = JSON.parse(localStorage.getItem("dictionary_words") || "[]");
let editIndex = null;

const wordList = document.getElementById("wordList");
const form = document.getElementById("wordForm");
const wordInput = document.getElementById("wordInput");
const translationInput = document.getElementById("translationInput");
const categoryInput = document.getElementById("categoryInput");
const tagInput = document.getElementById("tagInput");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const filterCategory = document.getElementById("filterCategory");
const filterTag = document.getElementById("filterTag");
const importBtn = document.getElementById("importBtn");
const importInput = document.getElementById("importInput");
const exportBtn = document.getElementById("exportBtn");

function saveWords() {
  localStorage.setItem("dictionary_words", JSON.stringify(words));
}

function renderList() {
  wordList.innerHTML = "";
  const selectedCat = filterCategory.value;
  const selectedTag = filterTag.value;

  const categories = new Set();
  words.forEach((w, i) => {
    if (w.category) categories.add(w.category);

    if ((selectedCat && w.category !== selectedCat) ||
        (selectedTag && w.tag !== selectedTag)) return;

    const div = document.createElement("div");
    div.className = "word-item" + (w.tag ? " " + w.tag : "");

    const info = document.createElement("div");
    info.className = "info";
    info.innerHTML = `<strong>${w.word}</strong> — ${w.translation} <i>(${w.category || "brak"})</i>`;

    info.addEventListener("click", () => {
      wordInput.value = w.word;
      translationInput.value = w.translation;
      categoryInput.value = w.category;
      tagInput.value = w.tag;
      editIndex = i;
      cancelEditBtn.style.display = "inline-block";
    });

    const del = document.createElement("button");
    del.textContent = "🗑️";
    del.onclick = () => {
      if (confirm("Usunąć słowo?")) {
        words.splice(i, 1);
        saveWords();
        renderList();
      }
    };

    div.appendChild(info);
    div.appendChild(del);
    wordList.appendChild(div);
  });

  filterCategory.innerHTML = '<option value="">Wszystkie kategorie</option>';
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    filterCategory.appendChild(opt);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const newWord = {
    word: wordInput.value.trim(),
    translation: translationInput.value.trim(),
    category: categoryInput.value.trim(),
    tag: tagInput.value
  };

  if (editIndex !== null) {
    words[editIndex] = newWord;
    editIndex = null;
    cancelEditBtn.style.display = "none";
  } else {
    words.push(newWord);
  }

  form.reset();
  saveWords();
  renderList();
});

cancelEditBtn.addEventListener("click", () => {
  editIndex = null;
  form.reset();
  cancelEditBtn.style.display = "none";
});

filterCategory.addEventListener("change", renderList);
filterTag.addEventListener("change", renderList);

exportBtn.addEventListener("click", () => {
  const lines = words.map(w => {
    const cat = w.category ? ` (${w.category})` : "";
    const tag = w.tag ? ` [${w.tag}]` : "";
    return `${w.word} — ${w.translation}${cat}${tag}`;
  });

  const textData = lines.join("\n");

  const utf8Bom = "\uFEFF";
  const blob = new Blob([utf8Bom + textData], { type: "text/plain;charset=utf-8" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "dictionary_export.txt";
  a.click();
});


importBtn.addEventListener("click", () => importInput.click());
importInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const content = event.target.result;

    try {
      if (file.name.endsWith(".json")) {
        // Импорт из JSON
        const imported = JSON.parse(content);
        if (Array.isArray(imported)) {
          words = [...words, ...imported];
          saveWords();
          renderList();
        } else {
          alert("Nieprawidłowy plik JSON.");
        }
      } else {
        // Импорт из текстового файла
        const lines = content.split(/\r?\n/).filter(line => line.trim());
        const parsed = lines.map(line => {
          const match = line.match(/^(.+?)\s+—\s+(.+?)(?:\s+\((.+?)\))?(?:\s+\[(.+?)\])?$/);
          if (!match) return null;

          return {
            word: match[1].trim(),
            translation: match[2].trim(),
            category: match[3] ? match[3].trim() : "",
            tag: match[4] ? match[4].trim() : ""
          };
        }).filter(Boolean);

        if (parsed.length === 0) {
          alert("Brak poprawnych danych w pliku tekstowym.");
          return;
        }

        words = [...words, ...parsed];
        saveWords();
        renderList();
      }
    } catch (err) {
      alert("Błąd importu pliku.");
    }
  };

  reader.readAsText(file, "UTF-8");
});

function initCustomSelect(selectId, onChange) {
  const container = document.getElementById(selectId);
  const selected = container.querySelector(".select-selected");
  const options = container.querySelector(".select-items");

  container.addEventListener("click", function (e) {
    e.stopPropagation();
    closeAllSelect(this);
    options.classList.toggle("select-hide");
    selected.classList.toggle("select-arrow-active");
  });

  options.querySelectorAll("div").forEach(option => {
    option.addEventListener("click", function () {
      const value = this.dataset.value;
      selected.textContent = this.textContent;
      onChange(value);
      closeAllSelect();
    });
  });
}

function closeAllSelect(except = null) {
  document.querySelectorAll(".select-items").forEach(el => {
    if (el.parentElement !== except) el.classList.add("select-hide");
  });
  document.querySelectorAll(".select-selected").forEach(el => {
    if (el.parentElement !== except) el.classList.remove("select-arrow-active");
  });
}

renderList();

