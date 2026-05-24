const API_URL = "http://localhost:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  
  if (!currentUser || currentUser.role !== "admin") {
    alert("Trang này chỉ dành cho Quản trị viên tối cao (Admin)!");
    window.location.href = "Admin_Stories.html";
    return;
  }

  fetchRequests();
});

async function fetchRequests() {
  try {
    const response = await fetch(`${API_URL}/publisher-requests`);
    if (!response.ok) throw new Error("Lỗi khi tải danh sách");
    const requests = await response.json();
    renderRequests(requests);
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
    const response = await fetch(`${API_URL}/publisher-requests/${reqId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
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
