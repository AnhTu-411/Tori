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

  const timer = setInterval(() => {
    timeLeft--;
    if (countSpan) countSpan.innerText = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      processPaymentSuccess(currentUser);
    }
  }, 1000);
}

function processPaymentSuccess(currentUser) {
  const method = document.getElementById("payment-method").value;

  let currentCoins = currentUser.coins || 0;
  currentUser.coins = currentCoins + selectedCoins;
  localStorage.setItem("tori_current_user", JSON.stringify(currentUser));

  let allUsers = JSON.parse(localStorage.getItem("tori_users")) || [];
  let userIdx = allUsers.findIndex((u) => u.username === currentUser.username);
  if (userIdx !== -1) {
    allUsers[userIdx].coins = currentUser.coins;
    localStorage.setItem("tori_users", JSON.stringify(allUsers));
  }

  document.getElementById("payment-modal").style.display = "none";

  alert(
    `Giao dịch qua ${method.toUpperCase()} thành công!\nTài khoản của bạn vừa được nạp thêm ${selectedCoins} Coin.`,
  );
  ToriRoutes.go("cart");
}
