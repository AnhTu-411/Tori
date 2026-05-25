const API_URL = "http://localhost:5000/api";
let currentStoryId = null;

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

  if (!currentStoryId) {
    alert("Không tìm thấy ID truyện!");
    window.location.href = "Admin_Stories.html";
    return;
  }

  const storyTitleDisplay = document.getElementById("story-title-display");
  if (storyTitleDisplay) {
    storyTitleDisplay.innerText = `Story ID: ${currentStoryId}`;
  }
  
  const btnAddChapter = document.getElementById("btn-add-chapter");
  if (btnAddChapter) {
    btnAddChapter.href = `Admin_Chapter_Form.html?storyId=${currentStoryId}`;
  }

  fetchStoryInfo();
  fetchChapters();
});

async function fetchStoryInfo() {
  try {
    const response = await fetch(`${API_URL}/stories/${currentStoryId}`);
    if (response.ok) {
      const story = await response.json();
      const storyTitleDisplay = document.getElementById("story-title-display");
      if (storyTitleDisplay) {
        storyTitleDisplay.innerText = `Chapters: ${story.title}`;
      }
    }
  } catch (error) {
    console.error("Không thể tải thông tin truyện", error);
  }
}

async function fetchChapters() {
  try {
    const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
    const response = await fetch(`${API_URL}/stories/${currentStoryId}/chapters?role=${currentUser ? currentUser.role : ""}`);
    if (!response.ok) throw new Error("Lỗi khi tải danh sách chapters");
    const chapters = await response.json();
    renderChapters(chapters);
  } catch (error) {
    console.error(error);
    alert("Không thể tải danh sách chapters!");
  }
}

function renderChapters(chapters) {
  const tbody = document.getElementById("chapters-table-body");
  tbody.innerHTML = "";

  if (chapters.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Chưa có chapter nào cho truyện này.</td></tr>`;
    return;
  }

  chapters.forEach((chapter) => {
    let approvalHtml = "";
    if (chapter.isApproved) {
      approvalHtml = `<span style="color: green; font-weight: bold;">Đã duyệt</span>`;
    } else {
      const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
      if (currentUser && currentUser.role === "admin") {
        approvalHtml = `<button class="btn" style="background-color: #27ae60; color: white;" onclick="approveChapter('${chapter._id}')">Duyệt</button>`;
      } else {
        approvalHtml = `<span style="color: orange; font-weight: bold;">Chưa duyệt</span>`;
      }
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${chapter.chapterNumber}</td>
      <td><strong>${chapter.title}</strong></td>
      <td>${chapter.price > 0 ? chapter.price + " Coin" : "Miễn phí"}</td>
      <td>${new Date(chapter.createdAt).toLocaleDateString("vi-VN")}</td>
      <td>${approvalHtml}</td>
      <td class="action-btns">
        <a href="Admin_Chapter_Form.html?storyId=${currentStoryId}&chapterId=${chapter._id}" class="btn btn-edit">Sửa</a>
        <button class="btn btn-delete" onclick="deleteChapter('${chapter._id}')">Xóa</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function deleteChapter(chapterId) {
  if (!confirm("Bạn có chắc chắn muốn xoá chapter này?")) {
    return;
  }

  try {
    const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
    const response = await fetch(`${API_URL}/chapters/${chapterId}?adminUsername=${currentUser.username}&role=${currentUser.role}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Xoá chapter thành công!");
      fetchChapters(); // Tải lại danh sách
    } else {
      const data = await response.json();
      alert("Lỗi: " + data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Lỗi kết nối tới máy chủ!");
  }
}

async function approveChapter(chapterId) {
  if (!confirm("Bạn chắc chắn muốn duyệt chương này chứ? Chương sẽ được hiển thị công khai.")) return;

  try {
    const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
    const response = await fetch(`${API_URL}/chapters/${chapterId}/approve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminUsername: currentUser.username })
    });
    if (response.ok) {
      alert("Đã duyệt chương thành công!");
      fetchChapters();
    } else {
      const data = await response.json();
      alert("Lỗi: " + data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Lỗi kết nối máy chủ!");
  }
}
