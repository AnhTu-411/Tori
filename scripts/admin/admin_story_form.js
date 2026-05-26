const API_URL = "http://localhost:5000/api";
let currentStoryId = null;

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
  const urlParams = new URLSearchParams(window.location.search);
  currentStoryId = urlParams.get("id");

  if (currentStoryId) {
    document.getElementById("form-title").innerText = "Sửa Thông Tin Truyện";
    fetchStoryDetails(currentStoryId);
  }

  // Preview ảnh bìa
  const coverInput = document.getElementById("coverImg");
  const previewImg = document.getElementById("cover-preview");
  coverInput.addEventListener("input", (e) => {
    if (e.target.value) {
      previewImg.src = e.target.value;
      previewImg.style.display = "block";
    } else {
      previewImg.style.display = "none";
    }
  });

  const isPremiumCheckbox = document.getElementById("isPremium");
  const priceGroup = document.getElementById("price-group");
  if (isPremiumCheckbox && priceGroup) {
    isPremiumCheckbox.addEventListener("change", (e) => {
      priceGroup.style.display = e.target.checked ? "block" : "none";
    });
  }

  document.getElementById("story-form").addEventListener("submit", saveStory);
});

async function fetchStoryDetails(id) {
  try {
    const response = await fetch(`${API_URL}/stories/${id}`);
    if (!response.ok) throw new Error("Lỗi khi tải chi tiết truyện");
    const story = await response.json();

    document.getElementById("title").value = story.title;
    document.getElementById("author").value = story.author;
    document.getElementById("coverImg").value = story.coverImg || "";
    document.getElementById("status").value = story.status || "Đang tiến hành";
    document.getElementById("genres").value = story.genres ? story.genres.join(", ") : "";
    document.getElementById("description").value = story.description || "";
    
    document.getElementById("isPremium").checked = story.isPremium || false;
    document.getElementById("price").value = story.price || 0;
    if (story.isPremium) {
      document.getElementById("price-group").style.display = "block";
    }

    if (story.coverImg) {
      const previewImg = document.getElementById("cover-preview");
      previewImg.src = story.coverImg;
      previewImg.style.display = "block";
    }
  } catch (error) {
    console.error(error);
    alert("Không thể tải thông tin truyện!");
  }
}

async function saveStory(e) {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const coverImg = document.getElementById("coverImg").value.trim();
  const status = document.getElementById("status").value;
  const description = document.getElementById("description").value.trim();
  const genresInput = document.getElementById("genres").value.trim();
  const genres = genresInput ? genresInput.split(",").map(g => g.trim()) : [];
  const isPremium = document.getElementById("isPremium").checked;
  const price = parseInt(document.getElementById("price").value) || 0;

  const payload = {
    title,
    author,
    coverImg,
    status,
    description,
    genres,
    isPremium,
    price
  };

  const currentUser = JSON.parse(localStorage.getItem("tori_current_user"));
  if (currentUser && currentUser.role === "publisher") {
    payload.publisherId = currentUser._id;
  }
  
  if (currentUser) {
    payload.role = currentUser.role;
    payload.adminUsername = currentUser.username;
  }

  try {
    let response;
    if (currentStoryId) {
      // Gọi API PUT để cập nhật
      response = await fetch(`${API_URL}/stories/${currentStoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } else {
      // Gọi API POST để thêm mới
      response = await fetch(`${API_URL}/stories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }

    if (response.ok) {
      alert(currentStoryId ? "Cập nhật truyện thành công!" : "Thêm truyện thành công!");
      window.location.href = "Admin_Stories.html";
    } else {
      const data = await response.json();
      alert("Lỗi: " + data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Lỗi kết nối đến máy chủ!");
  }
}

