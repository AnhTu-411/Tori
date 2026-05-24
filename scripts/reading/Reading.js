// =================== LOGIC ĐỔI MÀU NỀN & CỠ CHỮ ===================

function switchImageServer(serverNum, baseTextContent = null) {
  const btn1 = document.getElementById("btn-server-1");
  const btn2 = document.getElementById("btn-server-2");
  
  if (btn1 && btn2) {
    if (serverNum === 1) {
      btn1.style.backgroundColor = "#3498db";
      btn1.style.color = "white";
      btn2.style.backgroundColor = "#eee";
      btn2.style.color = "black";
    } else {
      btn2.style.backgroundColor = "#3498db";
      btn2.style.color = "white";
      btn1.style.backgroundColor = "#eee";
      btn1.style.color = "black";
    }
  }

  const linksToUse = serverNum === 1 ? currentImageLinks1 : currentImageLinks2;
  const contentBox = document.getElementById("read-content-box");
  
  // baseTextContent chỉ được truyền vào lần đầu tiên để ghép với phần text truyện nếu có
  let currentHtml = baseTextContent !== null ? baseTextContent : (contentBox.dataset.textContent || "");
  
  // Lưu lại textContent lần đầu
  if (baseTextContent !== null) contentBox.dataset.textContent = baseTextContent;

  if (linksToUse && linksToUse.length > 0) {
    let imagesHtml = `<div class="chapter-images" style="text-align: center; margin-top: 20px; display: flex; flex-direction: column; align-items: center;">`;
    linksToUse.forEach(link => {
      imagesHtml += `<img src="${link}" style="width: 100%; max-width: 800px; height: auto; display: block; margin: 0 auto;" alt="Truyện tranh">`;
    });
    imagesHtml += `</div>`;
    currentHtml += imagesHtml;
  }
  
  contentBox.innerHTML = currentHtml;
}

function toggleReadTheme() {
  const body = document.getElementById("reading-body");
  body.classList.toggle("dark-reading");
}

let currentFontSize = 18;
function changeFontSize() {
  currentFontSize += 2;
  if (currentFontSize > 28) currentFontSize = 14;
  const contentBox = document.getElementById("read-content-box");
  if (contentBox) {
    contentBox.style.fontSize = currentFontSize + "px";
  }
}

function saveBookmark(storyId, chapterId, chapterTitle) {
  let bookmarks = JSON.parse(localStorage.getItem("tori_bookmarks")) || [];
  const existingIdx = bookmarks.findIndex(b => b.storyId === storyId);
  const newBookmark = { 
    storyId, 
    chapterId, 
    chapterTitle, 
    date: new Date().toISOString() 
  };
  
  if (existingIdx > -1) {
    bookmarks[existingIdx] = newBookmark;
  } else {
    bookmarks.push(newBookmark);
  }
  
  localStorage.setItem("tori_bookmarks", JSON.stringify(bookmarks));
  alert("Đã lưu dấu trang thành công! Bạn có thể xem lại ở trang cá nhân.");
}

// 2. LOGIC ĐỌC DỮ LIỆU ĐỘNG TỪ URL
let currentImageLinks1 = [];
let currentImageLinks2 = [];

