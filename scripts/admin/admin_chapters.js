const API_URL = "http://localhost:5000/api";
let currentStoryId = null;
let allChaptersCache = [];

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (!currentUser || currentUser.role === "user") {
    alert("Bạn không có quyền truy cập trang này!");
    window.location.href = "../../index.html";
    return;
  }

  if (currentUser.role === "owner") {
    const menuUsers = document.getElementById("menu-users");
    if (menuUsers) menuUsers.style.display = "block";
  }

  if (currentUser.role === "publisher") {
    const pubReqMenu = document.getElementById("menu-publisher-requests");
    if (pubReqMenu) pubReqMenu.style.display = "none";
    const adminLogsMenu = document.getElementById("menu-admin-logs");
    if (adminLogsMenu) adminLogsMenu.style.display = "none";
  }

  // Hiển thị nút "Duyệt tất cả" cho admin/owner
  if (currentUser.role === "admin" || currentUser.role === "owner") {
    const btnApproveAll = document.getElementById("btn-approve-all");
    if (btnApproveAll) btnApproveAll.style.display = "inline-block";
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
        const approvalTag = story.isApproved 
          ? '<span style="color: #27ae60; font-weight: bold;">[Đã duyệt]</span>' 
          : '<span style="color: #e74c3c; font-weight: bold;">[Chưa duyệt]</span>';
        storyTitleDisplay.innerHTML = `Truyện: <strong>${story.title}</strong> ${approvalTag}`;
      }
    }
  } catch (error) {
    console.error("Không thể tải thông tin truyện", error);
  }
}

async function fetchChapters() {
  try {
    const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
    const publisherQuery = (currentUser && currentUser.role === "publisher") ? `&publisherId=${currentUser._id || currentUser.id}` : "";
    const response = await fetch(`${API_URL}/stories/${currentStoryId}/chapters?role=${currentUser ? currentUser.role : ""}${publisherQuery}`);
    if (!response.ok) throw new Error("Lỗi khi tải danh sách chapters");
    allChaptersCache = await response.json();
    filterChapters();
  } catch (error) {
    console.error(error);
    alert("Không thể tải danh sách chapters!");
  }
}

function filterChapters() {
  const filterSelect = document.getElementById("filter-chapter-approval");
  const filterValue = filterSelect ? filterSelect.value : "";

  let filtered = [...allChaptersCache];
  if (filterValue === "approved") {
    filtered = filtered.filter(ch => ch.isApproved === true);
  } else if (filterValue === "unapproved") {
    filtered = filtered.filter(ch => !ch.isApproved);
  } else if (filterValue === "pending_delete") {
    filtered = filtered.filter(ch => ch.deleteRequested === true);
  }

  renderChapters(filtered);
}

