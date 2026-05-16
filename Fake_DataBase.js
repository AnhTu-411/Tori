//Tạo dữ mock data
const mockStories = [
  {
    id: 1,
    title: "Gimai Seikatsu",
    coverUrl:
      "https://upload.wikimedia.org/wikipedia/vi/1/1a/Gimai_Seikatsu_JP_Volume_1.png",
    author: "Mikawa Ghost",
    status: "Đang tiến hành",
    tags: ["Comedy", "Romance", "School Life", "Slice of Life"],
    words: (Math.floor(Math.random() * 10) * 1000 + 105).toLocaleString(),
    views: Math.floor(Math.random() * 10),
    summary:
      "Asamura Yuuta, một học sinh cao trung bắt đầu sống cùng dưới một mái nhà với cô nữ sinh đẹp nhất khối- Ayase Saki dưới danh nghĩa anh em sau khi bố mẹ cả hai quyết định tái hôn. Chứng kiến cảnh bất hòa giữa hai vị phụ huynh trước kia của mình, cả hai người đều có những định kiến chẳng mấy tốt đẹp gì đối với mối quan hệ nam nữ. Sau đó, Yuuta và Saki đã thiết lập nên một lời hứa rằng không ai được phép quá xa, cũng không được phép bất hòa, chỉ giữ khoảng cách cần thiết trong mối quan hệ của cả hai.",
  },
  {
    id: 2,
    title: "Otonari no Tenshi-sama ",
    coverUrl:
      "https://upload.wikimedia.org/wikipedia/vi/thumb/1/19/The_Angel_Next_Door_Spoils_Me_Rotten_volume_1_cover.tiff/lossy-page1-250px-The_Angel_Next_Door_Spoils_Me_Rotten_volume_1_cover.tiff.jpg",
    author: "Saekisan",
    status: "Đang tiến hành",
    tags: ["Comedy", "Romance", "School Life", "Slice of Life"],
    words: (Math.floor(Math.random() * 10) * 1000 + 105).toLocaleString(),
    views: Math.floor(Math.random() * 10),
    summary:
      "Asamura Yuuta, một học sinh cao trung bắt đầu sống cùng dưới một mái nhà với cô nữ sinh đẹp nhất khối- Ayase Saki dưới danh nghĩa anh em sau khi bố mẹ cả hai quyết định tái hôn. Chứng kiến cảnh bất hòa giữa hai vị phụ huynh trước kia của mình, cả hai người đều có những định kiến chẳng mấy tốt đẹp gì đối với mối quan hệ nam nữ. Sau đó, Yuuta và Saki đã thiết lập nên một lời hứa rằng không ai được phép quá xa, cũng không được phép bất hòa, chỉ giữ khoảng cách cần thiết trong mối quan hệ của cả hai.",
  },
  {
    id: 3,
    title: "The Detective Is Already Dead",
    coverUrl:
      "https://upload.wikimedia.org/wikipedia/en/f/fd/The_Detective_Is_Already_Dead_light_novel_volume_1_cover.jpg",
    author: "Nigojū",
    status: "Đang tiến hành",
    tags: ["Comedy", "Romance", "School Life", "Slice of Life"],
    words: (Math.floor(Math.random() * 10) * 1000 + 105).toLocaleString(),
    views: Math.floor(Math.random() * 10),
    summary:
      "Asamura Yuuta, một học sinh cao trung bắt đầu sống cùng dưới một mái nhà với cô nữ sinh đẹp nhất khối- Ayase Saki dưới danh nghĩa anh em sau khi bố mẹ cả hai quyết định tái hôn. Chứng kiến cảnh bất hòa giữa hai vị phụ huynh trước kia của mình, cả hai người đều có những định kiến chẳng mấy tốt đẹp gì đối với mối quan hệ nam nữ. Sau đó, Yuuta và Saki đã thiết lập nên một lời hứa rằng không ai được phép quá xa, cũng không được phép bất hòa, chỉ giữ khoảng cách cần thiết trong mối quan hệ của cả hai.",
  },
  {
    id: 4,
    title: "Spice and Wolf ",
    coverUrl:
      "https://upload.wikimedia.org/wikipedia/en/c/cc/Ookamitokoshinryo01.jpg",
    author: "Isuna Hasekura",
    status: "Đang tiến hành",
    tags: ["Comedy", "Romance", "School Life", "Slice of Life"],
    words: (Math.floor(Math.random() * 10) * 1000 + 105).toLocaleString(),
    views: Math.floor(Math.random() * 10),
    summary:
      "Asamura Yuuta, một học sinh cao trung bắt đầu sống cùng dưới một mái nhà với cô nữ sinh đẹp nhất khối- Ayase Saki dưới danh nghĩa anh em sau khi bố mẹ cả hai quyết định tái hôn. Chứng kiến cảnh bất hòa giữa hai vị phụ huynh trước kia của mình, cả hai người đều có những định kiến chẳng mấy tốt đẹp gì đối với mối quan hệ nam nữ. Sau đó, Yuuta và Saki đã thiết lập nên một lời hứa rằng không ai được phép quá xa, cũng không được phép bất hòa, chỉ giữ khoảng cách cần thiết trong mối quan hệ của cả hai.",
  },
  {
    id: 5,
    title: "The Eminence in Shadow",
    coverUrl:
      "https://upload.wikimedia.org/wikipedia/en/2/2c/The_Eminence_in_Shadow_light_novel_volume_1_cover.jpg",
    author: "Daisuke Aizawa",
    status: "Đang tiến hành",
    tags: ["Comedy", "Romance", "School Life", "Slice of Life"],
    words: (Math.floor(Math.random() * 10) * 1000 + 105).toLocaleString(),
    views: Math.floor(Math.random() * 10),
    summary:
      "Asamura Yuuta, một học sinh cao trung bắt đầu sống cùng dưới một mái nhà với cô nữ sinh đẹp nhất khối- Ayase Saki dưới danh nghĩa anh em sau khi bố mẹ cả hai quyết định tái hôn. Chứng kiến cảnh bất hòa giữa hai vị phụ huynh trước kia của mình, cả hai người đều có những định kiến chẳng mấy tốt đẹp gì đối với mối quan hệ nam nữ. Sau đó, Yuuta và Saki đã thiết lập nên một lời hứa rằng không ai được phép quá xa, cũng không được phép bất hòa, chỉ giữ khoảng cách cần thiết trong mối quan hệ của cả hai.",
  },
  {
    id: 6,
    title: "Alya Sometimes Hides Her Feelings in Russian",
    coverUrl:
      "https://upload.wikimedia.org/wikipedia/en/5/59/Roshidere_light_novel_volume_1_cover.jpg",
    author: "SunSunSun",
    status: "Đang tiến hành",
    tags: ["Comedy", "Romance", "School Life", "Slice of Life"],
    words: (Math.floor(Math.random() * 10) * 1000 + 105).toLocaleString(),
    views: Math.floor(Math.random() * 10),
    summary:
      "Asamura Yuuta, một học sinh cao trung bắt đầu sống cùng dưới một mái nhà với cô nữ sinh đẹp nhất khối- Ayase Saki dưới danh nghĩa anh em sau khi bố mẹ cả hai quyết định tái hôn. Chứng kiến cảnh bất hòa giữa hai vị phụ huynh trước kia của mình, cả hai người đều có những định kiến chẳng mấy tốt đẹp gì đối với mối quan hệ nam nữ. Sau đó, Yuuta và Saki đã thiết lập nên một lời hứa rằng không ai được phép quá xa, cũng không được phép bất hòa, chỉ giữ khoảng cách cần thiết trong mối quan hệ của cả hai.",
  },
  {
    id: 7,
    title: "I Made Friends with the Second Prettiest Girl in My Class",
    coverUrl:
      "https://upload.wikimedia.org/wikipedia/en/d/d5/Class_de_2-ban_Me_ni_Kawaii_Onna_no_Ko_to_Tomodachi_ni_Natta_LN_volume_1.jpg",
    author: "Takata",
    status: "Đang tiến hành",
    tags: ["Comedy", "Romance", "School Life", "Slice of Life"],
    words: (Math.floor(Math.random() * 10) * 1000 + 105).toLocaleString(),
    views: Math.floor(Math.random() * 10),
    summary:
      "Asamura Yuuta, một học sinh cao trung bắt đầu sống cùng dưới một mái nhà với cô nữ sinh đẹp nhất khối- Ayase Saki dưới danh nghĩa anh em sau khi bố mẹ cả hai quyết định tái hôn. Chứng kiến cảnh bất hòa giữa hai vị phụ huynh trước kia của mình, cả hai người đều có những định kiến chẳng mấy tốt đẹp gì đối với mối quan hệ nam nữ. Sau đó, Yuuta và Saki đã thiết lập nên một lời hứa rằng không ai được phép quá xa, cũng không được phép bất hòa, chỉ giữ khoảng cách cần thiết trong mối quan hệ của cả hai.",
  },
  {
    id: 8,
    title: "Re:Zero",
    coverUrl:
      "https://upload.wikimedia.org/wikipedia/en/3/3c/Re-Zero_kara_Hajimeru_Isekai_Seikatsu_light_novel_volume_1_cover.jpg",
    author: "Tappei Nagatsuki",
    status: "Đang tiến hành",
    tags: ["Comedy", "Romance", "School Life", "Slice of Life"],
    words: (Math.floor(Math.random() * 10) * 1000 + 105).toLocaleString(),
    views: Math.floor(Math.random() * 10),
    summary:
      "Asamura Yuuta, một học sinh cao trung bắt đầu sống cùng dưới một mái nhà với cô nữ sinh đẹp nhất khối- Ayase Saki dưới danh nghĩa anh em sau khi bố mẹ cả hai quyết định tái hôn. Chứng kiến cảnh bất hòa giữa hai vị phụ huynh trước kia của mình, cả hai người đều có những định kiến chẳng mấy tốt đẹp gì đối với mối quan hệ nam nữ. Sau đó, Yuuta và Saki đã thiết lập nên một lời hứa rằng không ai được phép quá xa, cũng không được phép bất hòa, chỉ giữ khoảng cách cần thiết trong mối quan hệ của cả hai.",
  },
];
//hàm render truyện
function renderStories(storiesArray) {
  const container = document.getElementById("story-list-container");
  if (!container) return; // Nếu không tìm thấy khung chứa thì bỏ qua

  let htmlContent = "";
  for (let i = 0; i < storiesArray.length; i++) {
    const story = storiesArray[i];
    htmlContent += `
      <a href="Story_Detail.html?id=${story.id}" class="story-card" style="text-decoration: none; display: block;">
        <img src="${story.coverUrl}" alt="Bìa truyện ${story.title}">
        <div class="story-info">
          <h3 class="story-title">${story.title}</h3>
          <p class="story-author">Tác giả: ${story.author}</p>
        </div>
      </a>
      `;
  }
  container.innerHTML = htmlContent;
}

