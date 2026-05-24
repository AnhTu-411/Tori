document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  
  if (!currentUser) {
    alert("Vui lòng đăng nhập để có thể nộp đơn Đăng ký Nhà Xuất Bản!");
    window.location.href = "login.html";
    return;
  }

  if (currentUser.role === "publisher" || currentUser.role === "admin") {
    alert("Tài khoản của bạn đã có sẵn quyền Nhà Xuất Bản hoặc cao hơn rồi!");
    window.location.href = "../../index.html";
    return;
  }

  document.getElementById("publisher-register-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const reason = document.getElementById("reason").value.trim();

    if (!reason) {
      alert("Vui lòng nhập lý do!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/publisher-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser.username,
          reason: reason
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert("Đã gửi đơn đăng ký thành công! Vui lòng chờ Admin phê duyệt.");
        window.location.href = "../../index.html";
      } else {
        alert("Lỗi: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Không thể kết nối đến máy chủ.");
    }
  });
});
