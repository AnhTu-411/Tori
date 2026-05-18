/* HƯỚNG DẪN SỬ DỤNG NHANH

1. Dùng trực tiếp trên HTML (applyRoutes):

  -Tạo link chuyển trang bình thường (Dùng cho thẻ <a>):
    <a data-route="home">Về trang chủ</a>
    <a data-route="login">Đăng nhập ngay</a>

  -Tạo link chuyển trang CÓ TRUYỀN THAM SỐ (Dùng cho thẻ <a>):
    <a data-route="storyDetail" data-param-id="101" data-param-chapter="5">
      Đọc tiếp Chương 5
    </a>

  -Chuyển trang khi click Nút bấm (Dùng cho <button> hoặc thẻ <div>):
    <button data-route-click="recharge" class="button-general">Nạp Tiền</button>

    <div class="story-card" data-route-click="storyDetail" data-param-id="99">
      ...nội dung card...
    </div>

  -Hiển thị hình ảnh (Dùng cho thẻ <img>, thay src):
    <img data-asset="logo" alt="Tori Logo" class="header-logo" />
    <img data-asset="vnpayQr" alt="Mã VNPAY" />


2. Dùng bên trong file JavaScript (ToriRoutes):

  -ToriRoutes.go(): chuyển hướng người dùng, ví dụ:

    function handleLoginSubmit() {
      const isSuccess = checkLoginLogic(); // Hàm kiểm tra mật khẩu ví dụ

      if (isSuccess) {
          alert("Đăng nhập thành công!");
          // Người dùng về trang chủ
          ToriRoutes.go("home");      <------
      } else {
          alert("Sai mật khẩu, vui lòng thử lại!");
      }
    }

  -ToriRoutes.href(): Lấy ra chuỗi đường dẫn, dùng khi bạn cần tạo link động để gắn vào giao diện:

    const stories = [{ id: 1, name: "Truyện A" }, { id: 2, name: "Truyện B" }];
    const container = document.getElementById("story-list-container");

    stories.forEach(story => {
      // Tự động sinh ra dạng: "../../pages/stories/Story_Detail.html?id=1"
      const linkDetail = ToriRoutes.href("storyDetail", { id: story.id });      <------

      container.innerHTML += `
        <div class="story-item">
            <h3>${story.name}</h3>
            <a href="${linkDetail}">Đọc truyện</a>
        </div>
      `;
    });

  -ToriRoutes.asset(): Lấy đường dẫn ảnh động, ví dụ dùng khi đổi ảnh nền, đổi logo khi thay đổi giao diện Sáng/Tối:

    function toggleDarkMode() {
      const body = document.body;
      body.classList.toggle("dark-theme");

      const logoImg = document.querySelector('.logo img');

      if (body.classList.contains("dark-theme")) {
          logoImg.src = ToriRoutes.asset("logoDark");     <-----
      } else {
          logoImg.src = ToriRoutes.asset("logo");         <-----
      }
    }


*/

