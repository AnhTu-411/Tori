// =================== HÀM TẢI VÀ VẼ GIỎ HÀNG RA MÀN HÌNH ===================
function renderCart() {
  const tbody = document.getElementById("cart-items-tbody");
  if (!tbody) return;

  // Lấy thông tin tài khoản đang đăng nhập
  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));

  // CÁ NHÂN HÓA: Tạo hậu tố tên tài khoản
  let userSuffix = currentUser ? "_" + currentUser.username : "";

  // Đọc đúng giỏ hàng của người đó
  let cart = JSON.parse(localStorage.getItem("tori_cart" + userSuffix)) || [];

  let userCoins = currentUser ? currentUser.coins || 0 : 0;
  document.getElementById("summary-balance").innerText = `${userCoins} Coin`;

  if (cart.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 30px; color: #888;">Giỏ hàng của bạn đang trống!</td></tr>`;
    document.getElementById("summary-qty").innerText = "0 tập";
    document.getElementById("summary-total-price").innerText = "0 Coin";
    return;
  }

  let html = "";
  let totalPay = 0;

  cart.forEach((item, index) => {
    html += `
      <tr>
        <td>
          <div class="cart-item-info">
            <img src="${item.cover}" class="cart-item-img">
            <div><strong style="display:block;">${item.title}</strong><span style="font-size:12px; color:#888;">Tập: ${item.volName}</span></div>
          </div>
        </td>
        <td style="font-weight:bold; color:#000080;">${item.price} Coin</td>
        <td><button class="delete-btn" onclick="removeFromCart(${index})">❌ Xóa</button></td>
      </tr>
    `;
    totalPay += item.price;
  });

  tbody.innerHTML = html;
  document.getElementById("summary-qty").innerText = `${cart.length} tập`;
  document.getElementById("summary-total-price").innerText = `${totalPay} Coin`;
}

// =================== HÀM XÓA HÀNG KHỎI GIỎ ===================
function removeFromCart(index) {
  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  let userSuffix = currentUser ? "_" + currentUser.username : "";

  let cart = JSON.parse(localStorage.getItem("tori_cart" + userSuffix)) || [];
  cart.splice(index, 1);
  localStorage.setItem("tori_cart" + userSuffix, JSON.stringify(cart));

  renderCart();

  // Gọi hàm cập nhật icon giỏ hàng trên Header (đã viết sẵn bên Auth.js)
  if (typeof checkCartCount === "function") checkCartCount();
}

// =================== XỬ LÝ THANH TOÁN CHỐT ĐƠN ===================
function processCheckout() {
  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));

  if (!currentUser) {
    alert("Vui lòng đăng nhập để tiến hành thanh toán!");
    window.location.href = "../auth/Login.html";
    return;
  }

  let userSuffix = "_" + currentUser.username;
  let cart = JSON.parse(localStorage.getItem("tori_cart" + userSuffix)) || [];

  if (cart.length === 0) {
    alert("Giỏ hàng trống!");
    return;
  }

  let totalPay = cart.reduce((sum, item) => sum + item.price, 0);
  let userCoins = currentUser.coins || 0;

  if (userCoins < totalPay) {
    alert(`Không đủ tiền! Còn thiếu ${totalPay - userCoins} Coin.`);
    window.location.href = "Recharge.html";
    return;
  }

  // Trừ tiền
  currentUser.coins = userCoins - totalPay;
  localStorage.setItem("tori_current_user", JSON.stringify(currentUser));

  // Đồng bộ lại tiền vào sổ tổng
  let allUsers = JSON.parse(localStorage.getItem("tori_users")) || [];
  let userIdx = allUsers.findIndex((u) => u.username === currentUser.username);
  if (userIdx !== -1) {
    allUsers[userIdx].coins = currentUser.coins;
    localStorage.setItem("tori_users", JSON.stringify(allUsers));
  }

  // Chuyển hàng vào Lịch sử mua ĐÚNG CỦA TÀI KHOẢN ĐÓ
  let purchased =
    JSON.parse(localStorage.getItem("tori_purchased" + userSuffix)) || [];
  localStorage.setItem(
    "tori_purchased" + userSuffix,
    JSON.stringify([...purchased, ...cart]),
  );

  // Xóa trắng giỏ hàng cá nhân
  localStorage.removeItem("tori_cart" + userSuffix);

  alert("🎉 Thanh toán thành công! Truyện đã vào Tủ sách.");
  window.location.href = "../shelf/Bookshelf.html";
}

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
});
