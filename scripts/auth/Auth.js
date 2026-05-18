function getCurrentPath() {
  return window.location.pathname.replace(/\\/g, "/");
}

function getHomeHref() {
  return getCurrentPath().includes("/pages/")
    ? "../../index.html"
    : "index.html";
}

function getAuthHref(pageName) {
  const currentPath = getCurrentPath();
  if (currentPath.includes("/pages/auth/")) return pageName;
  if (currentPath.includes("/pages/")) return `../auth/${pageName}`;
  return `pages/auth/${pageName}`;
}

function handleSignup() {
  const username = document.getElementById("reg-username").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const confirm = document.getElementById("reg-confirm").value;

  if (!username || !email || !password || !confirm) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }
  if (password !== confirm) {
    alert("Mật khẩu xác nhận không khớp!");
    return;
  }
  //Tìm trong localStorage của web xem đã có ds tk chx
  //Nếu chx có thì tạo 1 mảng rỗng để chứa các tk đk mới
  let users = JSON.parse(localStorage.getItem("tori_users")) || [];
  //Tìm trong danh sách xem đã có tên trùng chx
  const isExist = users.find((u) => u.username === username);
  if (isExist) {
    alert("Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!");
    return;
  }

  users.push({ username, email, password, coins: 0 });
  localStorage.setItem("tori_users", JSON.stringify(users));

  alert("Đăng ký thành công! Vui lòng hãy đăng nhập.");
  window.location.href = getAuthHref("Login.html");
}

function handleLogin() {
  const username = document.getElementById("log-username").value.trim();
  const password = document.getElementById("log-password").value;

  if (!username || !password) {
    alert("Vui lòng nhập tên đăng nhập và mật khẩu!");
    return;
  }

  let users = JSON.parse(localStorage.getItem("tori_users")) || [];
  const validUser = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (validUser) {
    alert("Đăng nhập thành công!");
    localStorage.setItem("tori_current_user", JSON.stringify(validUser));
    window.location.href = getHomeHref();
  } else {
    alert("Sai tên đăng nhập hoặc mật khẩu!");
  }
}

function handleLogout() {
  localStorage.removeItem("tori_current_user");
  window.location.reload();
}

function checkLoginState() {
  const authMenu = document.getElementById("auth-menu");
  if (!authMenu) return;

  const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));

  if (currentUser) {
    authMenu.innerHTML = `
            <li><a href="#" class="user-greeting">${currentUser.username}</a></li>
            <li><button onclick="handleLogout()" class="button-general logout-btn">Đăng xuất</button></li>
        `;
  } else {
    authMenu.innerHTML = `
            <li><a href="${getAuthHref("Login.html")}">Đăng nhập</a></li>
            <li><a href="${getAuthHref("Signup.html")}" class="button-general">Đăng ký</a></li>
        `;
  }
}

function checkCartCount() {
  const countSpan = document.getElementById("cart-count");
  if (!countSpan) return;

  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  // Nếu là khách, giỏ hàng đếm = 0. Nếu là user, lấy đúng hậu tố tên của họ.
  let userSuffix = currentUser ? "_" + currentUser.username : "";
  let cart = JSON.parse(localStorage.getItem("tori_cart" + userSuffix)) || [];

  countSpan.innerText = cart.length;
}

document.addEventListener("DOMContentLoaded", () => {
  checkLoginState();
  checkCartCount();
});

function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const eyeIcon = event.target;
  if (input.type === "password") {
    input.type = "text";
    eyeIcon.innerText = "😳";
  } else {
    input.type = "password";
    eyeIcon.innerText = "🧐";
  }
}
