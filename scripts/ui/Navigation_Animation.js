//Hàm xử lý trượt thanh truyện nổi bật
function slideCarousel(direction) {
  const container = document.getElementById("story-list-container");

  //Đo chiều rộng hiển thị hiện tại của khung truyện
  const scrollAmount = container.clientWidth;

  //Trượt qua trái (-1) hoặc phải (1) với khoảng cách bằng đúng 1 khung hiển thị
  container.scrollBy({
    left: direction * scrollAmount,
    behavior: "smooth",
  });
}
