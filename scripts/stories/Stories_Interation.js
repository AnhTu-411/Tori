// =================== HÀM VẼ CHI TIẾT TRUYỆN ===================
async function loadStoryDetail() {
  const detailContainer = document.getElementById("story-detail-container");
  if (!detailContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const storyId = urlParams.get("id");

  if (!storyId) {
    detailContainer.innerHTML = `<h2 style="text-align: center; color: red;">Không tìm thấy truyện!</h2>`;
    return;
  }

  try {
    const API_URL = "http://localhost:5000/api";
    // 1. Fetch Story Detail
    const storyRes = await fetch(`${API_URL}/stories/${storyId}`);
    if (!storyRes.ok) throw new Error("Story not found");
    const story = await storyRes.json();

    // 2. Fetch Chapters
    const chaptersRes = await fetch(`${API_URL}/stories/${storyId}/chapters`);
    const chapters = await chaptersRes.json();

    document.title = story.title + " - Tori Lightnovel";

    let tagsHtml = "";
    if (story.isPremium) {
      tagsHtml += `<span class="tag-badge" style="background: #ffd700; color: #000; font-weight: bold; border: 1px solid #cca300;">Truyện Thu Phí (${story.price} Coin)</span>`;
    }
    if (story.genres && story.genres.length > 0) {
      for (let i = 0; i < story.genres.length; i++) {
        tagsHtml += `<span class="tag-badge">${story.genres[i]}</span>`;
      }
    }

    let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
    let isAdmin = currentUser && currentUser.role === "admin";
    let unlockedChapters = [];

    // Tải thông tin user (để biết đã mở khoá chương nào)
    if (currentUser && !isAdmin) {
      try {
        const infoRes = await fetch(`${API_URL}/users/${currentUser.username}/info`);
        if (infoRes.ok) {
          const info = await infoRes.json();
          unlockedChapters = info.unlockedChapters || [];
        }
      } catch (err) {}
    }

    let chaptersHtml = "";
    if (chapters && chapters.length > 0) {
      for (let j = 0; j < chapters.length; j++) {
        const chap = chapters[j];
        const iconHtml = chap.imageLinks && chap.imageLinks.length > 0 ? `🖼️ ` : `📄 `;
        
        let canRead = false;
        let chapPrice = chap.price || 0;
        
        // Nếu chương miễn phí, hoặc admin, hoặc đã mua -> Được đọc
        if (chapPrice === 0 || isAdmin || unlockedChapters.includes(chap._id)) {
          canRead = true;
        }
        
        // Kiểm tra xem truyện gốc có free không (hỗ trợ truyện cũ)
        if (!story.isPremium) {
           canRead = true;
        }

        if (canRead) {
          chaptersHtml += `
            <div class="chap-row" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
              <div class="chap-left">
                <a href="${ToriRoutes.href("reading", { storyId: story._id, chapterId: chap._id })}" style="color: #333; text-decoration: none;">${iconHtml} Chương ${chap.chapterNumber}: ${chap.title}</a>
              </div>
              <div class="chap-right" style="color: #888; font-size: 12px;">${new Date(chap.createdAt).toLocaleDateString("vi-VN")}</div>
            </div>
          `;
        } else {
           chaptersHtml += `
            <div class="chap-row" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee; background: #fdfdfd;">
              <div class="chap-left" style="opacity: 0.6;">
                <span style="cursor: not-allowed; color: #555;">${iconHtml} Chương ${chap.chapterNumber}: ${chap.title} 🔒</span>
              </div>
              <div class="chap-right" style="display: flex; gap: 10px; align-items: center;">
                <span style="color: #d35400; font-weight: bold;">${chapPrice} Coin</span>
                <button onclick="addToCart('${chap._id}')" class="button-general" style="padding: 5px 10px; font-size: 12px;">🛒 Thêm vào giỏ</button>
              </div>
            </div>
          `;
        }
      }
    } else {
        chaptersHtml = "<p style='padding: 15px;'>Chưa có chương nào.</p>";
    }

    let volumesHtml = `
        <div class="vol-box">
          <div class="vol-header" style="border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 15px;">
            <h3>Danh sách chương</h3>
          </div>
          <div class="vol-body">
            <div class="vol-chap-list" style="width: 100%; border: 1px solid #eee; border-radius: 5px; overflow: hidden;">
              ${chaptersHtml}
            </div>
          </div>
        </div>
      `;

    const htmlContent = `
      <div class="story-detail-header">
        <div class="detail-cover">
          <img src="${story.coverImg || 'https://via.placeholder.com/200x280?text=No+Cover'}" alt="Bìa truyện">
        </div>
        <div class="detail-info">
          <h1 class="detail-title">${story.title}</h1>
          <div class="detail-tags">${tagsHtml}</div>
          <p class="detail-meta"><strong>Tác giả:</strong> ${story.author}</p>
          <p class="detail-meta"><strong>Năm xuất bản:</strong> ${(story.publishedDate ? new Date(story.publishedDate) : new Date(story.createdAt)).getFullYear()}</p>
          <p class="detail-meta"><strong>Tình trạng:</strong> ${story.status || "Đang tiến hành"}</p>
          
          <!-- Đã loại bỏ nút mua nguyên bộ -->

          <div class="detail-actions" style="margin-top: 20px;">
            <div class="action-item" onclick="toggleFavorite('${story._id}')" style="cursor: pointer;"><span id="fav-icon-${story._id}">♡</span><p>Thích</p></div>
            <div class="action-item" onclick="toggleFollowing('${story._id}')" style="cursor: pointer;"><span id="follow-icon-${story._id}" style="color: inherit;">☆</span><p>Theo dõi</p></div>
            <div class="action-item" onclick="document.querySelector('.vol-box').scrollIntoView({behavior: 'smooth'})" style="cursor: pointer;"><span>☰</span><p>Đọc ngay</p></div>
          </div>
          <div class="detail-stats">
            <div><p>Số từ</p><strong>N/A</strong></div>
            <div><p>Đánh giá</p><strong>0 / 0</strong></div>
            <div><p>Lượt xem</p><strong>0</strong></div>
          </div>
        </div>
      </div>

      <div class="story-summary-box">
        <h3>Tóm tắt</h3>
        <p>${story.description || "Chưa có tóm tắt cho truyện này."}</p>
      </div>

      <div style="margin-top: 40px;">
          ${volumesHtml}
      </div>
    `;

    detailContainer.innerHTML = htmlContent;
    checkFavoriteStatus(story._id);
    checkFollowingStatus(story._id);
    
    // Tải bình luận
    fetchStoryComments(story._id);

  } catch (err) {
      detailContainer.innerHTML = `<h2 style="text-align: center; color: red;">Lỗi khi tải chi tiết truyện!</h2>`;
      console.error(err);
  }
}

async function addToCart(chapterId) {
  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (!currentUser) {
    alert("Vui lòng đăng nhập để thêm vào giỏ hàng!");
    window.location.href = typeof ToriRoutes !== "undefined" ? ToriRoutes.href("login") : "../auth/Login.html";
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/users/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: currentUser.username,
        chapterId: chapterId
      })
    });

    const data = await response.json();
    if (response.ok) {
      alert("✅ Đã thêm vào giỏ hàng thành công!");
      if (typeof checkCartCount === "function") {
        checkCartCount(); // Cập nhật lại số trên Header
      }
    } else {
      alert("⚠️ " + data.message);
    }
  } catch (err) {
    alert("Lỗi kết nối tới máy chủ!");
    console.error(err);
  }
}

