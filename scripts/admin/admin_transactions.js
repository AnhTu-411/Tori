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

  const tbody = document.getElementById("tx-table-body");
  let allTransactionsCache = [];

  // === TÌM KIẾM ===
  const searchInput = document.getElementById("search-transactions");
  const searchBtn = document.getElementById("btn-search-transactions");
  if (searchBtn) {
    searchBtn.addEventListener("click", filterAndRenderTransactions);
  }

  function filterAndRenderTransactions() {
    const keyword = searchInput ? searchInput.value.trim().normalize('NFC').toLowerCase() : "";

    const filtered = allTransactionsCache.filter(tx => {
      const username = tx.user ? tx.user.username : "";
      const txId = tx.transactionId || "";
      const type = tx.type || "";
      const status = tx.status || "";
      const combined = (username + " " + txId + " " + type + " " + status).normalize('NFC').toLowerCase();
      return combined.includes(keyword);
    });

    renderTransactions(filtered);
  }

  function renderTransactions(transactions) {
    tbody.innerHTML = "";

    if (transactions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #888; font-style: italic;">Không tìm thấy giao dịch nào.</td></tr>`;
      return;
    }

    transactions.forEach((tx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${tx.transactionId || '---'}</td>
        <td>${tx.user ? tx.user.username : 'Ẩn danh'}</td>
        <td>${tx.type || 'Mua truyện'}</td>
        <td style="color: ${tx.type === 'Nạp tiền' ? 'green' : 'red'}; font-weight: bold;">
          ${tx.type === 'Nạp tiền' ? '+' : '-'}${tx.price} <i class="fa-solid fa-coins"></i>
        </td>
        <td>${new Date(tx.createdAt).toLocaleDateString("vi-VN")} ${new Date(tx.createdAt).toLocaleTimeString("vi-VN")}</td>
        <td>
          <select class="status-select form-control" data-id="${tx._id}">
            <option value="Thành công" ${tx.status.includes('Thành công') ? 'selected' : ''}>Thành công</option>
            <option value="Đang chờ xử lý" ${tx.status === 'Đang chờ xử lý' ? 'selected' : ''}>Đang chờ xử lý</option>
            <option value="Đã hủy" ${tx.status === 'Đã hủy' ? 'selected' : ''}>Đã hủy</option>
            <option value="Thất bại" ${tx.status === 'Thất bại' ? 'selected' : ''}>Thất bại</option>
          </select>
        </td>
        <td>
          <button class="btn btn-primary btn-update" data-id="${tx._id}">Cập nhật</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Gắn sự kiện cho nút Cập nhật
    document.querySelectorAll(".btn-update").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.getAttribute("data-id");
        const select = document.querySelector(`.status-select[data-id="${id}"]`);
        const newStatus = select.value;

        try {
          const res = await fetch(`${API_URL}/admin/transactions/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role: currentUser.role,
              adminUsername: currentUser.username,
              status: newStatus
            })
          });
          if (res.ok) {
            alert("Cập nhật trạng thái thành công!");
            loadTransactions();
          } else {
            const data = await res.json();
            alert(data.message || "Lỗi cập nhật");
          }
        } catch(err) {
           alert("Lỗi Server");
        }
      });
    });
  }

  async function loadTransactions() {
    try {
      const response = await fetch(`${API_URL}/admin/transactions?role=${currentUser.role}`);
      if (!response.ok) throw new Error("Lỗi tải danh sách giao dịch");
      allTransactionsCache = await response.json();
      filterAndRenderTransactions();
    } catch (error) {
      console.error(error);
    }
  }

  loadTransactions();
});


