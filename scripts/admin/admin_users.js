document.addEventListener("DOMContentLoaded", async () => {
  const API_URL = "http://localhost:5000/api";
  const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));

  if (!currentUser || currentUser.role !== "owner") {
    alert("Bạn không có quyền truy cập khu vực này!");
    window.location.href = "../../index.html";
    return;
  }

  // Hiện tab Quản lý Tài Khoản trên Sidebar
  document.getElementById("menu-users").style.display = "block";

  const tbody = document.getElementById("users-table-body");
  const modal = document.getElementById("edit-user-modal");
  
  let currentEditUserId = null;

  async function loadUsers() {
    try {
      const response = await fetch(`${API_URL}/owner/users?role=${currentUser.role}`);
      if (!response.ok) throw new Error("Lỗi tải danh sách người dùng");
      const users = await response.json();

      tbody.innerHTML = "";
      users.forEach((user) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${user._id.substring(0, 6)}...</td>
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>
             <span class="role-badge ${user.role}">${user.role}</span>
          </td>
          <td>${user.coins} <i class="fa-solid fa-coins" style="color: gold;"></i></td>
          <td>
            <button class="btn btn-primary btn-edit" data-id="${user._id}" data-role="${user.role}" data-coins="${user.coins}">Sửa</button>
            <button class="btn btn-danger btn-delete" data-id="${user._id}" ${user.role === 'owner' ? 'disabled' : ''}>Xóa</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Events cho nút
      document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", (e) => {
          currentEditUserId = e.target.getAttribute("data-id");
          document.getElementById("edit-user-role").value = e.target.getAttribute("data-role");
          document.getElementById("edit-user-coins").value = e.target.getAttribute("data-coins");
          document.getElementById("edit-user-password").value = "";
          modal.style.display = "flex";
        });
      });

      document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.getAttribute("data-id");
          if (confirm("Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này không?")) {
            try {
              const res = await fetch(`${API_URL}/owner/users/${id}?role=${currentUser.role}&ownerUsername=${currentUser.username}`, {
                method: "DELETE"
              });
              if (res.ok) {
                alert("Xóa thành công!");
                loadUsers();
              } else {
                const errorData = await res.json();
                alert(errorData.message);
              }
            } catch(err) {
              alert("Lỗi Server");
            }
          }
        });
      });

    } catch (error) {
      console.error(error);
    }
  }

  // Modal actions
  document.getElementById("close-modal-btn").addEventListener("click", () => {
    modal.style.display = "none";
  });

  document.getElementById("save-user-btn").addEventListener("click", async () => {
    if (!currentEditUserId) return;
    const role = document.getElementById("edit-user-role").value;
    const coins = document.getElementById("edit-user-coins").value;
    const newPassword = document.getElementById("edit-user-password").value;

    try {
      const response = await fetch(`${API_URL}/owner/users/${currentEditUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ownerUsername: currentUser.username,
          role: currentUser.role,
          targetRole: role,
          coins: Number(coins),
          newPassword: newPassword
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert("Cập nhật thành công!");
        modal.style.display = "none";
        loadUsers();
      } else {
        alert(data.message || "Lỗi cập nhật!");
      }
    } catch(err) {
      alert("Lỗi Server");
    }
  });

  // Create User logic
  const createModal = document.getElementById("create-user-modal");
  
  document.getElementById("add-user-btn").addEventListener("click", () => {
    document.getElementById("create-username").value = "";
    document.getElementById("create-email").value = "";
    document.getElementById("create-password").value = "";
    document.getElementById("create-role").value = "user";
    document.getElementById("create-coins").value = "0";
    createModal.style.display = "flex";
  });

  document.getElementById("close-create-modal-btn").addEventListener("click", () => {
    createModal.style.display = "none";
  });

  document.getElementById("submit-create-user-btn").addEventListener("click", async () => {
    const username = document.getElementById("create-username").value.trim();
    const email = document.getElementById("create-email").value.trim();
    const password = document.getElementById("create-password").value;
    const role = document.getElementById("create-role").value;
    const coins = document.getElementById("create-coins").value;

    if (!username || !email || !password) {
      alert("Vui lòng nhập đủ thông tin (Tên, Email, Mật khẩu)!");
      return;
    }

    const submitBtn = document.getElementById("submit-create-user-btn");
    submitBtn.disabled = true;
    submitBtn.innerText = "Đang xử lý...";

    try {
      const response = await fetch(`${API_URL}/owner/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ownerUsername: currentUser.username,
          role: currentUser.role,
          username: username,
          email: email,
          password: password,
          targetRole: role,
          coins: Number(coins)
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert("Tạo tài khoản thành công!");
        createModal.style.display = "none";
        loadUsers();
      } else {
        alert(data.message || "Lỗi tạo tài khoản!");
      }
    } catch(err) {
      alert("Lỗi Server");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = "Tạo mới";
    }
  });

  loadUsers();
});
