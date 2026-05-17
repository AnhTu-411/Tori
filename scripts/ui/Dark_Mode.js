function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const btn = document.getElementById("dark-mode-btn");

  if (document.body.classList.contains("dark-mode")) {
    btn.innerText = "☀︎ Bật đèn";
    localStorage.setItem("theme", "dark");
  } else {
    btn.innerText = "⏾ Tắt đèn";
    localStorage.setItem("theme", "light");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    const btn = document.getElementById("dark-mode-btn");
    if (btn) btn.innerText = "☀︎ Bật đèn";
  }
});
