let currentPage = 1;
let currentLimit = 12;
let currentSort = "newest";

async function loadSelfWrittenStories() {
  const container = document.getElementById("story-list-container");
  if (container) container.innerHTML = "<p>Đang tải danh sách truyện sáng tác...</p>";

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    currentSort = sortSelect.value;
  }

  let queryParams = new URLSearchParams();
  queryParams.append("page", currentPage);
  queryParams.append("limit", currentLimit);
  queryParams.append("genres", "Tori Xuất bản"); // Lọc riêng tag Tori Xuất bản
  
  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (currentUser && currentUser.role) {
    queryParams.append("role", currentUser.role);
  }
  
  if (currentSort && currentSort !== "default") {
    queryParams.append("sort", currentSort);
  }

  try {
    const API_URL = "http://localhost:5000/api";
    const res = await fetch(`${API_URL}/stories?${queryParams.toString()}`);
    if (!res.ok) throw new Error("Lỗi tải dữ liệu truyện sáng tác");

    const responseData = await res.json();
    const stories = Array.isArray(responseData) ? responseData : responseData.data;
    const totalPages = responseData.totalPages || 1;

    renderStories(stories);
    renderPagination(totalPages);
  } catch (error) {
    console.error("Lỗi:", error);
    if (container) container.innerHTML = `<p style="color:red;">Lỗi tải dữ liệu: ${error.message}</p>`;
  }
}

function sortStories(order) {
    currentSort = order;
    currentPage = 1;
    loadSelfWrittenStories();
}

function renderPagination(totalPages) {
  let paginationContainer = document.getElementById("pagination-container");
  if (!paginationContainer) {
    const listContainer = document.getElementById("story-list-container");
    if (!listContainer) return;
    
    paginationContainer = document.createElement("div");
    paginationContainer.id = "pagination-container";
    paginationContainer.className = "pagination";
    paginationContainer.style.marginTop = "30px";
    
    listContainer.parentNode.insertBefore(paginationContainer, listContainer.nextSibling);
  }

  paginationContainer.innerHTML = "";

  if (totalPages <= 1) return;

  // Nút Prev
  const prevBtn = document.createElement("button");
  prevBtn.className = "btn btn-outline-primary";
  prevBtn.innerText = "« Trước";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      loadSelfWrittenStories();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  paginationContainer.appendChild(prevBtn);

  // Số trang
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.className = `btn ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'}`;
    pageBtn.innerText = i;
    pageBtn.onclick = () => {
      if (currentPage !== i) {
        currentPage = i;
        loadSelfWrittenStories();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    paginationContainer.appendChild(pageBtn);
  }

  // Nút Next
  const nextBtn = document.createElement("button");
  nextBtn.className = "btn btn-outline-primary";
  nextBtn.innerText = "Sau »";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadSelfWrittenStories();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  paginationContainer.appendChild(nextBtn);
}

function renderStories(storiesArray) {
  const container = document.getElementById("story-list-container");
  if (!container) return;

  if (storiesArray.length === 0) {
    container.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: #888; font-style: italic; padding: 30px; background: #fff; border-radius: 8px;">Hiện tại chưa có truyện sáng tác nào mang nhãn "Tori Xuất bản".</p>`;
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
      <div class="atropos atropos-self-${story._id}" style="width: 100%; height: 100%; cursor: pointer;" onclick="window.location.href='${detailHref}'">
        <div class="atropos-scale">
          <div class="atropos-rotate">
            <div class="atropos-inner">
              <a href="${detailHref}" class="story-card" style="text-decoration: none; display: flex; flex-direction: column; height: 100%; position: relative;">
                ${premiumBadge}
                <img src="${story.coverImg}" alt="Bìa ${story.title}" data-atropos-offset="-5">
                <div class="story-info" data-atropos-offset="5" style="flex: 1;">
                  <h3 class="story-title">${story.title}</h3>
                  <p class="story-author">Tác giả: ${story.author}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      `;
  }
  container.innerHTML = htmlContent;

  if (typeof Atropos !== 'undefined') {
    storiesArray.forEach(story => {
      Atropos({
        el: `.atropos-self-${story._id}`,
        activeOffset: 40,
        shadow: false,
        highlight: false
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadSelfWrittenStories();
});
