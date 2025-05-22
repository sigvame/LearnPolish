const wordModal = document.getElementById("addWordModal");
const wordTextElem = document.getElementById("selectedWordText");
const closeWordModal = document.querySelector(".close-word-modal");
const addToDictForm = document.getElementById("addToDictionaryForm");

wordModal.classList.add("hidden");

let selectedWord = "";

textContent.addEventListener("dblclick", (e) => {
  const selection = window.getSelection().toString().trim();
  if (selection && /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ-]+$/.test(selection)) {
    selectedWord = selection;
    wordTextElem.textContent = `"${selection}"`;
    document.getElementById("modalTranslationInput").value = "";
    document.getElementById("modalCategoryInput").value = "";
    document.getElementById("modalTagInput").value = "";
    wordModal.classList.remove("hidden");
  }
});

closeWordModal.addEventListener("click", () => {
  wordModal.classList.add("hidden");
});

addToDictForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const translation = document.getElementById("modalTranslationInput").value.trim();
  const category = document.getElementById("modalCategoryInput").value.trim();
  const tag = document.getElementById("modalTagInput").value;

  if (!translation) return;

  const newWord = {
    word: selectedWord,
    translation,
    category,
    tag
  };

  const words = JSON.parse(localStorage.getItem("dictionary_words") || "[]");
  words.push(newWord);
  localStorage.setItem("dictionary_words", JSON.stringify(words));
  
  wordModal.classList.add("hidden");
});
