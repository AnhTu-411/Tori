const API_URL = "http://localhost:5000/api";
let currentStoryId = null;
let currentChapterId = null;

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (!currentUser || currentUser.role === "user") {
    alert("Bạn không có quyền truy cập trang này!");
    window.location.href = "../../index.html";
    return;
  }

  if (currentUser.role === "publisher") {
    const pubReqMenu = document.getElementById("menu-publisher-requests");
    if (pubReqMenu) pubReqMenu.style.display = "none";
  }
  const urlParams = new URLSearchParams(window.location.search);
  currentStoryId = urlParams.get("storyId");
  currentChapterId = urlParams.get("chapterId");

  if (!currentStoryId) {
    alert("Không có ID truyện!");
    window.location.href = "Admin_Stories.html";
    return;
  }

  document.getElementById("btn-back").href = `Admin_Chapters.html?storyId=${currentStoryId}`;

  if (currentChapterId) {
    document.getElementById("form-title").innerText = "Sửa Thông Tin Chapter";
    fetchChapterDetails(currentChapterId);
  }

  document.getElementById("chapter-form").addEventListener("submit", saveChapter);

  // Xử lý kéo thả và chọn file txt cho 2 Server
  setupDropZone("drop-zone-1", "txtFileInput1", "imageLinks1", "#e0f7fa");
  setupDropZone("drop-zone-2", "txtFileInput2", "imageLinks2", "#fff0e0");
});

function setupDropZone(dropId, fileId, textId, hoverColor) {
  const dropZone = document.getElementById(dropId);
  const fileInput = document.getElementById(fileId);
  const textArea = document.getElementById(textId);

  if (!dropZone || !fileInput || !textArea) return;

  // Bấm vào dropZone thì mở hộp thoại chọn file
  dropZone.addEventListener("click", () => fileInput.click());

  // Đổi màu khi kéo file vào
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = hoverColor;
  });
  dropZone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = dropId.includes('2') ? "#fff9f0" : "#f9f9f9";
  });

  // Khi thả file
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = dropId.includes('2') ? "#fff9f0" : "#f9f9f9";
    if (e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0], textArea);
    }
  });

  // Khi chọn file bằng nút
  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      processFile(e.target.files[0], textArea);
    }
  });
}

function processFile(file, textArea) {
  if (file.type !== "text/plain" && !file.name.endsWith(".txt")) {
    alert("Vui lòng chọn file .txt");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    // Lấy các dòng không trống, hỗ trợ tách bằng cả dấu phẩy (,) và xuống dòng (\n)
    const lines = text.split(/[\r\n,]+/).map(line => line.trim()).filter(line => line !== "");
    
    // Nếu text area đang có chữ thì hỏi xem có muốn ghi đè không
    if (textArea.value.trim() !== "") {
      if (!confirm("Khung nhập link đang có dữ liệu. Bạn có muốn ghi đè toàn bộ bằng dữ liệu từ file mới không?")) {
        return;
      }
    }
    textArea.value = lines.join("\n");
  };
  reader.readAsText(file);
}

async function fetchChapterDetails(id) {
  try {
    const response = await fetch(`${API_URL}/chapters/${id}`);
    if (!response.ok) throw new Error("Lỗi khi tải chi tiết chapter");
    const chapter = await response.json();

    document.getElementById("chapterNumber").value = chapter.chapterNumber;
    document.getElementById("title").value = chapter.title;
    document.getElementById("content").value = chapter.content || "";
    document.getElementById("price").value = chapter.price || 0;
    if (chapter.imageLinks && chapter.imageLinks.length > 0) {
      document.getElementById("imageLinks1").value = chapter.imageLinks.join("\n");
    }
    if (chapter.imageLinks2 && chapter.imageLinks2.length > 0) {
      document.getElementById("imageLinks2").value = chapter.imageLinks2.join("\n");
    }

  } catch (error) {
    console.error(error);
    alert("Không thể tải thông tin chapter!");
  }
}

async function saveChapter(e) {
  e.preventDefault();

  const chapterNumber = parseInt(document.getElementById("chapterNumber").value);
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();
  const price = parseInt(document.getElementById("price").value);
  
  // Xử lý list ảnh Server 1
  const imageLinksRaw1 = document.getElementById("imageLinks1").value.trim();
  let imageLinks = [];
  if (imageLinksRaw1) {
    imageLinks = imageLinksRaw1.split(/[\r\n,]+/).map(l => l.trim()).filter(l => l !== "");
  }

  // Xử lý list ảnh Server 2
  const imageLinksRaw2 = document.getElementById("imageLinks2").value.trim();
  let imageLinks2 = [];
  if (imageLinksRaw2) {
    imageLinks2 = imageLinksRaw2.split(/[\r\n,]+/).map(l => l.trim()).filter(l => l !== "");
  }

  const payload = {
    storyId: currentStoryId,
    chapterNumber,
    title,
    content,
    imageLinks,
    imageLinks2,
    price,
    role: currentUser ? currentUser.role : ""
  };

  try {
    let response;
    if (currentChapterId) {
      // Gọi API PUT để cập nhật
      response = await fetch(`${API_URL}/chapters/${currentChapterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } else {
      // Gọi API POST để thêm mới
      response = await fetch(`${API_URL}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    if (response.ok) {
      alert(currentChapterId ? "Cập nhật chapter thành công!" : "Thêm chapter thành công!");
      window.location.href = `Admin_Chapters.html?storyId=${currentStoryId}`;
    } else {
      const data = await response.json();
      alert("Lỗi: " + data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Lỗi kết nối đến máy chủ!");
  }
}
