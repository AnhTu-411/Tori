const API_URL = "http://localhost:5000/api";
let allStories = [];

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
  }

  fetchStories(currentUser);

  const searchInput = document.getElementById("search-story-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const keyword = e.target.value.toLowerCase();
      const filteredStories = allStories.filter(story => 
        story.title.toLowerCase().includes(keyword) || 
        story.author.toLowerCase().includes(keyword)
      );
      renderStories(filteredStories);
    });
  }
});

async function fetchStories(user) {
  try {
    let url = `${API_URL}/stories?role=${user.role}`;
    if (user.role === "publisher") {
      url += `&publisherId=${user._id}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error("Lỗi khi tải danh sách truyện");
    allStories = await response.json();
    renderStories(allStories);
  } catch (error) {
    console.error(error);
    alert("Không thể tải danh sách truyện!");
  }
}

function renderStories(stories) {
  const tbody = document.getElementById("stories-table-body");
  tbody.innerHTML = "";

  if (stories.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Chưa có truyện nào.</td></tr>`;
    return;
  }

  stories.forEach((story) => {
    let approvalHtml = "";
    if (story.isApproved) {
      approvalHtml = `<span style="color: green; font-weight: bold;">Đã duyệt</span>`;
    } else {
      const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
      if (currentUser && currentUser.role === "admin") {
        approvalHtml = `<button class="btn" style="background-color: #27ae60; color: white;" onclick="approveStory('${story._id}')">Duyệt</button>`;
      } else {
        approvalHtml = `<span style="color: orange; font-weight: bold;">Chưa duyệt</span>`;
      }
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${story._id}</td>
      <td><strong>${story.title}</strong></td>
      <td>${story.author}</td>
      <td><span style="padding: 4px 8px; background: #e8f8f5; color: #1abc9c; border-radius: 4px; font-size: 13px;">${story.status}</span></td>
      <td>${approvalHtml}</td>
      <td class="action-btns">
        <a href="Admin_Chapters.html?storyId=${story._id}" class="btn btn-info">Chương</a>
        <a href="Admin_Story_Form.html?id=${story._id}" class="btn btn-warning">Sửa</a>
        <button onclick="deleteStory('${story._id}')" class="btn btn-danger">Xoá</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function deleteStory(id) {
  if (!confirm("Bạn có chắc chắn muốn xoá truyện này? Toàn bộ chương của truyện cũng sẽ bị xoá!")) {
    return;
  }

  try {
    const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
    const response = await fetch(`${API_URL}/stories/${id}?adminUsername=${currentUser.username}&role=${currentUser.role}`, {
      method: "DELETE",
    });

    if (response.ok) {
      alert("Xoá truyện thành công!");
      const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
      fetchStories(currentUser);
    } else {
      const data = await response.json();
      alert("Lỗi: " + data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Lỗi kết nối máy chủ!");
  }
}

async function approveStory(id) {
  if (!confirm("Bạn chắc chắn muốn duyệt truyện này chứ? Truyện sẽ hiển thị công khai cho mọi người.")) return;

  try {
    const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
    const response = await fetch(`${API_URL}/stories/${id}/approve`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminUsername: currentUser.username })
    });
    if (response.ok) {
      alert("Đã duyệt truyện thành công!");
      const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
      fetchStories(currentUser);
    } else {
      const data = await response.json();
      alert("Lỗi: " + data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Lỗi kết nối tới máy chủ!");
  }
}

