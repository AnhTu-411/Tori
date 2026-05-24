function sortStories(order) {
  // Sử dụng currentStories từ biến toàn cục đã được load từ DB
  if (typeof currentStories === "undefined") return;

  let sortedArray = [...currentStories]; 

  if (order === "az") {
    // A-Z
    sortedArray.sort((a, b) => a.title.localeCompare(b.title, "vi"));
  } else if (order === "za") {
    // Z-A
    sortedArray.sort((a, b) => b.title.localeCompare(a.title, "vi"));
  }

  // Gọi hàm render tuỳ theo trang hiện tại đang xài hàm nào
  if (typeof renderStories === "function") {
    // Nếu ở trang Story_List
    renderStories(sortedArray);
  } else if (typeof renderCarousel === "function") {
    // Nếu ở trang Home (index)
    renderCarousel(sortedArray);
  }
}