function renderChapters(chapters) {
  const tbody = document.getElementById("chapters-table-body");
  tbody.innerHTML = "";

  if (chapters.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Chưa có chương nào cho truyện này.</td></tr>`;
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  const canApprove = currentUser && (currentUser.role === "admin" || currentUser.role === "owner");

  chapters.forEach((chapter) => {
    let approvalHtml = "";
    if (chapter.isApproved) {
      if (canApprove) {
        approvalHtml = `<div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                          <span style="color: #27ae60; font-weight: bold;">Đã duyệt</span>
                          <button class="btn" style="background-color: #e67e22; color: white; border-radius: 4px; padding: 4px 8px; font-size: 12px; width: 100%;" onclick="unapproveChapter('${chapter._id}')">Hủy duyệt</button>
                        </div>`;
      } else {
        approvalHtml = `<span style="color: #27ae60; font-weight: bold;">Đã duyệt</span>`;
      }
    } else {
      if (canApprove) {
        approvalHtml = `<div style="display:flex; flex-direction:column; align-items:center; gap:5px;">
                          <span style="color: #e74c3c; font-weight: bold;">Chưa duyệt</span>
                          <button class="btn" style="background-color: #27ae60; color: white; border-radius: 4px; padding: 4px 8px; font-size: 12px; width: 100%;" onclick="approveChapter('${chapter._id}')">Duyệt ngay</button>
                        </div>`;
      } else {
        approvalHtml = `<span style="color: #e74c3c; font-weight: bold;">Chưa duyệt</span>`;
      }
    }

    let rowHtml = `
      <td>${chapter.chapterNumber}</td>
      <td>
        <strong>${chapter.title}</strong>
        ${chapter.deleteRequested ? `<div style="color: #e74c3c; font-size: 12px; margin-top: 5px;"><strong>YÊU CẦU XOÁ:</strong> ${chapter.deleteReason || "Không có lí do"}</div>` : ""}
      </td>
      <td>${chapter.price > 0 ? chapter.price + " Coin" : "Miễn phí"}</td>
      <td>${new Date(chapter.createdAt).toLocaleDateString("vi-VN")}</td>
      <td>${approvalHtml}</td>
      <td class="action-btns">
        <a href="Admin_Chapter_Form.html?storyId=${currentStoryId}&chapterId=${chapter._id}" class="btn btn-edit">Sửa</a>
        ${(chapter.deleteRequested && canApprove) ? `<button class="btn" style="background-color: #34495e; color: white;" onclick="rejectDeleteChapter('${chapter._id}')">Từ chối xoá</button>` : ""}
        <button class="btn btn-delete" onclick="deleteChapter('${chapter._id}')">${(chapter.deleteRequested && canApprove) ? "Duyệt xoá" : "Xóa"}</button>
      </td>
    `;
    const tr = document.createElement("tr");
    tr.innerHTML = rowHtml;
    tbody.appendChild(tr);
  });
}

async function deleteChapter(chapterId) {
  const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  let reason = "";

  if (currentUser && currentUser.role === "publisher") {
    reason = prompt("Vui lòng nhập lí do muốn xoá chương này:");
    if (reason === null) return; // Người dùng bấm Hủy
  } else {
    if (!confirm("Bạn có chắc chắn muốn xoá chapter này?")) {
      return;
    }
  }

  try {
    let queryParams = `?adminUsername=${currentUser.username}&role=${currentUser.role}&reason=${encodeURIComponent(reason)}`;
    if (currentUser.role === "publisher") {
      queryParams += `&publisherId=${currentUser._id || currentUser.id}`;
    }
    const response = await fetch(`${API_URL}/chapters/${chapterId}${queryParams}`, {
      method: "DELETE",
    });

    if (response.ok) {
      const data = await response.json();
      alert(data.message);
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

async function rejectDeleteChapter(chapterId) {
  if (!confirm("Bạn chắc chắn muốn từ chối yêu cầu xoá chương này?")) return;
  try {
    const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
    const response = await fetch(`${API_URL}/chapters/${chapterId}/reject-delete`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminUsername: currentUser.username, role: currentUser.role })
    });
    if (response.ok) {
      alert("Đã từ chối yêu cầu xoá thành công!");
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

async function approveChapter(chapterId) {
  if (!confirm("Bạn chắc chắn muốn duyệt chương này chứ? Chương sẽ được hiển thị công khai.")) return;

  try {
    const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
    const response = await fetch(`${API_URL}/chapters/${chapterId}/approve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminUsername: currentUser.username, role: currentUser.role })
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

async function unapproveChapter(chapterId) {
  if (!confirm("Bạn có chắc chắn muốn hủy duyệt chương này chứ? Chương sẽ bị ẩn khỏi trang cộng đồng.")) return;

  try {
    const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
    const response = await fetch(`${API_URL}/chapters/${chapterId}/unapprove`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminUsername: currentUser.username, role: currentUser.role })
    });
    if (response.ok) {
      alert("Đã hủy duyệt chương thành công!");
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

async function approveAllChapters() {
  const unapproved = allChaptersCache.filter(ch => !ch.isApproved);
  if (unapproved.length === 0) {
    alert("Tất cả chương đã được duyệt rồi!");
    return;
  }

  if (!confirm(`Bạn chắc chắn muốn duyệt tất cả ${unapproved.length} chương chưa duyệt? Chúng sẽ được hiển thị công khai.`)) return;

  try {
    const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
    let successCount = 0;

    for (const ch of unapproved) {
      const response = await fetch(`${API_URL}/chapters/${ch._id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUsername: currentUser.username, role: currentUser.role })
      });
      if (response.ok) successCount++;
    }

    alert(`Đã duyệt thành công ${successCount}/${unapproved.length} chương!`);
    fetchChapters();
  } catch (error) {
    console.error(error);
    alert("Lỗi kết nối máy chủ!");
  }
}
