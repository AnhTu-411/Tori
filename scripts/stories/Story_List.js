let currentStories = [];

async function loadStoriesWithFilters() {
  const container = document.getElementById("story-list-container");
  if (container) container.innerHTML = "<p>Đang tải danh sách truyện...</p>";

  const titleInput = document.getElementById("filter-title");
  const statusSelect = document.getElementById("filter-status");
  const yearSelect = document.getElementById("filter-year");
  const genreCheckboxes = document.querySelectorAll('input[name="genres"]:checked');

  let queryParams = new URLSearchParams();

  if (titleInput && titleInput.value.trim()) {
    queryParams.append("title", titleInput.value.trim());
  }

  if (statusSelect && statusSelect.value && statusSelect.value !== "Tất cả") {
    queryParams.append("status", statusSelect.value);
  }

  if (yearSelect && yearSelect.value && yearSelect.value !== "Tất cả") {
    queryParams.append("year", yearSelect.value);
  }

  if (genreCheckboxes.length > 0) {
    const genres = Array.from(genreCheckboxes).map(cb => cb.value).join(",");
    queryParams.append("genres", genres);
  }

  // Get User Role to pass to API
  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (currentUser && currentUser.role) {
    queryParams.append("role", currentUser.role);
  }

  try {
    const API_URL = "http://localhost:5000/api";
    const res = await fetch(`${API_URL}/stories?${queryParams.toString()}`);
    if (!res.ok) throw new Error("Lỗi tải dữ liệu truyện");

    currentStories = await res.json();
    renderStories(currentStories);

  } catch (error) {
    console.error("Lỗi:", error);
    if (container) container.innerHTML = `<p style="color:red;">Lỗi tải dữ liệu: ${error.message}</p>`;
  }
}

function renderStories(storiesArray) {
  const container = document.getElementById("story-list-container");
  if (!container) return;

  if (storiesArray.length === 0) {
    container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #888; font-style: italic; padding: 20px;">Không tìm thấy bộ truyện nào phù hợp với bộ lọc.</p>`;
    return;
  }

  let htmlContent = "";
  for (let i = 0; i < storiesArray.length; i++) {
    const story = storiesArray[i];
    const detailHref = typeof ToriRoutes !== 'undefined' 
      ? ToriRoutes.href("storyDetail", { id: story._id }) 
      : `Story_Detail.html?id=${story._id}`;

    let premiumBadge = story.isPremium ? `<span class="tag-badge" style="position:absolute; top:5px; right:5px; background: #ffd700; color:#000; font-size:10px; font-weight:bold; padding:2px 5px; border-radius:3px;">Trả phí</span>` : "";

    htmlContent += `
      <a href="${detailHref}" class="story-card" style="text-decoration: none; display: block; position: relative;">
        ${premiumBadge}
        <img src="${story.coverImg}" alt="Bìa ${story.title}">
        <div class="story-info">
          <h3 class="story-title">${story.title}</h3>
          <p class="story-author">Tác giả: ${story.author}</p>
        </div>
      </a>
      `;
  }
  container.innerHTML = htmlContent;
}

// Hook up events
document.addEventListener("DOMContentLoaded", () => {
  // Check if there is a search query from Navbar
  const urlParams = new URLSearchParams(window.location.search);
  const initialTitle = urlParams.get("title");
  
  if (initialTitle) {
    const titleInput = document.getElementById("filter-title");
    if (titleInput) titleInput.value = initialTitle;
  }

  // Bind filter button
  const applyBtn = document.getElementById("btn-apply-filter");
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      loadStoriesWithFilters();
    });
  }

  // Load initially
  loadStoriesWithFilters();
});
