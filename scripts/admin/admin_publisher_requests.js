const API_URL = "http://localhost:5000/api";

// === CACHE toàn bộ dữ liệu ===
let allRequestsCache = [];
let allPublishersCache = [];

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  
  if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "owner")) {
    alert("Trang này chỉ dành cho Quản trị viên tối cao (Admin)!");
    window.location.href = "Admin_Stories.html";
    return;
  }

  if (currentUser.role === "owner") {
    const menuUsers = document.getElementById("menu-users");
    if (menuUsers) menuUsers.style.display = "block";
  }

  const searchBtn = document.getElementById("btn-search-publisher");
  if (searchBtn) {
    searchBtn.addEventListener("click", filterAndRenderAll);
  }

  fetchRequests();
  fetchCurrentPublishers();
});

// === HÀM LỌC CLIENT-SIDE ===
function filterAndRenderAll() {
  const searchInput = document.getElementById("search-publisher");
  const keyword = searchInput ? searchInput.value.trim().normalize('NFC').toLowerCase() : "";

  // Lọc đơn xin duyệt
  const filteredRequests = allRequestsCache.filter(req => {
    const username = req.user ? req.user.username : "";
    const email = req.user ? req.user.email : "";
    const reason = req.reason || "";
    const status = req.status || "";
    const combined = (username + " " + email + " " + reason + " " + status).normalize('NFC').toLowerCase();
    return combined.includes(keyword);
  });
  renderRequests(filteredRequests);

  // Lọc danh sách NXB hiện tại
  const filteredPublishers = allPublishersCache.filter(pub => {
    const combined = (pub.username + " " + pub.email + " " + (pub._id || "")).normalize('NFC').toLowerCase();
    return combined.includes(keyword);
  });
  renderPublishers(filteredPublishers);
}

async function fetchCurrentPublishers() {
  try {
    const response = await fetch(`${API_URL}/publishers`);
    if (!response.ok) throw new Error("Lỗi khi tải danh sách NXB");
    allPublishersCache = await response.json();
    filterAndRenderAll();
  } catch (error) {
    console.error(error);
    alert("Không thể tải danh sách Nhà Xuất Bản hiện tại!");
  }
}

function renderPublishers(publishers) {
  const tbody = document.getElementById("publishers-table-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (publishers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Hiện chưa có Nhà Xuất Bản nào.</td></tr>`;
    return;
  }

  publishers.forEach((pub) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${pub._id}</strong></td>
      <td><strong>${pub.username}</strong></td>
      <td>${pub.email}</td>
      <td style="color: green; font-weight: bold;">${pub.coins || 0}</td>
      <td class="action-btns">
        <button class="btn btn-reject" onclick="revokePublisher('${pub._id}', '${pub.username}')">Gỡ quyền</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function revokePublisher(pubId, pubUsername) {
  if (!confirm(`CẢNH BÁO: Bạn chắc chắn muốn gỡ quyền Nhà Xuất Bản của user "${pubUsername}"? Họ sẽ không thể vào Admin đăng truyện được nữa.`)) return;

  try {
    const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
    const response = await fetch(`${API_URL}/publishers/${pubId}/revoke`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminUsername: currentUser.username })
    });

    if (response.ok) {
      alert(`Đã gỡ quyền NXB của "${pubUsername}" thành công!`);
      fetchCurrentPublishers();
    } else {
      const data = await response.json();
      alert("Lỗi: " + data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Lỗi kết nối máy chủ khi gỡ quyền.");
  }
}

async function fetchRequests() {
  try {
    const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
    const response = await fetch(`${API_URL}/publisher-requests?role=${currentUser.role}`);
    if (!response.ok) throw new Error("Lỗi khi tải danh sách");
    allRequestsCache = await response.json();
    filterAndRenderAll();
  } catch (error) {
    console.error(error);
    alert("Không thể tải danh sách đơn đăng ký!");
  }
}

function renderRequests(requests) {
  const tbody = document.getElementById("requests-table-body");
  tbody.innerHTML = "";

  if (requests.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Chưa có đơn đăng ký nào.</td></tr>`;
    return;
  }

  requests.forEach((req) => {
    let statusClass = "";
    if (req.status === "Đang chờ") statusClass = "status-pending";
    else if (req.status === "Đã duyệt") statusClass = "status-approved";
    else statusClass = "status-rejected";

    let actionsHtml = "";
    if (req.status === "Đang chờ") {
      actionsHtml = `
        <button class="btn btn-approve" onclick="updateRequestStatus('${req._id}', 'Đã duyệt')">Duyệt</button>
        <button class="btn btn-reject" onclick="updateRequestStatus('${req._id}', 'Từ chối')">Từ chối</button>
      `;
    } else {
      actionsHtml = `<span style="color: #7f8c8d; font-style: italic;">Đã xử lý</span>`;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${req.user ? req.user.username : 'User ẩn danh'}</strong></td>
      <td>${req.user ? req.user.email : 'N/A'}</td>
      <td style="max-width: 300px; word-wrap: break-word;">${req.reason}</td>
      <td>${new Date(req.createdAt).toLocaleDateString("vi-VN")}</td>
      <td><span class="status-badge ${statusClass}">${req.status}</span></td>
      <td class="action-btns">${actionsHtml}</td>
    `;
    tbody.appendChild(tr);
  });
}

async function updateRequestStatus(reqId, newStatus) {
  if (!confirm(`Bạn chắc chắn muốn ${newStatus} đơn đăng ký này chứ?`)) return;

  try {
    const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
    const response = await fetch(`${API_URL}/publisher-requests/${reqId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, adminUsername: currentUser.username, role: currentUser.role })
    });

    if (response.ok) {
      alert(`Đã ${newStatus} thành công!`);
      fetchRequests();
    } else {
      const data = await response.json();
      alert("Lỗi: " + data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Lỗi kết nối máy chủ.");
  }
}

