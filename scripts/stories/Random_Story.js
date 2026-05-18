// ================= 3. HÀM GACHA (BỐC TRUYỆN NGẪU NHIÊN) =================
function loadRandomStory() {
  const container = document.getElementById("random-story-container");
  if (!container) return; // Nếu trang hiện tại không có khu vực ngẫu nhiên thì bỏ qua

  // Nếu kho dữ liệu trống thì báo lỗi
  if (typeof mockStories === "undefined" || mockStories.length === 0) {
    container.innerHTML = `<p style="color: red;">Chưa có dữ liệu truyện.</p>`;
    return;
  }

  // 1. Tạo ra 1 con số ngẫu nhiên từ 0 đến (tổng số truyện - 1)
  const randomIndex = Math.floor(Math.random() * mockStories.length);

  // 2. Lôi cuốn truyện ở vị trí ngẫu nhiên đó ra
  const story = mockStories[randomIndex];

  // 3. Tính toán đường dẫn trỏ về trang đọc (dùng lại hàm có sẵn)
  const detailHref =
    typeof getStoryDetailHref === "function"
      ? getStoryDetailHref(story.id)
      : ToriRoutes.href("storyDetail", { id: story.id });

  // 4. Vẽ lại cái thẻ truyện y hệt như bên phần Truyện Nổi Bật
  // Tôi ép style width: 100% để nó nở to ra cho vừa cái cột bên phải
  container.innerHTML = `
    <a href="${detailHref}" class="story-card" style="text-decoration: none; display: block; width: 80%; margin: 0 auto; transform: none;">
      <img src="${story.coverUrl}" alt="Bìa truyện ${story.title}" style="width: 100%; height: auto; border-radius: 6px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
      <div class="story-info" style="padding-top: 15px; text-align: center;">
        <h3 class="story-title" style="font-size: 16px; margin-bottom: 5px; white-space: normal;">${story.title}</h3>
        <p class="story-author" style="font-size: 13px; color: gray;">Tác giả: ${story.author}</p>
      </div>
    </a>
  `;
}

// Bổ sung lệnh gọi hàm loadRandomStory vào sự kiện load trang (Tìm dòng có DOMContentLoaded ở cuối file và thêm vào)
document.addEventListener("DOMContentLoaded", () => {
  if (typeof renderStories === "function") renderStories(mockStories);
  if (typeof loadStoryDetail === "function") loadStoryDetail();

  // Gọi hàm bốc truyện lần đầu tiên khi web vừa tải xong
  loadRandomStory();
});
