const themeToggleSwitch = document.getElementById('themeToggleSwitch');
const scrollTopBtn = document.getElementById('scrollTopBtn');

function getData() {
  return JSON.parse(localStorage.getItem('polski_chat_data')) || {
    theme: 'light',
  };
}

function saveData(data) {
  localStorage.setItem('polski_chat_data', JSON.stringify(data));
}

function applyTheme(theme) {
  document.body.setAttribute('data-theme', theme);
  if(theme === 'dark') {
    themeToggleSwitch.checked = true;
  } else {
    themeToggleSwitch.checked = false;
  }
}

themeToggleSwitch.addEventListener('change', () => {
  const data = getData();
  data.theme = themeToggleSwitch.checked ? 'dark' : 'light';
  saveData(data);
  applyTheme(data.theme);
});

window.addEventListener('scroll', () => {
  if(window.scrollY > 300) {
    scrollTopBtn.style.display = 'block';
  } else {
    scrollTopBtn.style.display = 'none';
  }
});

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({top: 0, behavior: 'smooth'});
});

document.addEventListener('DOMContentLoaded', () => {
  const data = getData();
  applyTheme(data.theme);
});
