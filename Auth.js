//Xử lý đăng kí
function handleSignup() {
  //lấy dữ liệu từ người từ người dùng nhập vào
  //trim() dùng để gọt bỏ mấy dấu cách thừa ở đầu và cuối chữ
  const username = document.getElementById("reg-username").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const confirm = document.getElementById("reg-confirm").value;
  //Nếu 1 trong 4 ô trống thì return
  if (!username || !email || !password || !confirm) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }
  //Nếu mật khẩu xác nhận khác mk thì return
  if (password !== confirm) {
    alert("Mật khẩu xác nhận không khớp!");
    return;
  }
  //Tìm trogn localStorage của web xem đã có ds tk chx
  //Nếu chx có thìtạo 1 mảng rỗng để chứa các tk đk mới
  let users = JSON.parse(localStorage.getItem("tori_users")) || [];
  //Tìmtrong danh sách xem đã có tên trùng chx
  const isExist = users.find((u) => u.username === username);
  if (isExist) {
    alert("Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!");
    return;
  }
  //Tạo 1 bọc chứa thông tin người dùng và nhét vào mảng
  users.push({ username, email, password });
  //cất lại vào mảng chứa thông tin các tài khoản (users)
  localStorage.setItem("tori_users", JSON.stringify(users));

  alert("Đăng ký thành công! Vui lòng hãy đăng nhập.");

  window.location.href = "Login.html";
}

//Xử lý đăng nhập
function handleLogin() {
  const username = document.getElementById("log-username").value.trim();
  const password = document.getElementById("log-password").value;

  if (!username || !password) {
    alert("Vui lòng nhập tên đăng nhập và mật khẩu!");
    return;
  }

  let users = JSON.parse(localStorage.getItem("tori_users")) || [];
  // Tìm kiếm xem có tk nào khớp pass vs username không
  const validUser = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (validUser) {
    alert("Đăng nhập thành công!");
    //Lưu tạm thông tin tk này vào ngăn "Người dùng hiện tại" (tori_current_user)
    localStorage.setItem("tori_current_user", JSON.stringify(validUser));
    window.location.href = "Home_Page.html";
  } else {
    alert("Sai tên đăng nhập hoặc mật khẩu!");
  }
}

//Xử lý đăng xuất
function handleLogout() {
  //Xóa trắng thông tin trong ngăn "Người dùng hiện tại"
  localStorage.removeItem("tori_current_user");
  window.location.reload(); //load lại trang
}

//UI menu người dùng góc phải
function checkLoginState() {
  const authMenu = document.getElementById("auth-menu");
  if (!authMenu) return; //Nếu trang nào không có menu thì return
  //Check xem có tk đang đăng nhập không
  const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));

  if (currentUser) {
    //Nếu có tk đăng nhập, hiển thị tên và nút Đăng xuất
    authMenu.innerHTML = `
            <li><a href="#" style="color: #000080; font-weight: bold;">👤 Chào, ${currentUser.username}</a></li>
            <li><button onclick="handleLogout()" class="button-general" style="background-color: #000080; border-color: #000080;">Đăng xuất</button></li>
        `;
  } else {
    //Nếu là guest, hiển thị lại 2 nút Đăng nhập / Đăng ký
    authMenu.innerHTML = `
            <li><a href="Login.html">Đăng nhập</a></li>
            <li><a href="Signup.html" class="button-general">Đăng ký</a></li>
        `;
  }
}
//Chạy hàm kiểm tra menu ngay khi trang web vừa load xong
document.addEventListener("DOMContentLoaded", () => {
  checkLoginState();
});
//Nút ẩn hiện mk khi đang đăng nhập/đăng kí
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const eyeIcon = event.target;
  //Nếu ô mk đang bị ẩn sau khi ấn sẽ hiện và ngược lại
  if (input.type === "password") {
    input.type = "text";
    eyeIcon.innerText = "😳";
  } else {
    input.type = "password";
    eyeIcon.innerText = "🧐";
  }
}
