// 1. Logic Đổi Đèn Đọc Truyện (Giữ nguyên của bạn)
function toggleReadTheme() {
  const body = document.getElementById("reading-body");
  body.classList.toggle("dark-reading");
}

// 2. LOGIC ĐỌC DỮ LIỆU ĐỘNG TỪ URL
function loadReadingContent() {
  // Lấy các tham số trên link về (Ví dụ: ?storyId=1&vol=0&chap=1)
  const urlParams = new URLSearchParams(window.location.search);
  const storyId = parseInt(urlParams.get("storyId"));
  const volIndex = parseInt(urlParams.get("vol"));
  const chapIndex = parseInt(urlParams.get("chap"));

  // Nếu thiếu tham số thì không chạy tiếp
  if (isNaN(storyId) || isNaN(volIndex) || isNaN(chapIndex)) return;

  // Tìm truyện tương ứng trong mockStories (Được lấy từ file Fake_DataBase.js)
  const story = mockStories.find((s) => s.id === storyId);
  if (
    !story ||
    !story.volumes[volIndex] ||
    !story.volumes[volIndex].chapters[chapIndex]
  ) {
    document.getElementById("read-content-box").innerHTML =
      "<h2>Không tìm thấy nội dung chương truyện này!</h2>";
    return;
  }

  const vol = story.volumes[volIndex];
  const chap = vol.chapters[chapIndex];

  // Thay đổi tiêu đề tab trình duyệt và các tiêu đề trên giao diện
  document.title = `${story.title} - ${chap.title}`;
  document.getElementById("read-vol-title").innerText = vol.volTitle;
  document.getElementById("read-chap-title").innerText = chap.title;
  document.getElementById("read-chap-meta").innerText =
    `Độ dài ước tính từ mảng - Cập nhật: ${chap.date}`;

  // Lặp qua mảng content để vẽ các thẻ <p> nội dung truyện
  let contentHtml = "";
  if (chap.content && chap.content.length > 0) {
    for (let i = 0; i < chap.content.length; i++) {
      contentHtml += `<p>${chap.content[i]}</p>`;
    }
  } else {
    contentHtml =
      "<p style='text-align:center; color:#888;'>Chương này hiện chưa có nội dung chữ mẫu.</p>";
  }
  document.getElementById("read-content-box").innerHTML = contentHtml;

  // Tự động xử lý link cho thanh điều hướng cuối trang (Bấm sang chương tiếp theo)
  const navBox = document.getElementById("reading-nav-box");

  const hasPrev = chapIndex > 0;
  const hasNext = chapIndex < vol.chapters.length - 1;

  navBox.innerHTML = `
          ${hasPrev ? `<a href="Reading.html?storyId=${storyId}&vol=${volIndex}&chap=${chapIndex - 1}" class="nav-btn">❮❮ Trước</a>` : `<span class="nav-btn" style="color:#aaa; cursor:not-allowed;">❮❮ Trước</span>`}
          <a href="Story_Detail.html?id=${storyId}" class="nav-btn">🏠︎ Mục lục</a>
          ${hasNext ? `<a href="Reading.html?storyId=${storyId}&vol=${volIndex}&chap=${chapIndex + 1}" class="nav-btn">Tiếp ❯❯</a>` : `<span class="nav-btn" style="color:#aaa; cursor:not-allowed;">Hết Tập ❯❯</span>`}
        `;

  // ================= ĐOẠN CODE THÊM MỚI BẮT ĐẦU TỪ ĐÂY =================
  // Cập nhật đường link cho các nút trên Sidebar để đồng bộ với thanh điều hướng đáy
  const sidebarHome = document.getElementById("sidebar-home-btn");
  const sidebarPrev = document.getElementById("sidebar-prev-btn");
  const sidebarNext = document.getElementById("sidebar-next-btn");

  if (sidebarHome) {
    sidebarHome.href = `Story_Detail.html?id=${storyId}`; // Luôn trỏ về đúng truyện đang đọc
  }

  if (sidebarPrev) {
    if (hasPrev) {
      sidebarPrev.href = `Reading.html?storyId=${storyId}&vol=${volIndex}&chap=${chapIndex - 1}`;
      sidebarPrev.style.opacity = "1";
      sidebarPrev.style.pointerEvents = "auto";
    } else {
      sidebarPrev.removeAttribute("href");
      sidebarPrev.style.opacity = "0.3"; // Làm mờ đi nếu đang ở chương 1
      sidebarPrev.style.pointerEvents = "none"; // Khóa nút không cho bấm
    }
  }

  if (sidebarNext) {
    if (hasNext) {
      sidebarNext.href = `Reading.html?storyId=${storyId}&vol=${volIndex}&chap=${chapIndex + 1}`;
      sidebarNext.style.opacity = "1";
      sidebarNext.style.pointerEvents = "auto";
    } else {
      sidebarNext.removeAttribute("href");
      sidebarNext.style.opacity = "0.3"; // Làm mờ đi nếu hết chương
      sidebarNext.style.pointerEvents = "none";
    }
  }
}

// Kích hoạt chạy hàm ngay khi mở trang đọc lên
document.addEventListener("DOMContentLoaded", loadReadingContent);
