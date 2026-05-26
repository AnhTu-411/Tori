const API_URL = "http://localhost:5000/api";
let currentPage = 1;
let currentLimit = 20;

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

  window.applyFilters = function(resetPage = true) {
    if (resetPage) currentPage = 1;
    fetchStories(currentUser);
  }

  fetchStories(currentUser);

  const searchInput = document.getElementById("search-story-input");
  const genreSelect = document.getElementById("search-genre");
  const statusSelect = document.getElementById("search-status");
  const yearInput = document.getElementById("search-year");

  const searchBtn = document.getElementById("btn-admin-search");
  if (searchBtn) {
    searchBtn.addEventListener("click", () => applyFilters());
  }
});

async function fetchStories(user) {
  let queryParams = new URLSearchParams();
  queryParams.append("page", currentPage);
  queryParams.append("limit", currentLimit);
  queryParams.append("role", user.role);
  
  if (user.role === "publisher") {
    queryParams.append("publisherId", user._id);
  }

  const searchInput = document.getElementById("search-story-input");
  const genreSelect = document.getElementById("search-genre");
  const statusSelect = document.getElementById("search-status");
  const yearInput = document.getElementById("search-year");

  const keyword = searchInput ? searchInput.value.trim().normalize('NFC') : "";
  const genre = genreSelect ? genreSelect.value.trim().normalize('NFC') : "";
  const status = statusSelect ? statusSelect.value : "";
  const year = yearInput ? yearInput.value : "";

  if (keyword) queryParams.append("title", keyword);
  if (status) queryParams.append("status", status);
  if (year) queryParams.append("year", year);
  if (genre) queryParams.append("genres", genre);

  const tbody = document.getElementById("stories-table-body");
  if (tbody) tbody.innerHTML = "<tr><td colspan='6' class='text-center'>Đang tải...</td></tr>";

  try {
    const res = await fetch(`${API_URL}/stories?${queryParams.toString()}`);
    if (!res.ok) throw new Error("Lỗi tải danh sách truyện");
    
    const responseData = await res.json();
    const stories = Array.isArray(responseData) ? responseData : (responseData.stories || responseData.data || []);
    const totalPages = responseData.totalPages || 1;

    renderTable(stories, user);
    renderPagination(totalPages, user);
  } catch (error) {
    console.error("Lỗi fetch stories:", error);
    if (tbody) tbody.innerHTML = `<tr><td colspan='6' class='text-center text-danger'>Lỗi: ${error.message}</td></tr>`;
  }
}

function renderTable(stories, user) {
  const tbody = document.getElementById("stories-table-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (stories.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Chưa có truyện nào.</td></tr>`;
    return;
  }

  stories.forEach((story) => {
    let approvalHtml = "";
    if (story.isApproved) {
      approvalHtml = `<span class="text-approval" style="font-weight: bold;">Đã duyệt</span>`;
    } else {
      const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
      if (currentUser && currentUser.role === "admin") {
        approvalHtml = `<button class="btn" style="background-color: #27ae60; color: white;" onclick="approveStory('${story._id}')">Duyệt</button>`;
      } else {
        approvalHtml = `<span class="text-unapproved" style="font-weight: bold;">Chưa duyệt</span>`;
      }
    }

    let statusClass = "";
    if (story.status === "Hoàn thành") {
      statusClass = "status-completed";
    } else if (story.status === "Tạm ngưng") {
      statusClass = "status-paused";
    } else {
      statusClass = "status-ongoing";
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${story._id}</td>
      <td><strong>${story.title}</strong></td>
      <td>${story.author}</td>
      <td><span class="status-badge ${statusClass}">${story.status}</span></td>
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

function renderPagination(totalPages, user) {
  let paginationContainer = document.getElementById("admin-pagination-container");
  if (!paginationContainer) {
    const table = document.querySelector(".admin-table-container");
    if (!table) return;
    
    paginationContainer = document.createElement("div");
    paginationContainer.id = "admin-pagination-container";
    paginationContainer.className = "pagination";
    paginationContainer.style.marginTop = "20px";
    paginationContainer.style.display = "flex";
    paginationContainer.style.justifyContent = "center";
    paginationContainer.style.gap = "10px";
    
    table.parentNode.insertBefore(paginationContainer, table.nextSibling);
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
      fetchStories(user);
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
        fetchStories(user);
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
      fetchStories(user);
    }
  };
  paginationContainer.appendChild(nextBtn);
}

