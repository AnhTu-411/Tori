function switchShelfTab(tabName) {
  const contents = document.querySelectorAll(".shelf-content");
  const buttons = document.querySelectorAll(".tab-btn");

  contents.forEach((content) => content.classList.remove("active"));
  buttons.forEach((btn) => btn.classList.remove("active"));

  document.getElementById(`shelf-${tabName}`).classList.add("active");
  const clickedBtn = event.currentTarget;
  clickedBtn.classList.add("active");

  if (tabName === "following") {
    loadFollowingStories();
  } else if (tabName === "purchased") {
    loadPurchasedHistory();
  } else if (tabName === "favorite") {
    loadFavoriteStories();
  }
}

// Truyện đã thích
async function loadFavoriteStories() {
  const grid = document.getElementById("favorite-grid");
  if (!grid) return;

  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (!currentUser) {
    grid.innerHTML = `<p class="empty-message">Vui lòng đăng nhập để xem Tủ sách cá nhân.</p>`;
    return;
  }

  try {
    const API_URL = "http://localhost:5000/api";
    const response = await fetch(`${API_URL}/users/${currentUser.username}/favorites`);
    if (!response.ok) throw new Error("Lỗi tải data");
    const favList = await response.json();

    if (favList.length === 0) {
      grid.innerHTML = `<p class="empty-message">Bạn chưa thích bộ truyện nào.</p>`;
      return;
    }

    let html = "";
    favList.forEach((story) => {
      const detailHref = ToriRoutes.href("storyDetail", { id: story._id });

      html += `
        <a href="${detailHref}" class="story-card" style="text-decoration: none; display: block;">
          <img src="${story.coverImg || 'https://via.placeholder.com/200x280?text=No+Cover'}" alt="Bìa truyện ${story.title}">
          <div class="story-info">
            <h3 class="story-title">${story.title}</h3>
            <p class="story-author">Tác giả: ${story.author}</p>
          </div>
        </a>
      `;
    });
    grid.innerHTML = html;
  } catch (err) {
    grid.innerHTML = `<p class="empty-message" style="color:red;">Lỗi kết nối Server!</p>`;
    console.error(err);
  }
}

//truyện theo dõi
async function loadFollowingStories() {
  const grid = document.getElementById("following-grid");
  if (!grid) return;

  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (!currentUser) {
    grid.innerHTML = `<p class="empty-message">Vui lòng đăng nhập để xem Tủ sách cá nhân.</p>`;
    return;
  }

  try {
    const API_URL = "http://localhost:5000/api";
    const response = await fetch(`${API_URL}/users/${currentUser.username}/following`);
    if (!response.ok) throw new Error("Lỗi tải data");
    const favList = await response.json();

    if (favList.length === 0) {
      grid.innerHTML = `<p class="empty-message">Bạn chưa theo dõi bộ truyện nào.</p>`;
      return;
    }

    let html = "";
    favList.forEach((story) => {
      const detailHref = ToriRoutes.href("storyDetail", { id: story._id });

      html += `
        <a href="${detailHref}" class="story-card" style="text-decoration: none; display: block;">
          <img src="${story.coverImg || 'https://via.placeholder.com/200x280?text=No+Cover'}" alt="Bìa truyện ${story.title}">
          <div class="story-info">
            <h3 class="story-title">${story.title}</h3>
            <p class="story-author">Tác giả: ${story.author}</p>
          </div>
        </a>
      `;
    });
    grid.innerHTML = html;
  } catch (err) {
    grid.innerHTML = `<p class="empty-message" style="color:red;">Lỗi kết nối Server!</p>`;
    console.error(err);
  }
}

//lịch sử mua
async function loadPurchasedHistory() {
  const listContainer = document.getElementById("purchased-list");
  if (!listContainer) return;

  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (!currentUser) {
    listContainer.innerHTML = `<p class="empty-message">Vui lòng đăng nhập để xem lịch sử mua hàng.</p>`;
    return;
  }

  try {
    const API_URL = "http://localhost:5000/api";
    const response = await fetch(`${API_URL}/users/${currentUser.username}/transactions`);
    if (!response.ok) throw new Error("Lỗi tải lịch sử giao dịch");
    const transactions = await response.json();

    if (transactions.length === 0) {
      listContainer.innerHTML = `<p class="empty-message">Bạn chưa mua nội dung trả phí nào.</p>`;
      return;
    }

    let html = "";
    transactions.forEach((tx) => {
      const story = tx.story;
      if (!story) return;

      const detailHref = ToriRoutes.href("storyDetail", { id: story._id });
      const txDate = new Date(tx.createdAt).toLocaleString("vi-VN");

      html += `
        <a href="${detailHref}" style="text-decoration: none; display: block; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 15px;">
          <div class="update-item" style="align-items: center; border: none; padding: 0; margin: 0;">
            <div class="update-cover" style="height: 90px; width: 65px; min-width: 65px;">
              <img src="${story.coverImg || 'https://via.placeholder.com/65x90?text=No+Cover'}" alt="Bìa">
            </div>
            <div class="update-info">
              <div class="update-title" style="font-size: 16px; color: #000080;">${story.title}</div>
              <div class="update-desc" style="margin-bottom: 5px;">Mở khóa: <strong>Toàn bộ truyện</strong></div>
              <div class="update-meta" style="margin-bottom: 5px; color: #666; font-size: 13px;">
                Mã GD: <strong>${tx.transactionId}</strong> | Ngày: ${txDate}
              </div>
              <div class="update-meta" style="margin-bottom: 0;">
                  <span style="color: green; font-weight: bold;">💳 Đã thanh toán: ${tx.price} Coin (${tx.status})</span>
              </div>
            </div>
          </div>
        </a>
      `;
    });

    listContainer.innerHTML = html;
  } catch (err) {
    listContainer.innerHTML = `<p class="empty-message" style="color:red;">Lỗi kết nối Server!</p>`;
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadFollowingStories();
});