async function loadReadingContent() {
  const urlParams = new URLSearchParams(window.location.search);
  const storyId = urlParams.get("storyId");
  const chapterId = urlParams.get("chapterId");

  if (!storyId || !chapterId) {
    document.getElementById("read-content-box").innerHTML =
      "<h2>Không tìm thấy nội dung chương truyện này!</h2>";
    return;
  }

  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  let usernameQuery = currentUser ? `?username=${currentUser.username}` : "";

  try {
    const API_URL = "http://localhost:5000/api";
    const response = await fetch(`${API_URL}/chapters/${chapterId}${usernameQuery}`);

    if (response.status === 403) {
      const errorData = await response.json();
      document.title = "Yêu cầu mua truyện";
      document.getElementById("read-vol-title").innerText = "Nội dung thu phí";
      document.getElementById("read-chap-title").innerText = "Bạn cần mua truyện để đọc tiếp";
      document.getElementById("read-chap-meta").innerText = "";
      
      document.getElementById("read-content-box").innerHTML = `
        <div style="text-align: center; padding: 50px;">
          <h2 style="color: red;">${errorData.message}</h2>
          <p style="margin: 20px 0;">Giá mua toàn bộ truyện: <strong style="font-size: 20px; color: green;">${errorData.price || 0} Coin</strong></p>
          <button onclick="buyPremiumStory('${errorData.storyId}', ${errorData.price || 0})" class="button-general" style="padding: 10px 20px; font-size: 16px;">💳 Thanh toán ngay</button>
        </div>
      `;
      return;
    }

    if (!response.ok) throw new Error("Lỗi tải chương truyện");

    const chap = await response.json();
    const story = chap.storyId; // storyId is populated

    document.title = `${story ? story.title : 'Truyện'} - Chương ${chap.chapterNumber}`;
    document.getElementById("read-vol-title").innerText = story ? story.title : "Tori Lightnovel";
    document.getElementById("read-chap-title").innerText = `Chương ${chap.chapterNumber}: ${chap.title}`;
    document.getElementById("read-chap-meta").innerText = `Cập nhật: ${new Date(chap.createdAt).toLocaleDateString("vi-VN")}`;

    // Render nội dung
    let contentHtml = "";
    if (chap.content) {
      const lines = chap.content.split('\\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim()) {
          contentHtml += `<p>${lines[i]}</p>`;
        }
      }
    } else {
      contentHtml = "<p style='text-align:center; color:#888;'>Chương này hiện chưa có nội dung chữ.</p>";
    }
    
    // Kiểm tra và hiển thị các nút chọn Server nếu cần thiết
    currentImageLinks1 = chap.imageLinks || [];
    currentImageLinks2 = chap.imageLinks2 || [];
    const serverSwitcher = document.getElementById("server-switcher");
    
    if (currentImageLinks1.length > 0 || currentImageLinks2.length > 0) {
      if (currentImageLinks1.length > 0 && currentImageLinks2.length > 0) {
        // Có cả 2 server, hiện nút
        if (serverSwitcher) serverSwitcher.style.display = "block";
      } else {
        // Chỉ có 1 trong 2 server, ẩn nút
        if (serverSwitcher) serverSwitcher.style.display = "none";
      }
      
      // Mặc định gọi switchServer(1) nếu server 1 có dữ liệu, nếu không thì server 2
      const defaultServer = currentImageLinks1.length > 0 ? 1 : 2;
      switchImageServer(defaultServer, contentHtml);
    } else {
      if (serverSwitcher) serverSwitcher.style.display = "none";
      document.getElementById("read-content-box").innerHTML = contentHtml;
    }

    // Hiển thị điều hướng cơ bản
    const navBox = document.getElementById("reading-nav-box");
    navBox.innerHTML = `
      <a href="${ToriRoutes.href("storyDetail", { id: storyId })}" class="nav-btn" style="width: 100%; text-align: center;">🏠︎ Trở về Mục lục Truyện</a>
    `;

    const sidebarHome = document.getElementById("sidebar-home-btn");
    if (sidebarHome) sidebarHome.href = ToriRoutes.href("storyDetail", { id: storyId });
    
    // Nút bookmark
    const bookmarkBtn = document.getElementById("bookmark-btn");
    if (bookmarkBtn) {
      bookmarkBtn.onclick = () => saveBookmark(storyId, chapterId, chap.title);
    }

    // Logic Chapter Prev / Next
    try {
      const allChapsRes = await fetch(`${API_URL}/stories/${storyId}/chapters${usernameQuery ? usernameQuery : "?role=" + (currentUser ? currentUser.role : "")}`);
      if (allChapsRes.ok) {
        const allChaps = await allChapsRes.json();
        const currentIndex = allChaps.findIndex(c => c._id === chapterId);
        
        const prevChap = currentIndex > 0 ? allChaps[currentIndex - 1] : null;
        const nextChap = currentIndex < allChaps.length - 1 ? allChaps[currentIndex + 1] : null;

        const sidebarPrev = document.getElementById("sidebar-prev-btn");
        if (sidebarPrev) {
          if (prevChap) {
            sidebarPrev.href = ToriRoutes.href("reading", { storyId: storyId, chapterId: prevChap._id });
            sidebarPrev.style.opacity = 1;
            sidebarPrev.style.pointerEvents = "auto";
          } else {
            sidebarPrev.href = "#";
            sidebarPrev.style.opacity = 0.3;
            sidebarPrev.style.pointerEvents = "none";
          }
        }

        const sidebarNext = document.getElementById("sidebar-next-btn");
        if (sidebarNext) {
          if (nextChap) {
            sidebarNext.href = ToriRoutes.href("reading", { storyId: storyId, chapterId: nextChap._id });
            sidebarNext.style.opacity = 1;
            sidebarNext.style.pointerEvents = "auto";
          } else {
            sidebarNext.href = "#";
            sidebarNext.style.opacity = 0.3;
            sidebarNext.style.pointerEvents = "none";
          }
        }
      }
    } catch (e) {
      console.error("Lỗi tải danh sách chapters điều hướng", e);
    }

    // Tải bình luận
    fetchComments(chapterId);

    // Xử lý Gửi bình luận
    const commentForm = document.getElementById("comment-form");
    if (commentForm) {
      commentForm.addEventListener("submit", (e) => handleCommentSubmit(e, storyId, chapterId));
    }

  } catch (err) {
    document.getElementById("read-content-box").innerHTML =
      "<h2 style='text-align: center; color: red;'>Lỗi kết nối Server!</h2>";
    console.error(err);
  }
}

