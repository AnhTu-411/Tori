// ============================================================
// NAVBAR.JS - Tự động render Header + Footer cho toàn bộ trang
// File này PHẢI được load SAU Routes.js và Auth.js
// ============================================================

function _initToriNavbar() {
  // Nếu đã có header rồi thì không chèn lại
  if (document.querySelector("header.header")) return;

  // 1. Render Header (Nav-bar)
  const headerHtml = `
    <header class="header">
      <div class="navigation-bar-top">
        <div class="logo">
          <a href="#" data-route="home"><img data-asset="logo" alt="Tori" /></a>
        </div>
        <ul id="auth-menu">
          <li><a href="#" data-route="login">Đăng nhập</a></li>
          <li>
            <a href="#" data-route="signup" class="button-general">Đăng ký</a>
          </li>
        </ul>
      </div>
      <div class="navigation-bar-bottom">
        <div class="navigation-bar-bottom-left_side">
          <ul>
            <li><a href="#" data-route="home">Trang chủ</a></li>
            <li><a href="#" data-route="storyList">Danh sách truyện</a></li>
            <li><a href="#" data-route="selfWritten">Truyện sáng tác</a></li>
            <li><a href="#" data-route="bookshelf">Tủ sách</a></li>
            <li><a href="#" data-route="advancedSearch">Tìm kiếm nâng cao</a></li>
          </ul>
        </div>
        <div class="navigation-bar-bottom-right_side">
          <div class="search-bar">
            <input type="text" id="global-search-input" placeholder="Tìm kiếm truyện..." />
            <button type="button" id="search-button">🔍︎</button>
          </div>
          <a href="#" data-route="cart" class="cart-icon" title="Giỏ hàng">
            🛒 <span id="cart-count">0</span>
          </a>
          <button id="dark-mode-btn" onclick="toggleDarkMode()">
            ⏾ Tắt đèn
          </button>
          <button type="button" id="recharge" data-route-click="recharge">
            Nạp tiền
          </button>
        </div>
      </div>
    </header>
  `;

  // Chèn header vào đầu body
  document.body.insertAdjacentHTML("afterbegin", headerHtml);

  // 2. Render Footer (nếu chưa có)
  if (!document.querySelector("footer.footer")) {
    const footerHtml = `
      <footer class="footer">
        <p>© 2026 Tori Lightnovel. Nền tảng đọc truyện trực tuyến.</p>
        <div class="footer-links">
          <a href="#">Điều khoản</a>
          <a href="#">Bảo mật</a>
          <a href="#">Liên hệ</a>
        </div>
      </footer>
    `;
    document.body.insertAdjacentHTML("beforeend", footerHtml);
  }

  // 3. GỌI LẠI applyRoutes() để xử lý data-route, data-asset trên header/footer vừa chèn
  if (typeof ToriRoutes !== "undefined" && typeof ToriRoutes.applyRoutes === "function") {
    ToriRoutes.applyRoutes();
  }

  // 4. Highlight menu hiện tại dựa trên URL
  var pagePath = window.location.pathname;
  var navLinks = document.querySelectorAll(".navigation-bar-bottom-left_side ul li a");
  navLinks.forEach(function(link) {
    if (link.dataset.route === "home" && (pagePath.endsWith("/") || pagePath.includes("index.html"))) link.classList.add("active");
    if (link.dataset.route === "storyList" && pagePath.includes("Story_List.html")) link.classList.add("active");
    if (link.dataset.route === "selfWritten" && pagePath.includes("Self-written_LightNovel.html")) link.classList.add("active");
    if (link.dataset.route === "bookshelf" && pagePath.includes("Bookshelf.html")) link.classList.add("active");
  });

  // 5. Cập nhật giao diện Đăng Nhập / Đăng Ký nếu user đã đăng nhập
  if (typeof checkLoginState === "function") {
    checkLoginState();
  }
  if (typeof checkCartCount === "function") {
    checkCartCount();
  }

  // 6. Cài đặt chế độ Dark Mode tự động
  if (localStorage.getItem("tori_dark_mode") === "true") {
    document.body.classList.add("dark-mode");
    var darkBtn = document.getElementById("dark-mode-btn");
    if (darkBtn) darkBtn.innerHTML = "☀ Bật đèn";
  }

  // 7. Xử lý Search Bar → chuyển hướng sang Story_List kèm query
  var searchBtn = document.getElementById("search-button");
  var searchInput = document.getElementById("global-search-input");

  if (searchBtn && searchInput) {
    var doSearch = function() {
      var keyword = searchInput.value.trim();
      if (keyword) {
        var searchUrl = ToriRoutes.href("storyList") + "?title=" + encodeURIComponent(keyword);
        window.location.href = searchUrl;
      }
    };

    searchBtn.addEventListener("click", doSearch);
    searchInput.addEventListener("keypress", function(e) {
      if (e.key === "Enter") doSearch();
    });
  }
}

// Hàm toggle Dark Mode dùng chung (phải nằm ở scope toàn cục để onclick="" gọi được)
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  var isDarkMode = document.body.classList.contains("dark-mode");
  localStorage.setItem("tori_dark_mode", isDarkMode);
  var btn = document.getElementById("dark-mode-btn");
  if (btn) btn.innerHTML = isDarkMode ? "☀ Bật đèn" : "⏾ Tắt đèn";
}

// Kích hoạt: nếu DOM đã sẵn sàng thì chạy luôn, nếu chưa thì đợi
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", _initToriNavbar);
} else {
  _initToriNavbar();
}