(function () {
  
  // Các đường dẫn tính từ thư mục gốc (Tori/).
  const ROUTES = {
    home: "index.html",
    login: "pages/auth/Login.html",
    signup: "pages/auth/Signup.html",
    passwordRecover: "pages/auth/Password_Recover.html",
    storyList: "pages/stories/Story_List.html",
    selfWritten: "pages/stories/Self-written_LightNovel.html",
    storyDetail: "pages/stories/Story_Detail.html",
    reading: "pages/stories/Reading.html",
    bookshelf: "pages/shelf/Bookshelf.html",
    cart: "pages/payment/Cart.html",
    recharge: "pages/payment/Recharge.html",
  };

  // Đường dẫn ảnh
  const ASSETS = {
    logo: "assets/images/Tori_Logo_Transparent.png",
    bankQr: "assets/images/Bank_QR.jpg",
    vnpayQr: "assets/images/VNPAY_QR.jpg",
  };

  // Hàm tính toán điểm gốc
  function rootPrefix() {
    const pathname = window.location.pathname.replace(/\\/g, "/");
    // (Có: pages -> auth -> Login.html), => nếu phát hiện chữ "/pages/" thì
    // lùi thẳng 2 cấp "../../" là về đến thư mục gốc.
    return pathname.includes("/pages/") ? "../../" : "";
  }

  // Hàm tạo Query String (Tham số trên URL)
  function buildQuery(params) {
    if (!params) return ""; // Nếu không có tham số

    // Tạo đối tượng URLSearchParams để xử lý chuỗi truy vấn (ví dụ: ?id=1&chap=2)
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      // Chỉ gắn những tham số có giá trị thực tế
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, value);
      }
    });

    const query = searchParams.toString();
    return query ? `?${query}` : ""; // Kết quả ví dụ: "?key1=value1&key2=value2"
  }

  // Hàm sinh ra đường dẫn đầy đủ cho 1 trang
  function href(routeName, params) {
    const route = ROUTES[routeName]; // Lấy link tĩnh từ danh sách đường dẫn
    if (!route) {
      throw new Error(`Unknown route: ${routeName}`); // Nếu gõ sai tên route
    }

    // Ghép: Lùi thư mục (nếu cần) + Đường dẫn tĩnh + Tham số (nếu có)
    return `${rootPrefix()}${route}${buildQuery(params)}`;
  }

  // Hàm sinh ra đường dẫn đầy đủ cho 1 ảnh
  function asset(assetName) {
    const assetPath = ASSETS[assetName];
    if (!assetPath) {
      throw new Error(`Unknown asset: ${assetName}`);
    }

    // Ghép nối: Lùi thư mục + Đường dẫn tĩnh của ảnh
    return `${rootPrefix()}${assetPath}`;
  }

  // Hàm chuyển hướng bằng JS (dành cho button)
  function go(routeName, params) {
    window.location.href = href(routeName, params);
  }

  // Hàm đọc tham số từ thuộc tính HTML
  // Ví dụ thẻ có data-param-story-id="123" sẽ được hàm này đọc thành { storyId: "123" }
  function readDatasetParams(element) {
    const params = {};
    Object.entries(element.dataset).forEach(([key, value]) => {
      // Bỏ qua các thuộc tính không bắt đầu bằng "param"
      if (!key.startsWith("param")) return;

      // Cắt bỏ chữ "param", ví dụ "paramStoryId" thành "StoryId"
      const rawName = key.slice("param".length);
      // Chữ cái đầu viết thường lại, thành "storyId"
      const paramName = rawName.charAt(0).toLowerCase() + rawName.slice(1);
      params[paramName] = value; // Lưu vào Object params
    });
    return params;
  }

  // Hàm tự động gắn link vào HTML
  function applyRoutes(root = document) {
    // Quét tất cả thẻ có thuộc tính data-route
    root.querySelectorAll("[data-route]").forEach((element) => {
      // Tự động set href cho thẻ <a> bằng hàm tính toán ở trên
      element.href = href(element.dataset.route, readDatasetParams(element));
    });

    // Quét tất cả thẻ có thuộc tính data-route-click
    root.querySelectorAll("[data-route-click]").forEach((element) => {
      // Thêm sự kiện Click để chuyển trang bằng JS
      element.addEventListener("click", () => {
        go(element.dataset.routeClick, readDatasetParams(element));
      });
    });

    // Quét tất cả thẻ có thuộc tính data-asset
    root.querySelectorAll("[data-asset]").forEach((element) => {
      // Tự động set src cho thẻ ảnh
      element.src = asset(element.dataset.asset);
    });
  }

  // Export các hàm này ra toàn cục để có thể gọi ở file JS khác
  window.ToriRoutes = {
    href,
    asset,
    go,
    applyRoutes,
  };
  globalThis.ToriRoutes = window.ToriRoutes;

  // Kích hoạt tự động khi trang web tải xong HTML
  document.addEventListener("DOMContentLoaded", () => {
    applyRoutes();
  });
})();