//hàm sắp xếp tiêu đề truyện
function sortStories(order) {
  let sortedArray = [...mockStories]; // Tạo bản sao để không làm mất gốc

  if (order === "az") {
    //A-Z
    sortedArray.sort((a, b) => a.title.localeCompare(b.title, "vi"));
  } else if (order === "za") {
    //Z-A
    sortedArray.sort((a, b) => b.title.localeCompare(a.title, "vi"));
  }

  //vẽ lại truyện sau khi đã sapws xếp
  renderStories(sortedArray);
}

//kích hoạt vẽ lần đầu khi mở trang web
document.addEventListener("DOMContentLoaded", () => {
  renderStories(mockStories);
});

//hàm xử lý trang chi tiết truyện

function loadStoryDetail() {
  const detailContainer = document.getElementById("story-detail-container");

  //dừng lại nếu không có container
  if (!detailContainer) return;

  // Lấy ID từ trên đường link
  const urlParams = new URLSearchParams(window.location.search);
  const storyId = parseInt(urlParams.get("id"));

  //tìm truyện có data base trùng vs id
  const story = mockStories.find((s) => s.id === storyId);

  //nếu nhập sai id thì không tồn tại
  if (!story) {
    detailContainer.innerHTML = `<h2 style="text-align: center; color: red;">Không tìm thấy truyện!</h2>`;
    return;
  }

  //đổi tên tab
  document.title = story.title + " - Tori Lightnovel";

  //tạo tag
  let tagsHtml = "";
  if (story.tags) {
    for (let i = 0; i < story.tags.length; i++) {
      tagsHtml += `<span class="tag-badge">${story.tags[i]}</span>`;
    }
  }

  //html trang chi tiết truyện
  const htmlContent = `
    <div class="story-detail-header">
      <div class="detail-cover">
        <img src="${story.coverUrl}" alt="Bìa truyện">
      </div>
      
      <div class="detail-info">
        <h1 class="detail-title">${story.title}</h1>
        <div class="detail-tags">${tagsHtml}</div>
        
        <p class="detail-meta"><strong>Tác giả:</strong> ${story.author}</p>
        <p class="detail-meta"><strong>Tình trạng:</strong> ${story.status || "Đang tiến hành"}</p>
        
        <div class="detail-actions">
          <div class="action-item"><span>♡</span><p></p></div>
          <div class="action-item"><span style="color: gold;">☆</span><p></p></div>
          <div class="action-item"><span>☰</span><p></p></div>
          <div class="action-item"><span>✎</span><p></p></div>
        </div>

        <div class="detail-stats">
          <div><p>Số từ</p><strong>${story.words || "0"}</strong></div>
          <div><p>Đánh giá</p><strong>0 / 0</strong></div>
          <div><p>Lượt xem</p><strong>${story.views || "0"}</strong></div>
        </div>
      </div>
    </div>

    <div class="story-summary-box">
      <h3>Tóm tắt</h3>
      <p>${story.summary || "Chưa có tóm tắt cho truyện này."}</p>
    </div>
  `;

  //
  detailContainer.innerHTML = htmlContent;
}

//kích hoạt hàm khi load trang
document.addEventListener("DOMContentLoaded", () => {
  loadStoryDetail();
});
