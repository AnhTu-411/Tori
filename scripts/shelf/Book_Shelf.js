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
  }
}

//truyện theo dõi
function loadFollowingStories() {
  const grid = document.getElementById("following-grid");
  if (!grid) return;

  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (!currentUser) {
    grid.innerHTML = `<p class="empty-message">Vui lòng đăng nhập để xem Tủ sách cá nhân.</p>`;
    return;
  }

  //Đọc đúng kho truyện theo dõi của user
  let userSuffix = "_" + currentUser.username;
  let favList =
    JSON.parse(localStorage.getItem("tori_favorites" + userSuffix)) || [];

  if (favList.length === 0) {
    grid.innerHTML = `<p class="empty-message">Bạn chưa theo dõi bộ truyện nào.</p>`;
    return;
  }

  if (typeof mockStories === "undefined") {
    grid.innerHTML = `<p class="empty-message" style="color:red;">Lỗi: Không tìm thấy Cơ sở dữ liệu!</p>`;
    return;
  }

  let html = "";
  favList.forEach((storyId) => {
    const story = mockStories.find((s) => s.id === storyId);
    if (story) {
      const detailHref =
        typeof getStoryDetailHref === "function"
          ? getStoryDetailHref(story.id)
          : `../stories/Story_Detail.html?id=${story.id}`;

      html += `
        <a href="${detailHref}" class="story-card" style="text-decoration: none; display: block;">
          <img src="${story.coverUrl}" alt="Bìa truyện ${story.title}">
          <div class="story-info">
            <h3 class="story-title">${story.title}</h3>
            <p class="story-author">Tác giả: ${story.author}</p>
          </div>
        </a>
      `;
    }
  });
  grid.innerHTML = html;
}

//lịch sử mua
function loadPurchasedHistory() {
  const listContainer = document.getElementById("purchased-list");
  if (!listContainer) return;

  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (!currentUser) {
    listContainer.innerHTML = `<p class="empty-message">Vui lòng đăng nhập để xem lịch sử mua hàng.</p>`;
    return;
  }

  // Đọc đúng kho truyện đã mua của user
  let userSuffix = "_" + currentUser.username;
  let purchasedList =
    JSON.parse(localStorage.getItem("tori_purchased" + userSuffix)) || [];

  if (purchasedList.length === 0) {
    listContainer.innerHTML = `<p class="empty-message">Bạn chưa mua nội dung trả phí nào.</p>`;
    return;
  }

  let html = "";
  purchasedList.forEach((item) => {
    const detailHref =
      typeof getStoryDetailHref === "function"
        ? getStoryDetailHref(item.storyId)
        : `../stories/Story_Detail.html?id=${item.storyId}`;

    html += `
      <a href="${detailHref}" style="text-decoration: none; display: block;">
        <div class="update-item" style="align-items: center;">
          <div class="update-cover" style="height: 90px; width: 65px; min-width: 65px;">
            <img src="${item.cover}" alt="Bìa">
          </div>
          <div class="update-info">
            <div class="update-title" style="font-size: 16px; color: #000080;">${item.title}</div>
            <div class="update-desc" style="margin-bottom: 5px;">Tập đã mở khóa: <strong>${item.volName}</strong></div>
            <div class="update-meta" style="margin-bottom: 0;">
                <span style="color: green; font-weight: bold;">💳 Đã thanh toán: ${item.price} Coin</span>
            </div>
          </div>
        </div>
      </a>
    `;
  });

  listContainer.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {
  loadFollowingStories();
});
