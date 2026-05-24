function getAuthHref(routeName) {
  return ToriRoutes.href(routeName);
}

// =======================================================================
// HÀM ĐĂNG KÝ (ĐÃ NÂNG CẤP DÙNG BACKEND MONGODB)
// =======================================================================
async function handleSignup() {
  const username = document.getElementById("reg-username").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const confirm = document.getElementById("reg-confirm").value;

  // 1. Kiểm tra lặt vặt ở Frontend
  if (!username || !email || !password || !confirm) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }
  if (password !== confirm) {
    alert("Mật khẩu xác nhận không khớp!");
    return;
  }

  try {
    // 2. GỌI ĐIỆN CHO BACKEND
    const response = await fetch("http://localhost:5000/api/register", {
      method: "POST", // Hành động Gửi dữ liệu đi
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
      }),
    });

    // 3. Chờ Backend trả lời và dịch câu trả lời
    const data = await response.json();

    // 4. Xử lý kết quả
    if (response.ok) {
      alert("🎉 Đăng ký thành công! Vui lòng hãy đăng nhập.");
      ToriRoutes.go("login");
    } else {
      alert("Lỗi: " + data.message);
    }
  } catch (error) {
    console.error("Lỗi kết nối:", error);
    alert("Không thể kết nối đến Máy chủ. Đảm bảo Backend đang chạy!");
  }
}

// =======================================================================
// HÀM ĐĂNG NHẬP (ĐÃ NÂNG CẤP DÙNG BACKEND MONGODB)
// =======================================================================
async function handleLogin() {
  const username = document.getElementById("log-username").value.trim();
  const password = document.getElementById("log-password").value;

  if (!username || !password) {
    alert("Vui lòng nhập tên đăng nhập và mật khẩu!");
    return;
  }

  try {
    // 1. Gọi điện lên Backend để kiểm tra tài khoản
    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Đăng nhập thành công!");
      // 2. Lưu thông tin phiên đăng nhập của user vào localStorage để các trang khác biết ai đang dùng
      localStorage.setItem("tori_current_user", JSON.stringify(data.user));
      ToriRoutes.go("home"); // Về trang chủ
    } else {
      // Hiện lỗi từ Backend (Ví dụ: Sai mật khẩu, Không tồn tại tài khoản)
      alert("Lỗi: " + data.message);
    }
  } catch (error) {
    console.error("Lỗi kết nối:", error);
    alert("Không thể kết nối đến Máy chủ. Đảm bảo Backend đang chạy!");
  }
}

// =======================================================================
// CÁC HÀM XỬ LÝ GIAO DIỆN (GIỮ NGUYÊN)
// =======================================================================
function handleLogout() {
  localStorage.removeItem("tori_current_user");
  window.location.reload();
}

function checkLoginState() {
  const authMenu = document.getElementById("auth-menu");
  if (!authMenu) return;

  const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));

  if (currentUser) {
    let adminLink = "";
    if (currentUser.role === "admin") {
      adminLink = `<li><a href="${getAuthHref("adminDashboard")}" style="color: #f39c12; font-weight: bold;">[Quản Trị Viên]</a></li>`;
    } else if (currentUser.role === "publisher") {
      adminLink = `<li><a href="${getAuthHref("adminDashboard")}" style="color: #f39c12; font-weight: bold;">[Nhà Xuất Bản]</a></li>`;
    } else {
      adminLink = `<li><a href="${getAuthHref("publisherRegister")}" style="color: #3498db; font-weight: bold;">[Trở thành NXB]</a></li>`;
    }

    authMenu.innerHTML = `
            ${adminLink}
            <li><a href="#" class="user-greeting">${currentUser.username}</a></li>
            <li><button onclick="handleLogout()" class="button-general logout-btn">Đăng xuất</button></li>
        `;
  } else {
    authMenu.innerHTML = `
            <li><a href="${getAuthHref("login")}">Đăng nhập</a></li>
            <li><a href="${getAuthHref("signup")}" class="button-general">Đăng ký</a></li>
        `;
  }
}

function checkCartCount() {
  const countSpan = document.getElementById("cart-count");
  if (!countSpan) return;

  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
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
