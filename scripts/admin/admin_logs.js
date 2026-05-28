document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = "http://localhost:5000/api";
  const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));

  if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "owner")) {
    alert("Bạn không có quyền truy cập khu vực này!");
    window.location.href = "../../index.html";
    return;
  }

  if (currentUser.role === "owner") {
    document.getElementById("menu-users").style.display = "block";
  }

  const tbody = document.getElementById("logs-table-body");
  let allLogsCache = [];

  // === TÌM KIẾM ===
  const searchInput = document.getElementById("search-logs");
  const searchBtn = document.getElementById("btn-search-logs");
  if (searchBtn) {
    searchBtn.addEventListener("click", filterAndRenderLogs);
  }

  function filterAndRenderLogs() {
    const keyword = searchInput ? searchInput.value.trim().normalize('NFC').toLowerCase() : "";

    const filtered = allLogsCache.filter(log => {
      const username = log.adminUsername || "";
      const action = log.action || "";
      const details = log.details || "";
      const combined = (username + " " + action + " " + details).normalize('NFC').toLowerCase();
      return combined.includes(keyword);
    });

    renderLogs(filtered);
  }

  function renderLogs(logs) {
    tbody.innerHTML = "";

    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #888; font-style: italic;">Chưa có nhật ký hoạt động nào.</td></tr>`;
      return;
    }

    logs.forEach((log) => {
      const tr = document.createElement("tr");
      
      // Định dạng ngày giờ
      const dateObj = new Date(log.createdAt);
      const dateStr = dateObj.toLocaleDateString("vi-VN");
      const timeStr = dateObj.toLocaleTimeString("vi-VN");

      tr.innerHTML = `
        <td>${dateStr} ${timeStr}</td>
        <td><strong>${log.adminUsername}</strong></td>
        <td><span style="background-color: #e8f4fd; color: #2b70a1; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${log.action}</span></td>
        <td>${log.details}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  async function loadLogs() {
    try {
      const response = await fetch(`${API_URL}/admin/logs?role=${currentUser.role}`);
      if (!response.ok) throw new Error("Lỗi tải danh sách nhật ký");
      allLogsCache = await response.json();
      filterAndRenderLogs();
    } catch (error) {
      console.error(error);
    }
  }

  // Gọi hàm load ban đầu
  async function init() {
      try {
          const response = await fetch(`${API_URL}/admin/logs?role=${currentUser.role}`);
          if (!response.ok) throw new Error("Lỗi tải dữ liệu logs");
          allLogsCache = await response.json();
          filterAndRenderLogs();
      } catch (err) {
          console.error(err);
      }
  }

  init();
});
