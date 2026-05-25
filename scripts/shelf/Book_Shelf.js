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
  } else if (tabName === "bookmark") {
    loadBookmarks();
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
        <div class="atropos atropos-fav-${story._id}" style="width: 100%; height: 100%;">
          <div class="atropos-scale">
            <div class="atropos-rotate">
              <div class="atropos-inner">
                <a href="${detailHref}" class="story-card" style="text-decoration: none; display: flex; flex-direction: column; height: 100%;">
                  <img src="${story.coverImg || 'https://via.placeholder.com/200x280?text=No+Cover'}" alt="Bìa truyện ${story.title}" data-atropos-offset="-5">
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
    });
    grid.innerHTML = html;

    if (typeof Atropos !== 'undefined') {
      favList.forEach(story => {
        Atropos({
          el: `.atropos-fav-${story._id}`,
          activeOffset: 40,
          shadow: false,
          highlight: false
        });
      });
    }
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

      let newChapterHtml = "";
      if (story.latestChapter) {
        const timeStr = new Date(story.latestChapter.createdAt).toLocaleString("vi-VN");
        newChapterHtml = `
          <div style="margin-top: 8px; font-size: 13px; color: #e74c3c; font-weight: bold;">
            🔥 Mới: Chương ${story.latestChapter.chapterNumber}
          </div>
          <div style="font-size: 12px; color: #7f8c8d;">Cập nhật: ${timeStr}</div>
        `;
      }

      html += `
        <div class="atropos atropos-following-${story._id}" style="width: 100%; height: 100%;">
          <div class="atropos-scale">
            <div class="atropos-rotate">
              <div class="atropos-inner">
                <a href="${detailHref}" class="story-card" style="text-decoration: none; display: flex; flex-direction: column; height: 100%; position: relative;">
                  <img src="${story.coverImg || 'https://via.placeholder.com/200x280?text=No+Cover'}" alt="Bìa truyện ${story.title}" data-atropos-offset="-5">
                  <div class="story-info" data-atropos-offset="5" style="flex: 1;">
                    <h3 class="story-title">${story.title}</h3>
                    <p class="story-author">Tác giả: ${story.author}</p>
                    ${newChapterHtml}
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    grid.innerHTML = html;

    if (typeof Atropos !== 'undefined') {
      favList.forEach(story => {
        Atropos({
          el: `.atropos-following-${story._id}`,
          activeOffset: 40,
          shadow: false,
          highlight: false
        });
      });
    }
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
      let story = tx.story;
      let isFullStory = true;
      let chapterInfoText = "Toàn bộ truyện";
      
      if (!story && tx.chapters && tx.chapters.length > 0) {
        // Mua chapter lẻ (từ giỏ hàng)
        story = tx.chapters[0].storyId;
        isFullStory = false;
        if (tx.chapters.length === 1) {
          chapterInfoText = `1 Chương`;
        } else {
          chapterInfoText = `${tx.chapters.length} Chương`;
        }
      }

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
              <div class="update-desc" style="margin-bottom: 5px;">Mở khóa: <strong>${chapterInfoText}</strong></div>
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

// Load Dấu trang (Bookmark) từ server hoặc localStorage
async function loadBookmarks() {
  const list = document.getElementById("bookmark-list");
  if (!list) return;

  let bookmarks = [];
  const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  const API_URL = "http://localhost:5000/api";

  list.innerHTML = `<p style="text-align: center; color: #7f8c8d;">Đang tải thông tin truyện...</p>`;

  if (currentUser) {
    try {
      const response = await fetch(`${API_URL}/users/${currentUser.username}/bookmarks`);
      if (response.ok) {
        bookmarks = await response.json();
      }
    } catch (e) {
      console.error("Lỗi lấy dấu trang từ server", e);
    }
  } else {
    bookmarks = JSON.parse(localStorage.getItem("tori_bookmarks")) || [];
  }
  
  if (bookmarks.length === 0) {
    list.innerHTML = `<p class="empty-message">Bạn chưa lưu dấu trang nào.</p>`;
    return;
  }
  
  let html = "";
  for (const b of bookmarks) {
    try {
      let coverImg = "https://via.placeholder.com/200x280?text=No+Cover";
      let storyTitle = "Truyện không xác định";
      let sId = b.storyId;

      // Nếu b.storyId là một object (do populate từ server)
      if (typeof b.storyId === 'object' && b.storyId !== null) {
        sId = b.storyId._id;
        coverImg = b.storyId.coverImg || coverImg;
        storyTitle = b.storyId.title || storyTitle;
      } else {
        // Fallback: Tự fetch (khi dùng localStorage offline)
        const response = await fetch(`${API_URL}/stories/${sId}`);
        if (response.ok) {
          const story = await response.json();
          coverImg = story.coverImg || coverImg;
          storyTitle = story.title || storyTitle;
        }
      }

      const readHref = ToriRoutes.href("reading", { storyId: sId, chapterId: b.chapterId });
      const dateStr = new Date(b.date).toLocaleString("vi-VN");

      html += `
        <div class="update-item" style="display: flex; gap: 15px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
          <img src="${coverImg}" alt="${storyTitle}" style="width: 80px; height: 110px; object-fit: cover; border-radius: 4px;">
          <div style="flex: 1;">
            <h3 style="margin-bottom: 5px;">${storyTitle}</h3>
            <p style="color: #1abc9c; font-weight: bold; margin-bottom: 5px;">${b.chapterTitle}</p>
            <p style="color: #7f8c8d; font-size: 13px;">Lưu lúc: ${dateStr}</p>
            <a href="${readHref}" class="btn" style="display: inline-block; background-color: #3498db; color: white; padding: 5px 15px; border-radius: 4px; text-decoration: none; margin-top: 10px;">Đọc tiếp</a>
          </div>
        </div>
      `;
    } catch (e) {
      console.error("Lỗi lấy thông tin truyện cho bookmark", e);
    }
  }
  
  list.innerHTML = html;
}
