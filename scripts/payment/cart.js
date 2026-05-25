// =================== HÀM TẢI VÀ VẼ GIỎ HÀNG TỪ CSDL ===================
async function renderCart() {
  const tbody = document.getElementById("cart-items-tbody");
  if (!tbody) return;

  const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (!currentUser) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 30px; color: #888;">Vui lòng đăng nhập để xem giỏ hàng!</td></tr>`;
    return;
  }

  // Cập nhật số dư hiển thị
  let userCoins = currentUser.coins || 0;
  // Cập nhật lại chính xác từ server (lấy info)
  try {
    const infoRes = await fetch("http://localhost:5000/api/users/" + currentUser.username + "/info");
    if (infoRes.ok) {
      const info = await infoRes.json();
      userCoins = info.coins;
      currentUser.coins = info.coins;
      localStorage.setItem("tori_current_user", JSON.stringify(currentUser));
    }
  } catch(e) {}
  
  document.getElementById("summary-balance").innerText = `${userCoins} Coin`;

  try {
    const res = await fetch("http://localhost:5000/api/users/" + currentUser.username + "/cart");
    if (!res.ok) throw new Error("Lỗi khi tải giỏ hàng");
    const cart = await res.json();

    if (cart.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 30px; color: #888;">Giỏ hàng của bạn đang trống!</td></tr>`;
      document.getElementById("summary-qty").innerText = "0 chương";
      document.getElementById("summary-total-price").innerText = "0 Coin";
      return;
    }

    let html = "";
    let totalPay = 0;

    cart.forEach((chap) => {
      // chap.storyId đã được populate chứa title và coverImg
      const coverImg = (chap.storyId && chap.storyId.coverImg) ? chap.storyId.coverImg : 'https://via.placeholder.com/50x70?text=No+Cover';
      const storyTitle = (chap.storyId && chap.storyId.title) ? chap.storyId.title : 'Truyện không xác định';
      
      html += `
        <tr>
          <td>
            <div class="cart-item-info">
              <img src="${coverImg}" class="cart-item-img">
              <div>
                <strong style="display:block;">${storyTitle}</strong>
                <span style="font-size:12px; color:#888;">Chương ${chap.chapterNumber}: ${chap.title}</span>
              </div>
            </div>
          </td>
          <td style="font-weight:bold; color:#000080;">${chap.price || 0} Coin</td>
          <td><button class="delete-btn" onclick="removeFromCart('${chap._id}')">❌ Xóa</button></td>
        </tr>
      `;
      totalPay += (chap.price || 0);
    });

    tbody.innerHTML = html;
    document.getElementById("summary-qty").innerText = `${cart.length} chương`;
    document.getElementById("summary-total-price").innerText = `${totalPay} Coin`;
    
    // Lưu lại danh sách chapterId đang có trong giỏ hàng để lát checkout
    window.currentCartItemIds = cart.map(c => c._id);
    window.currentCartTotal = totalPay;
    
  } catch(err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 30px; color: red;">Lỗi kết nối tới máy chủ!</td></tr>`;
  }
}

// =================== HÀM XÓA CHƯƠNG KHỎI GIỎ ===================
async function removeFromCart(chapterId) {
  const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (!currentUser) return;

  try {
    const res = await fetch("http://localhost:5000/api/users/cart/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: currentUser.username,
        chapterId: chapterId
      })
    });

    if (res.ok) {
      // Cập nhật lại giao diện giỏ hàng
      renderCart();
      // Gọi hàm cập nhật icon giỏ hàng trên Header (đã viết sẵn bên Auth.js)
      if (typeof checkCartCount === "function") checkCartCount();
    } else {
      const data = await res.json();
      alert("Lỗi xoá giỏ hàng: " + data.message);
    }
  } catch (err) {
    alert("Lỗi kết nối máy chủ");
  }
}

// =================== XỬ LÝ THANH TOÁN CHỐT ĐƠN ===================
async function processCheckout() {
  const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));

  if (!currentUser) {
    alert("Vui lòng đăng nhập để tiến hành thanh toán!");
    if(typeof ToriRoutes !== "undefined") ToriRoutes.go("login");
    return;
  }

  if (!window.currentCartItemIds || window.currentCartItemIds.length === 0) {
    alert("Giỏ hàng rỗng!");
    return;
  }

  const totalPay = window.currentCartTotal || 0;
  const userCoins = currentUser.coins || 0;

  if (userCoins < totalPay) {
    alert(`Không đủ tiền! Bạn đang có ${userCoins} Coin, cần thêm ${totalPay - userCoins} Coin.`);
    if(typeof ToriRoutes !== "undefined") ToriRoutes.go("recharge");
    return;
  }

  if (confirm(`Bạn có chắc muốn thanh toán ${totalPay} Coin cho ${window.currentCartItemIds.length} chương truyện?`)) {
    try {
      const res = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser.username,
          chapterIds: window.currentCartItemIds,
          totalAmount: totalPay
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert("🎉 " + data.message);
        
        // Cập nhật lại tiền trên Header
        currentUser.coins = data.newCoins;
        localStorage.setItem("tori_current_user", JSON.stringify(currentUser));
        
        // Cập nhật lại icon giỏ hàng
        if (typeof checkCartCount === "function") checkCartCount();
        
        // Chuyển hàng vào Lịch sử mua (Tủ sách) hoặc reload giỏ hàng
        renderCart();
      } else {
        alert("⚠️ Lỗi thanh toán: " + data.message);
      }
    } catch (err) {
      alert("Lỗi kết nối tới máy chủ khi thanh toán!");
      console.error(err);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderCart();
});