async function toggleFavorite(storyId) {
  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (!currentUser) {
    alert("Vui lòng đăng nhập để thích truyện!");
    return;
  }

  try {
    const API_URL = "http://localhost:5000/api";
    const response = await fetch(`${API_URL}/users/${currentUser.username}/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId })
    });
    
    if (response.ok) {
      const data = await response.json();
      const isFav = data.favorites.includes(storyId);
      let icon = document.getElementById(`fav-icon-${storyId}`);
      if (icon) {
        if (isFav) {
          icon.innerText = "♥";
          icon.style.color = "red";
        } else {
          icon.innerText = "♡";
          icon.style.color = "inherit";
        }
      }
    }
  } catch (error) {
    console.error("Lỗi khi thích truyện", error);
  }
}

async function checkFavoriteStatus(storyId) {
  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (!currentUser) return;

  try {
    const API_URL = "http://localhost:5000/api";
    const response = await fetch(`${API_URL}/users/${currentUser.username}/favorites`);
    if (response.ok) {
      const favorites = await response.json();
      const isFav = favorites.some(fav => (typeof fav === 'string' ? fav : fav._id) === storyId);
      if (isFav) {
        let icon = document.getElementById(`fav-icon-${storyId}`);
        if (icon) {
          icon.innerText = "♥";
          icon.style.color = "red";
        }
      }
    }
  } catch (error) {
    console.error("Lỗi kiểm tra yêu thích", error);
  }
}

async function toggleFollowing(storyId) {
  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (!currentUser) {
    alert("Vui lòng đăng nhập để theo dõi truyện!");
    return;
  }

  try {
    const API_URL = "http://localhost:5000/api";
    const response = await fetch(`${API_URL}/users/${currentUser.username}/following`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId })
    });
    
    if (response.ok) {
      const data = await response.json();
      const isFollow = data.followedStories.includes(storyId);
      let icon = document.getElementById(`follow-icon-${storyId}`);
      if (icon) {
        if (isFollow) {
          icon.innerText = "★";
          icon.style.color = "gold";
        } else {
          icon.innerText = "☆";
          icon.style.color = "inherit";
        }
      }
    }
  } catch (error) {
    console.error("Lỗi khi theo dõi truyện", error);
  }
}

// =================== LOGIC TẢI BÌNH LUẬN TRUYỆN ===================

async function fetchStoryComments(storyId) {
  const commentsList = document.getElementById("story-comments-list");
  if (!commentsList) return;

  try {
    const API_URL = "http://localhost:5000/api";
    const response = await fetch(`${API_URL}/stories/${storyId}/comments`);
    if (!response.ok) throw new Error("Lỗi tải bình luận");
    const comments = await response.json();

    if (comments.length === 0) {
      commentsList.innerHTML = `<p style="text-align: center; color: #888;">Chưa có bình luận nào cho bộ truyện này.</p>`;
      return;
    }

    let html = "";
    comments.forEach(c => {
      const dateStr = new Date(c.createdAt).toLocaleString("vi-VN");
      const chapterTitle = c.chapter ? `Chương ${c.chapter.chapterNumber}: ${c.chapter.title}` : "Chương không xác định";
      html += `
        <div style="background: #fdfdfd; padding: 15px; border-radius: 8px; border: 1px solid #eee; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <div>
              <strong style="color: #e67e22;">${c.user ? c.user.username : 'Ẩn danh'}</strong>
              <span style="font-size: 13px; color: #7f8c8d; margin-left: 10px; background: #ecf0f1; padding: 2px 6px; border-radius: 4px;">Tại ${chapterTitle}</span>
            </div>
            <span style="font-size: 12px; color: #95a5a6;">${dateStr}</span>
          </div>
          <p style="margin-top: 8px; line-height: 1.5; color: #2c3e50;">${c.content}</p>
        </div>
      `;
    });
    commentsList.innerHTML = html;
  } catch (error) {
    console.error("Lỗi:", error);
    commentsList.innerHTML = `<p style="text-align: center; color: red;">Lỗi tải bình luận.</p>`;
  }
}

async function checkFollowingStatus(storyId) {
  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (!currentUser) return;

  try {
    const API_URL = "http://localhost:5000/api";
    const response = await fetch(`${API_URL}/users/${currentUser.username}/following`);
    if (response.ok) {
      const followed = await response.json();
      const isFollow = followed.some(f => (typeof f === 'string' ? f : f._id) === storyId);
      if (isFollow) {
        let icon = document.getElementById(`follow-icon-${storyId}`);
        if (icon) {
          icon.innerText = "★";
          icon.style.color = "gold";
        }
      }
    }
  } catch (error) {
    console.error("Lỗi kiểm tra theo dõi", error);
  }
}

// CHÍNH LÀ ĐOẠN NÀY ĐỂ FIX MÀN HÌNH BỊ TRẮNG!
// Tự động gọi hàm loadStoryDetail ngay khi trang web đã tải xong HTML
document.addEventListener("DOMContentLoaded", () => {
  loadStoryDetail();
});
