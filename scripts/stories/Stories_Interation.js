// =================== HÀM VẼ CHI TIẾT TRUYỆN ===================
function loadStoryDetail() {
  const detailContainer = document.getElementById("story-detail-container");
  if (!detailContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const storyId = parseInt(urlParams.get("id"));
  // Nếu gặp lỗi mockStories không tồn tại, hãy chắc chắn Fake_DataBase.js được nhúng trước file này trong HTML
  const story = mockStories.find((s) => s.id === storyId);

  if (!story) {
    detailContainer.innerHTML = `<h2 style="text-align: center; color: red;">Không tìm thấy truyện!</h2>`;
    return;
  }

  document.title = story.title + " - Tori Lightnovel";

  // CÁ NHÂN HÓA: Tìm lịch sử mua của đúng người dùng hiện tại
  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  let userSuffix = currentUser ? "_" + currentUser.username : "";
  let purchasedList =
    JSON.parse(localStorage.getItem("tori_purchased" + userSuffix)) || [];

  const VOL_PRICE = 50;

  let tagsHtml = "";
  if (story.tags) {
    for (let i = 0; i < story.tags.length; i++) {
      tagsHtml += `<span class="tag-badge">${story.tags[i]}</span>`;
    }
  }

  let volumesHtml = "";
  if (story.volumes && story.volumes.length > 0) {
    for (let i = 0; i < story.volumes.length; i++) {
      const vol = story.volumes[i];

      const isPurchased = purchasedList.some(
        (item) => item.storyId === story.id && item.volIndex === i,
      );

      let chaptersHtml = "";

      for (let j = 0; j < vol.chapters.length; j++) {
        const chap = vol.chapters[j];
        const badgeHtml = chap.badge
          ? `<span class="chap-badge">${chap.badge}</span>`
          : "";
        const iconHtml = chap.title.includes("Ảnh") ? `🖼️ ` : `📄 `;

        if (isPurchased) {
          chaptersHtml += `
            <div class="chap-row">
              <div class="chap-left">
                ${badgeHtml} <a href="Reading.html?storyId=${story.id}&vol=${i}&chap=${j}">${iconHtml}${chap.title}</a>
              </div>
              <div class="chap-right">${chap.date}</div>
            </div>
          `;
        } else {
          chaptersHtml += `
            <div class="chap-row" style="opacity: 0.5;">
              <div class="chap-left">
                ${badgeHtml} <span onclick="requirePurchase()" style="cursor: pointer;">${iconHtml}${chap.title} 🔒</span>
              </div>
              <div class="chap-right">${chap.date}</div>
            </div>
          `;
        }
      }

      let buyButtonHtml = "";
      if (isPurchased) {
        buyButtonHtml = `<span style="color: green; font-weight: bold; font-size: 14px; float: right;">✅ Đã sở hữu</span>`;
      } else {
        buyButtonHtml = `<button onclick="addVolToCart(${story.id}, '${story.title.replace(/'/g, "\\'")}', ${i}, '${vol.volTitle.replace(/'/g, "\\'")}', '${vol.volCover}', ${VOL_PRICE})" class="button-general" style="float: right; padding: 5px 15px; font-size: 12px; margin-top: -5px;">🛒 Mua Tập (${VOL_PRICE} Coin)</button>`;
      }

      volumesHtml += `
        <div class="vol-box">
          <div class="vol-header">
            <h3>${vol.volTitle} <span style="color: red;">*</span></h3>
            ${buyButtonHtml}
            <div style="clear: both;"></div> 
          </div>
          <div class="vol-body">
            <div class="vol-cover">
              <img src="${vol.volCover}" alt="Bìa Vol">
            </div>
            <div class="vol-chap-list">
              ${chaptersHtml}
            </div>
          </div>
        </div>
      `;
    }
  }

  const htmlContent = `
    <div class="story-detail-header">
      <div class="detail-cover">
        <img src="${story.coverUrl}" alt="Bìa truyện">
      </div>
      <div class="detail-info">
        <h1 class="detail-title">${story.title}</h1>
        <div class="detail-tags">${tagsHtml}</div>
        <p class="detail-meta"><strong>Tác giả:</strong> ${story.author}</p>
        <p class="detail-meta"><strong>Tình trạng:</strong> ${story.status || "Đang tiến hành"}</p>
        <div class="detail-actions">
          <div class="action-item" onclick="toggleFavorite(${story.id})" style="cursor: pointer;"><span id="fav-icon-${story.id}">♡</span><p></p></div>
          <div class="action-item"><span style="color: gold;">☆</span><p></p></div>
          <div class="action-item" onclick="document.querySelector('.vol-box').scrollIntoView({behavior: 'smooth'})" style="cursor: pointer;"><span>☰</span><p></p></div>
        </div>
        <div class="detail-stats">
          <div><p>Số từ</p><strong>${story.words || "0"}</strong></div>
          <div><p>Đánh giá</p><strong>0 / 0</strong></div>
          <div><p>Lượt xem</p><strong>${story.views || "0"}</strong></div>
        </div>
      </div>
    </div>

    <div class="story-summary-box">
      <h3>Tóm tắt</h3>
      <p>${story.summary || "Chưa có tóm tắt cho truyện này."}</p>
    </div>

    <div style="margin-top: 40px;">
        ${volumesHtml}
    </div>
  `;

  detailContainer.innerHTML = htmlContent;

  checkFavoriteStatus(story.id);
}

//Tương tác

function requirePurchase() {
  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (!currentUser) {
    alert("Vui lòng đăng nhập để có thể mua và đọc bộ truyện này!");
    window.location.href = "../auth/Login.html";
  } else {
    alert(
      "Bạn cần trả phí để mở khóa nội dung Tập này! Vui lòng bấm nút 'Mua Tập' ở phía trên.",
    );
  }
}

function addVolToCart(storyId, title, volIndex, volName, cover, price) {
  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (!currentUser) {
    alert("Vui lòng đăng nhập để mua sắm!");
    window.location.href = "../auth/Login.html";
    return;
  }

  // Lấy đúng giỏ hàng của user
  let userSuffix = "_" + currentUser.username;
  let cart = JSON.parse(localStorage.getItem("tori_cart" + userSuffix)) || [];

  let isExist = cart.find(
    (item) => item.storyId === storyId && item.volIndex === volIndex,
  );
  if (isExist) {
    alert(
      "Tập này đã có trong Giỏ Hàng của bạn rồi! Vui lòng vào giỏ hàng để thanh toán.",
    );
    return;
  }

  const newItem = { storyId, title, volIndex, volName, cover, price };
  cart.push(newItem);
  localStorage.setItem("tori_cart" + userSuffix, JSON.stringify(cart));

  alert("Đã thêm Tập truyện vào giỏ hàng thành công!");

  if (typeof checkCartCount === "function") checkCartCount();
}

function toggleFavorite(storyId) {
  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (!currentUser) {
    alert("Vui lòng đăng nhập để lưu truyện!");
    return;
  }

  let userSuffix = "_" + currentUser.username;
  let favList =
    JSON.parse(localStorage.getItem("tori_favorites" + userSuffix)) || [];
  let index = favList.indexOf(storyId);
  let icon = document.getElementById(`fav-icon-${storyId}`);

  if (index === -1) {
    favList.push(storyId);
    icon.innerText = "♥";
    icon.style.color = "red";
  } else {
    favList.splice(index, 1);
    icon.innerText = "♡";
    icon.style.color = "inherit";
  }

  localStorage.setItem("tori_favorites" + userSuffix, JSON.stringify(favList));
}

function checkFavoriteStatus(storyId) {
  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (!currentUser) return;

  let userSuffix = "_" + currentUser.username;
  let favList =
    JSON.parse(localStorage.getItem("tori_favorites" + userSuffix)) || [];
  if (favList.includes(storyId)) {
    let icon = document.getElementById(`fav-icon-${storyId}`);
    if (icon) {
      icon.innerText = "♥";
      icon.style.color = "red";
    }
  }
}

// CHÍNH LÀ ĐOẠN NÀY ĐỂ FIX MÀN HÌNH BỊ TRẮNG!
// Tự động gọi hàm loadStoryDetail ngay khi trang web đã tải xong HTML
document.addEventListener("DOMContentLoaded", () => {
  loadStoryDetail();
});
