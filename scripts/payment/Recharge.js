let selectedCoins = 500;

document.addEventListener("DOMContentLoaded", () => {
  const priceBoxes = document.querySelectorAll(".price-options .price-box");

  priceBoxes.forEach((box) => {
    box.addEventListener("click", (e) => {
      priceBoxes.forEach((b) => b.classList.remove("selected"));
      const currentBox = e.currentTarget;
      currentBox.classList.add("selected");
      selectedCoins = parseInt(currentBox.getAttribute("data-coins"));
    });
  });

  const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  const userSuffix = currentUser ? "_" + currentUser.username : "";
  let cart = JSON.parse(localStorage.getItem("tori_cart" + userSuffix)) || [];
  const countSpan = document.getElementById("cart-count");
  if (countSpan) countSpan.innerText = cart.length;
});

function submitRecharge() {
  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));

  if (!currentUser) {
    alert("Vui lòng đăng nhập tài khoản để thực hiện chức năng nạp tiền!");
    ToriRoutes.go("login");
    return;
  }

  const method = document.getElementById("payment-method").value;
  const qrImg = document.getElementById("dynamic-qr-img");

  if (method === "Bank") {
    qrImg.src = ToriRoutes.asset("bankQr");
  } else if (method === "VNPay") {
    qrImg.src = ToriRoutes.asset("vnpayQr");
  }

  const modal = document.getElementById("payment-modal");
  if (modal) modal.style.display = "flex";

  let timeLeft = 30;
  const countSpan = document.getElementById("countdown");

  // Lưu timer vào window để truy cập từ ngoài
  window.rechargeTimer = setInterval(() => {
    timeLeft--;
    if (countSpan) countSpan.innerText = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(window.rechargeTimer);
      processPaymentSuccess(currentUser);
    }
  }, 1000);
}

// Hàm giả lập nạp tiền thành công ngay lập tức khi người dùng click vào QR
function processPaymentNow() {
  if (window.rechargeTimer) {
    clearInterval(window.rechargeTimer);
  }
  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (currentUser) {
    processPaymentSuccess(currentUser);
  }
}

async function processPaymentSuccess(currentUser) {
  const method = document.getElementById("payment-method").value;

  try {
    const response = await fetch(`http://localhost:5000/api/users/${currentUser.username}/recharge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        coins: selectedCoins,
        method: method
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Lỗi khi nạp tiền');
    }

    const data = await response.json();

    // Cập nhật local storage
    currentUser.coins = data.newCoins;
    localStorage.setItem("tori_current_user", JSON.stringify(currentUser));

    let allUsers = JSON.parse(localStorage.getItem("tori_users")) || [];
    let userIdx = allUsers.findIndex((u) => u.username === currentUser.username);
    if (userIdx !== -1) {
      allUsers[userIdx].coins = data.newCoins;
      localStorage.setItem("tori_users", JSON.stringify(allUsers));
    }

    document.getElementById("payment-modal").style.display = "none";

    alert(
      `Giao dịch qua ${method.toUpperCase()} thành công!\nTài khoản của bạn vừa được nạp thêm ${selectedCoins} Coin.`
    );
    ToriRoutes.go("cart");
  } catch (err) {
    alert("Nạp tiền thất bại: " + err.message);
    document.getElementById("payment-modal").style.display = "none";
  }
}
