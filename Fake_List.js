const newUpdateStories = [];
for (let i = 1; i <= 12; i++) {
  newUpdateStories.push({
    id: i + 100,
    title: `The NOexistenceN of you AND me ${i}`,
    uploader: "Lilith",
    words: (i * 1000 + 105).toLocaleString(), //chx có giữ liệu nên ngẫu nhiên độ dài
    desc: "It is a short, narrative-driven experience (approx. 2-4 hours) where the protagonist is visited by a girl named Lilith, navigating themes of identity, memory, and existential solitude through hundreds of choices.",
    chapter: `Chương ${i}`,
    vol: "Khởi đầu",
    cover: `https://e.snmc.io/lk/g/x/f774c4f552108707c2fefae2df265fb3/14225110`,
  });
}

const itemsPerPage = 10; //Giới hạn 10 truyện
let currentListPage = 1;

//Hàm render danh sách truyện theo trang
function renderUpdateList(page) {
  const container = document.getElementById("new-updates-container");

  //thuật toán cắt mảng
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const itemsToShow = newUpdateStories.slice(startIndex, endIndex);

  let html = "";
  for (let i = 0; i < itemsToShow.length; i++) {
    const story = itemsToShow[i];
    html += `
          <a href="Story_Detail.html?id=${story.id}" style="text-decoration: none;">
            <div class="update-item">
                <div class="update-cover">
                    <img src="${story.cover}" alt="Bìa">
                </div>
                <div class="update-info">
                    <div class="update-title">${story.title}</div>
                    <div class="update-meta">
                        <span>Người đăng: <strong>${story.uploader}</strong></span>
                        <span>Số từ: <strong>${story.words}</strong></span>
                    </div>
                    <div class="update-desc">${story.desc}</div>
                    <div class="update-chapter">${story.chapter}<span class="update-vol">${story.vol}</span></div>
                </div>
            </div>
          </a>
        `;
  }
  container.innerHTML = html;

  //Gọi hàm vẽ nút phân trang sau khi vẽ xong truyện
  renderPagination();
}

//Hàm vẽ nút chuyển trang
function renderPagination() {
  const container = document.getElementById("pagination-container");

  // Tính tổng số trang
  const totalPages = Math.ceil(newUpdateStories.length / itemsPerPage);

  //nếu tổng số trang là 1 || 0 thì không hiện nút
  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  //thêm on click cho đầu nút
  let html = `<span onclick="changeListPage(1)" style="color: #2b70a1; font-size: 13px; font-weight: bold; margin-right: 10px; cursor: pointer;">Đầu</span>`;

  //Vẽ từng nút bấm tương ứng với số trang
  for (let i = 1; i <= totalPages; i++) {
    const isActive = i === currentListPage ? "active" : "";
    html += `<button class="page-btn ${isActive}" onclick="changeListPage(${i})">${i}</button>`;
  }

  //Thêm on clo=ick cho nút cuối
  html += `<span onclick="changeListPage(${totalPages})" style="color: #2b70a1; font-size: 13px; font-weight: bold; margin-left: 10px; cursor: pointer;">Cuối</span>`;

  container.innerHTML = html;
}
//hàm xử lý khi bấm sang trang
function changeListPage(page) {
  currentListPage = page;
  renderUpdateList(page); //Vẽ lại truyện
}

//Kích hoạt hàm lần đầu tiên khi web vừa tải xong
renderUpdateList(1);
