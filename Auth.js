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

  let users = JSON.parse(localStorage.getItem("tori_users")) || [];

  const isExist = users.find((u) => u.username === username);
  if (isExist) {
    alert("Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!");
    return;
  }

  users.push({ username, email, password });
  localStorage.setItem("tori_users", JSON.stringify(users));

  alert("Đăng ký thành công! Vui lòng hãy đăng nhập.");
  window.location.href = "Login.html";
}

// =================== XỬ LÝ ĐĂNG NHẬP ===================
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
    window.location.href = "Home_Page.html";
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
            <li><a href="#" style="color: #000080; font-weight: bold;">👤 Chào, ${currentUser.username}</a></li>
            <li><button onclick="handleLogout()" class="button-general" style="background-color: #000080; border-color: #000080;">Đăng xuất</button></li>
        `;
  } else {
    authMenu.innerHTML = `
            <li><a href="Login.html">Đăng nhập</a></li>
            <li><a href="Signup.html" class="button-general">Đăng ký</a></li>
        `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  checkLoginState();
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