async function buyPremiumStory(storyId, price) {
  let currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (!currentUser) {
    alert("Vui lòng đăng nhập!");
    window.location.href = ToriRoutes.href("login");
    return;
  }

  if (confirm(`Bạn có chắc muốn mua nguyên bộ truyện này với giá ${price} Coin?`)) {
    try {
      const response = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser.username,
          storyId: storyId,
          price: price
        })
      });

      if (response.ok) {
        alert("Thanh toán thành công! Bạn đã mở khóa toàn bộ nội dung của truyện.");
        window.location.reload();
      } else {
        const data = await response.json();
        alert("Lỗi thanh toán: " + data.message);
      }
    } catch (err) {
      alert("Lỗi kết nối tới máy chủ!");
      console.error(err);
    }
  }
}

// =================== LOGIC BÌNH LUẬN ===================

async function fetchComments(chapterId) {
  const commentsList = document.getElementById("comments-list");
  if (!commentsList) return;

  try {
    const API_URL = "http://localhost:5000/api";
    const response = await fetch(`${API_URL}/chapters/${chapterId}/comments`);
    if (!response.ok) throw new Error("Lỗi tải bình luận");
    const comments = await response.json();

    if (comments.length === 0) {
      commentsList.innerHTML = `<p style="text-align: center; color: #888;">Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>`;
      return;
    }

    let html = "";
    comments.forEach(c => {
      const dateStr = new Date(c.createdAt).toLocaleString("vi-VN");
      html += `
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee;">
          <strong style="color: #2980b9;">${c.user ? c.user.username : 'Ẩn danh'}</strong>
          <span style="font-size: 12px; color: #7f8c8d; margin-left: 10px;">${dateStr}</span>
          <p style="margin-top: 8px; line-height: 1.5;">${c.content}</p>
        </div>
      `;
    });
    commentsList.innerHTML = html;
  } catch (error) {
    console.error("Lỗi:", error);
    commentsList.innerHTML = `<p style="text-align: center; color: red;">Lỗi tải bình luận.</p>`;
  }
}

async function handleCommentSubmit(e, storyId, chapterId) {
  e.preventDefault();
  
  const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (!currentUser) {
    alert("Vui lòng đăng nhập để bình luận!");
    window.location.href = ToriRoutes.href("login");
    return;
  }

  const input = document.getElementById("comment-input");
  const content = input.value.trim();
  if (!content) {
    alert("Vui lòng nhập nội dung!");
    return;
  }

  try {
    const API_URL = "http://localhost:5000/api";
    const response = await fetch(`${API_URL}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: currentUser.username,
        storyId: storyId,
        chapterId: chapterId,
        content: content
      })
    });

    if (response.ok) {
      input.value = "";
      fetchComments(chapterId); // Tải lại danh sách
    } else {
      const data = await response.json();
      alert("Lỗi: " + data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Lỗi kết nối máy chủ!");
  }
}

// Kích hoạt chạy hàm ngay khi mở trang đọc lên
document.addEventListener("DOMContentLoaded", loadReadingContent);
