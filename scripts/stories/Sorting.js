function sortStories(order) {
  let sortedArray = [...mockStories]; // Tạo bản sao để không làm mất gốc

  if (order === "az") {
    // A-Z
    sortedArray.sort((a, b) => a.title.localeCompare(b.title, "vi"));
  } else if (order === "za") {
    // Z-A
    sortedArray.sort((a, b) => b.title.localeCompare(a.title, "vi"));
  }

  // Vẽ lại truyện
  renderStories(sortedArray);
}

// Kích hoạt vẽ lần đầu khi mở trang Web
document.addEventListener("DOMContentLoaded", () => {
  renderStories(mockStories);
});
