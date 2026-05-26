// Biến dùng chung để chứa dữ liệu từ Backend
let currentStories = [];

// === PHẦN 1: KẾT NỐI MONGODB LẤY DỮ LIỆU ===
async function fetchStoriesFromDatabase() {
  try {
    const response = await fetch("http://localhost:5000/api/stories?limit=100");
    if (!response.ok) throw new Error("Không thể tải danh sách truyện");

    const responseData = await response.json();
    currentStories = Array.isArray(responseData) ? responseData : responseData.data;

    // Lấy dữ liệu xong thì gọi hàm vẽ giao diện luôn
    renderCarousel(currentStories);
    renderUpdateList(1);
    loadRandomStory(); // <--- CHỈ CẦN THÊM DÒNG NÀY VÀO ĐÂY
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
  }
}

// === PHẦN 2: VẼ KHU VỰC "TRUYỆN NỔI BẬT" (CAROUSEL) ===
function renderCarousel(storiesArray) {
  const container = document.getElementById("story-list-container");
  if (!container) return;

  let htmlContent = "";
  for (let i = 0; i < storiesArray.length; i++) {
    const story = storiesArray[i];
    const detailHref =
      typeof getStoryDetailHref === "function"
        ? getStoryDetailHref(story._id)
        : ToriRoutes.href("storyDetail", { id: story._id });

    htmlContent += `
      <a href="${detailHref}" onclick="window.location.href='${detailHref}'" class="atropos atropos-card-${story._id}" style="text-decoration: none; display: flex; flex-direction: column; height: 100%; cursor: pointer;">
        <div class="atropos-scale">
          <div class="atropos-rotate">
            <div class="atropos-inner">
              <div class="story-card" style="text-decoration: none; display: flex; flex-direction: column; height: 100%;">
                <img src="${story.coverImg}" alt="Bìa ${story.title}" data-atropos-offset="-5">
                <div class="story-info" data-atropos-offset="5" style="flex: 1;">
                  <h3 class="story-title">${story.title}</h3>
                  <p class="story-author">Tác giả: ${story.author}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a>
      `;
  }
  container.innerHTML = htmlContent;

  // Initialize Atropos for all cards
  if (typeof Atropos !== 'undefined') {
    storiesArray.forEach(story => {
      Atropos({
        el: `.atropos-card-${story._id}`,
        activeOffset: 40,
        shadow: false,
        highlight: false
      });
    });
  }
}

// === PHẦN 3: VẼ KHU VỰC "MỚI CẬP NHẬT" CÓ PHÂN TRANG ===
const itemsPerPage = 10;
let currentListPage = 1;

function renderUpdateList(page) {
  const container = document.getElementById("new-updates-container");
  if (!container) return;

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToShow = currentStories.slice(startIndex, endIndex); // Lấy từ biến tổng

  let html = "";
  for (let i = 0; i < itemsToShow.length; i++) {
    const story = itemsToShow[i];
    const detailHref =
      typeof getStoryDetailHref === "function"
        ? getStoryDetailHref(story._id)
        : ToriRoutes.href("storyDetail", { id: story._id });

    html += `
          <a href="${detailHref}" onclick="window.location.href='${detailHref}'" class="atropos atropos-update-${story._id}" style="text-decoration: none; display: block; width: 100%; cursor: pointer;">
            <div class="atropos-scale">
              <div class="atropos-rotate">
                <div class="atropos-inner">
                  <div class="update-item" style="background: transparent;">
                      <div class="update-cover">
                          <img src="${story.coverImg}" alt="Bìa" data-atropos-offset="-2">
                      </div>
                      <div class="update-info" data-atropos-offset="2">
                          <div class="update-title">${story.title}</div>
                          <div class="update-meta">
                              <span>Tác giả: <strong>${story.author}</strong></span>
                              <span>Trạng thái: <strong>${story.status}</strong></span>
                          </div>
                          <div class="update-desc">${story.description || "Chưa có mô tả."}</div>
                          <div class="update-chapter">Chương mới nhất</div>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
        `;
  }
  container.innerHTML = html;
  
  if (typeof Atropos !== 'undefined') {
    itemsToShow.forEach(story => {
      Atropos({
        el: `.atropos-update-${story._id}`,
        activeOffset: 20,
        shadow: false,
        highlight: false
      });
    });
  }

  renderPagination();
}

function renderPagination() {
  const container = document.getElementById("pagination-container");
  if (!container) return;
  const totalPages = Math.ceil(currentStories.length / itemsPerPage);

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = `<span onclick="changeListPage(1)" style="color: #2b70a1; font-size: 13px; font-weight: bold; margin-right: 10px; cursor: pointer;">Đầu</span>`;
  for (let i = 1; i <= totalPages; i++) {
    const isActive = i === currentListPage ? "active" : "";
    html += `<button class="page-btn ${isActive}" onclick="changeListPage(${i})">${i}</button>`;
  }
  html += `<span onclick="changeListPage(${totalPages})" style="color: #2b70a1; font-size: 13px; font-weight: bold; margin-left: 10px; cursor: pointer;">Cuối</span>`;
  container.innerHTML = html;
}

function changeListPage(page) {
  currentListPage = page;
  renderUpdateList(page);
}

// === KÍCH HOẠT QUÁ TRÌNH ===
document.addEventListener("DOMContentLoaded", () => {
  fetchStoriesFromDatabase();
});
