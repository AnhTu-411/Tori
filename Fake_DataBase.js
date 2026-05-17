// Dữ liệ fake
const mockStories = [
  {
    id: 1,
    title: "Gimai Seikatsu",
    coverUrl:
      "https://upload.wikimedia.org/wikipedia/vi/1/1a/Gimai_Seikatsu_JP_Volume_1.png",
    author: "Mikawa Ghost",
    status: "Đang tiến hành",
    tags: ["Comedy", "Romance", "School Life", "Slice of Life"],
    words: "8,105",
    views: 125,
    summary:
      "Asamura Yuuta, một học sinh cao trung bắt đầu sống cùng dưới một mái nhà với cô nữ sinh đẹp nhất khối- Ayase Saki dưới danh nghĩa anh em sau khi bố mẹ cả hai quyết định tái hôn...",

    //dữ liệu giả của chương chuyện, etc
    volumes: [
      {
        volTitle: "Vol 1: Siêu hội trưởng và tên trợ lý không lương",
        volCover:
          "https://upload.wikimedia.org/wikipedia/vi/1/1a/Gimai_Seikatsu_JP_Volume_1.png",
        chapters: [
          {
            badge: "Mới",
            title: "Chương 1: Người mà tôi không nên thích",
            date: "14/05/2026",
            //nội dung test lấy từ chương 31 oregairu
            content: [
              "Thịch.",
              "Tiếng của trái bóng cam va xuống sàn gỗ của nhà thể chất. Trường cấp ba Hosoku đang bị dẫn hai điểm và tôi là người nhận trách nhiệm ném phạt khi thời gian trận đấu chỉ còn hai giây đếm ngược. Cả đội không còn lần gọi timeout nào và lượt ném phạt này của tôi là thứ quyết định xem cả ngôi trường này có thể đi vào trận chung kết hay không.",
              "Anh đội trưởng Kosaki vỗ mạnh vào lưng khi tôi bước lên vạch ném phạt. Mồ hôi anh nhễ nhại, thấm qua cả bộ đồng phục đang mặc. Những người đồng đội khác cũng bước lên, họ chỉ mỉm cười rồi vỗ nhẹ vào lưng tôi như một cách động viên.",
              "Hít một hơi thật sâu, tôi nhìn vào bảng rổ. Nhồi bóng thêm một nhịp. Ngay sau tiếng tuýt còi của trọng tài, tôi ngắm chuẩn mà ném.",
              "Cộp.",
              "Bóng đập bảng rồi va vào vành rổ và rơi xuống lưới. Một điểm tính, tỉ số hiện tại là 89-90. Những người đàn anh trong câu lạc bộ tiến đến và đập tay với tôi, hi vọng của cả bọn lại được thắp lên vào lúc này.",
            ],
          },
          {
            badge: "Mới",
            title: "Chương 2: Nanase Iwaki có phải là người ngoài hành tinh?",
            date: "15/05/2026",
            content: [
              "Đây là nội dung của chương 2... Nội dung sẽ thay đổi tự động dựa vào link URL!",
            ],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Otonari no Tenshi-sama",
    coverUrl:
      "https://upload.wikimedia.org/wikipedia/vi/thumb/1/19/The_Angel_Next_Door_Spoils_Me_Rotten_volume_1_cover.tiff/lossy-page1-250px-The_Angel_Next_Door_Spoils_Me_Rotten_volume_1_cover.tiff.jpg",
    author: "Saekisan",
    status: "Đang tiến hành",
    tags: ["Comedy", "Romance", "School Life", "Slice of Life"],
    words: (Math.floor(Math.random() * 10) * 1000 + 105).toLocaleString(),
    views: Math.floor(Math.random() * 10),
    summary:
      "Asamura Yuuta, một học sinh cao trung bắt đầu sống cùng dưới một mái nhà với cô nữ sinh đẹp nhất khối- Ayase Saki dưới danh nghĩa anh em sau khi bố mẹ cả hai quyết định tái hôn...",

    volumes: [
      {
        volTitle: "Vol 1: Siêu hội trưởng và tên trợ lý không lương",
        volCover:
          "https://upload.wikimedia.org/wikipedia/vi/thumb/1/19/The_Angel_Next_Door_Spoils_Me_Rotten_volume_1_cover.tiff/lossy-page1-250px-The_Angel_Next_Door_Spoils_Me_Rotten_volume_1_cover.tiff.jpg",
        chapters: [
          {
            badge: "Mới",
            title: "Chương 1: Người mà tôi không nên thích",
            date: "14/05/2026",

            content: [
              "Thịch.",
              "Tiếng của trái bóng cam va xuống sàn gỗ của nhà thể chất. Trường cấp ba Hosoku đang bị dẫn hai điểm và tôi là người nhận trách nhiệm ném phạt khi thời gian trận đấu chỉ còn hai giây đếm ngược. Cả đội không còn lần gọi timeout nào và lượt ném phạt này của tôi là thứ quyết định xem cả ngôi trường này có thể đi vào trận chung kết hay không.",
              "Anh đội trưởng Kosaki vỗ mạnh vào lưng khi tôi bước lên vạch ném phạt. Mồ hôi anh nhễ nhại, thấm qua cả bộ đồng phục đang mặc. Những người đồng đội khác cũng bước lên, họ chỉ mỉm cười rồi vỗ nhẹ vào lưng tôi như một cách động viên.",
              "Hít một hơi thật sâu, tôi nhìn vào bảng rổ. Nhồi bóng thêm một nhịp. Ngay sau tiếng tuýt còi của trọng tài, tôi ngắm chuẩn mà ném.",
              "Cộp.",
              "Bóng đập bảng rồi va vào vành rổ và rơi xuống lưới. Một điểm tính, tỉ số hiện tại là 89-90. Những người đàn anh trong câu lạc bộ tiến đến và đập tay với tôi, hi vọng của cả bọn lại được thắp lên vào lúc này.",
            ],
          },
          {
            badge: "Mới",
            title: "Chương 2: Nanase Iwaki có phải là người ngoài hành tinh?",
            date: "15/05/2026",
            content: [
              "Đây là nội dung của chương 2... Nội dung sẽ thay đổi tự động dựa vào link URL!",
            ],
          },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "he Detective Is Already Dead",
    coverUrl:
      "https://upload.wikimedia.org/wikipedia/en/f/fd/The_Detective_Is_Already_Dead_light_novel_volume_1_cover.jpg",
    author: "Nigojū",
    status: "Đang tiến hành",
    tags: ["Comedy", "Romance", "School Life", "Slice of Life"],
    words: (Math.floor(Math.random() * 10) * 1000 + 105).toLocaleString(),
    views: Math.floor(Math.random() * 10),
    summary:
      "Asamura Yuuta, một học sinh cao trung bắt đầu sống cùng dưới một mái nhà với cô nữ sinh đẹp nhất khối- Ayase Saki dưới danh nghĩa anh em sau khi bố mẹ cả hai quyết định tái hôn...",

    volumes: [
      {
        volTitle: "Vol 1: Siêu hội trưởng và tên trợ lý không lương",
        volCover:
          "https://upload.wikimedia.org/wikipedia/en/f/fd/The_Detective_Is_Already_Dead_light_novel_volume_1_cover.jpg",
        chapters: [
          {
            badge: "Mới",
            title: "Chương 1: Người mà tôi không nên thích",
            date: "14/05/2026",

            content: [
              "Thịch.",
              "Tiếng của trái bóng cam va xuống sàn gỗ của nhà thể chất. Trường cấp ba Hosoku đang bị dẫn hai điểm và tôi là người nhận trách nhiệm ném phạt khi thời gian trận đấu chỉ còn hai giây đếm ngược. Cả đội không còn lần gọi timeout nào và lượt ném phạt này của tôi là thứ quyết định xem cả ngôi trường này có thể đi vào trận chung kết hay không.",
              "Anh đội trưởng Kosaki vỗ mạnh vào lưng khi tôi bước lên vạch ném phạt. Mồ hôi anh nhễ nhại, thấm qua cả bộ đồng phục đang mặc. Những người đồng đội khác cũng bước lên, họ chỉ mỉm cười rồi vỗ nhẹ vào lưng tôi như một cách động viên.",
              "Hít một hơi thật sâu, tôi nhìn vào bảng rổ. Nhồi bóng thêm một nhịp. Ngay sau tiếng tuýt còi của trọng tài, tôi ngắm chuẩn mà ném.",
              "Cộp.",
              "Bóng đập bảng rồi va vào vành rổ và rơi xuống lưới. Một điểm tính, tỉ số hiện tại là 89-90. Những người đàn anh trong câu lạc bộ tiến đến và đập tay với tôi, hi vọng của cả bọn lại được thắp lên vào lúc này.",
            ],
          },
          {
            badge: "Mới",
            title: "Chương 2: Nanase Iwaki có phải là người ngoài hành tinh?",
            date: "15/05/2026",
            content: [
              "Đây là nội dung của chương 2... Nội dung sẽ thay đổi tự động dựa vào link URL!",
            ],
          },
        ],
      },
    ],
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
      "Asamura Yuuta, một học sinh cao trung bắt đầu sống cùng dưới một mái nhà với cô nữ sinh đẹp nhất khối- Ayase Saki dưới danh nghĩa anh em sau khi bố mẹ cả hai quyết định tái hôn...",

    volumes: [
      {
        volTitle: "Vol 1: Siêu hội trưởng và tên trợ lý không lương",
        volCover:
          "https://upload.wikimedia.org/wikipedia/en/c/cc/Ookamitokoshinryo01.jpg",
        chapters: [
          {
            badge: "Mới",
            title: "Chương 1: Người mà tôi không nên thích",
            date: "14/05/2026",

            content: [
              "Thịch.",
              "Tiếng của trái bóng cam va xuống sàn gỗ của nhà thể chất. Trường cấp ba Hosoku đang bị dẫn hai điểm và tôi là người nhận trách nhiệm ném phạt khi thời gian trận đấu chỉ còn hai giây đếm ngược. Cả đội không còn lần gọi timeout nào và lượt ném phạt này của tôi là thứ quyết định xem cả ngôi trường này có thể đi vào trận chung kết hay không.",
              "Anh đội trưởng Kosaki vỗ mạnh vào lưng khi tôi bước lên vạch ném phạt. Mồ hôi anh nhễ nhại, thấm qua cả bộ đồng phục đang mặc. Những người đồng đội khác cũng bước lên, họ chỉ mỉm cười rồi vỗ nhẹ vào lưng tôi như một cách động viên.",
              "Hít một hơi thật sâu, tôi nhìn vào bảng rổ. Nhồi bóng thêm một nhịp. Ngay sau tiếng tuýt còi của trọng tài, tôi ngắm chuẩn mà ném.",
              "Cộp.",
              "Bóng đập bảng rồi va vào vành rổ và rơi xuống lưới. Một điểm tính, tỉ số hiện tại là 89-90. Những người đàn anh trong câu lạc bộ tiến đến và đập tay với tôi, hi vọng của cả bọn lại được thắp lên vào lúc này.",
            ],
          },
          {
            badge: "Mới",
            title: "Chương 2: Nanase Iwaki có phải là người ngoài hành tinh?",
            date: "15/05/2026",
            content: [
              "Đây là nội dung của chương 2... Nội dung sẽ thay đổi tự động dựa vào link URL!",
            ],
          },
        ],
      },
    ],
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
      "Asamura Yuuta, một học sinh cao trung bắt đầu sống cùng dưới một mái nhà với cô nữ sinh đẹp nhất khối- Ayase Saki dưới danh nghĩa anh em sau khi bố mẹ cả hai quyết định tái hôn...",

    volumes: [
      {
        volTitle: "Vol 1: Siêu hội trưởng và tên trợ lý không lương",
        volCover:
          "https://upload.wikimedia.org/wikipedia/en/2/2c/The_Eminence_in_Shadow_light_novel_volume_1_cover.jpg",
        chapters: [
          {
            badge: "Mới",
            title: "Chương 1: Người mà tôi không nên thích",
            date: "14/05/2026",

            content: [
              "Thịch.",
              "Tiếng của trái bóng cam va xuống sàn gỗ của nhà thể chất. Trường cấp ba Hosoku đang bị dẫn hai điểm và tôi là người nhận trách nhiệm ném phạt khi thời gian trận đấu chỉ còn hai giây đếm ngược. Cả đội không còn lần gọi timeout nào và lượt ném phạt này của tôi là thứ quyết định xem cả ngôi trường này có thể đi vào trận chung kết hay không.",
              "Anh đội trưởng Kosaki vỗ mạnh vào lưng khi tôi bước lên vạch ném phạt. Mồ hôi anh nhễ nhại, thấm qua cả bộ đồng phục đang mặc. Những người đồng đội khác cũng bước lên, họ chỉ mỉm cười rồi vỗ nhẹ vào lưng tôi như một cách động viên.",
              "Hít một hơi thật sâu, tôi nhìn vào bảng rổ. Nhồi bóng thêm một nhịp. Ngay sau tiếng tuýt còi của trọng tài, tôi ngắm chuẩn mà ném.",
              "Cộp.",
              "Bóng đập bảng rồi va vào vành rổ và rơi xuống lưới. Một điểm tính, tỉ số hiện tại là 89-90. Những người đàn anh trong câu lạc bộ tiến đến và đập tay với tôi, hi vọng của cả bọn lại được thắp lên vào lúc này.",
            ],
          },
          {
            badge: "Mới",
            title: "Chương 2: Nanase Iwaki có phải là người ngoài hành tinh?",
            date: "15/05/2026",
            content: [
              "Đây là nội dung của chương 2... Nội dung sẽ thay đổi tự động dựa vào link URL!",
            ],
          },
        ],
      },
    ],
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
      "Asamura Yuuta, một học sinh cao trung bắt đầu sống cùng dưới một mái nhà với cô nữ sinh đẹp nhất khối- Ayase Saki dưới danh nghĩa anh em sau khi bố mẹ cả hai quyết định tái hôn...",

    volumes: [
      {
        volTitle: "Vol 1: Siêu hội trưởng và tên trợ lý không lương",
        volCover:
          "https://upload.wikimedia.org/wikipedia/en/5/59/Roshidere_light_novel_volume_1_cover.jpg",
        chapters: [
          {
            badge: "Mới",
            title: "Chương 1: Người mà tôi không nên thích",
            date: "14/05/2026",

            content: [
              "Thịch.",
              "Tiếng của trái bóng cam va xuống sàn gỗ của nhà thể chất. Trường cấp ba Hosoku đang bị dẫn hai điểm và tôi là người nhận trách nhiệm ném phạt khi thời gian trận đấu chỉ còn hai giây đếm ngược. Cả đội không còn lần gọi timeout nào và lượt ném phạt này của tôi là thứ quyết định xem cả ngôi trường này có thể đi vào trận chung kết hay không.",
              "Anh đội trưởng Kosaki vỗ mạnh vào lưng khi tôi bước lên vạch ném phạt. Mồ hôi anh nhễ nhại, thấm qua cả bộ đồng phục đang mặc. Những người đồng đội khác cũng bước lên, họ chỉ mỉm cười rồi vỗ nhẹ vào lưng tôi như một cách động viên.",
              "Hít một hơi thật sâu, tôi nhìn vào bảng rổ. Nhồi bóng thêm một nhịp. Ngay sau tiếng tuýt còi của trọng tài, tôi ngắm chuẩn mà ném.",
              "Cộp.",
              "Bóng đập bảng rồi va vào vành rổ và rơi xuống lưới. Một điểm tính, tỉ số hiện tại là 89-90. Những người đàn anh trong câu lạc bộ tiến đến và đập tay với tôi, hi vọng của cả bọn lại được thắp lên vào lúc này.",
            ],
          },
          {
            badge: "Mới",
            title: "Chương 2: Nanase Iwaki có phải là người ngoài hành tinh?",
            date: "15/05/2026",
            content: [
              "Đây là nội dung của chương 2... Nội dung sẽ thay đổi tự động dựa vào link URL!",
            ],
          },
        ],
      },
    ],
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
      "Asamura Yuuta, một học sinh cao trung bắt đầu sống cùng dưới một mái nhà với cô nữ sinh đẹp nhất khối- Ayase Saki dưới danh nghĩa anh em sau khi bố mẹ cả hai quyết định tái hôn...",

    volumes: [
      {
        volTitle: "Vol 1: Siêu hội trưởng và tên trợ lý không lương",
        volCover:
          "https://upload.wikimedia.org/wikipedia/en/d/d5/Class_de_2-ban_Me_ni_Kawaii_Onna_no_Ko_to_Tomodachi_ni_Natta_LN_volume_1.jpg",
        chapters: [
          {
            badge: "Mới",
            title: "Chương 1: Người mà tôi không nên thích",
            date: "14/05/2026",

            content: [
              "Thịch.",
              "Tiếng của trái bóng cam va xuống sàn gỗ của nhà thể chất. Trường cấp ba Hosoku đang bị dẫn hai điểm và tôi là người nhận trách nhiệm ném phạt khi thời gian trận đấu chỉ còn hai giây đếm ngược. Cả đội không còn lần gọi timeout nào và lượt ném phạt này của tôi là thứ quyết định xem cả ngôi trường này có thể đi vào trận chung kết hay không.",
              "Anh đội trưởng Kosaki vỗ mạnh vào lưng khi tôi bước lên vạch ném phạt. Mồ hôi anh nhễ nhại, thấm qua cả bộ đồng phục đang mặc. Những người đồng đội khác cũng bước lên, họ chỉ mỉm cười rồi vỗ nhẹ vào lưng tôi như một cách động viên.",
              "Hít một hơi thật sâu, tôi nhìn vào bảng rổ. Nhồi bóng thêm một nhịp. Ngay sau tiếng tuýt còi của trọng tài, tôi ngắm chuẩn mà ném.",
              "Cộp.",
              "Bóng đập bảng rồi va vào vành rổ và rơi xuống lưới. Một điểm tính, tỉ số hiện tại là 89-90. Những người đàn anh trong câu lạc bộ tiến đến và đập tay với tôi, hi vọng của cả bọn lại được thắp lên vào lúc này.",
            ],
          },
          {
            badge: "Mới",
            title: "Chương 2: Nanase Iwaki có phải là người ngoài hành tinh?",
            date: "15/05/2026",
            content: [
              "Đây là nội dung của chương 2... Nội dung sẽ thay đổi tự động dựa vào link URL!",
            ],
          },
        ],
      },
    ],
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
      "Asamura Yuuta, một học sinh cao trung bắt đầu sống cùng dưới một mái nhà với cô nữ sinh đẹp nhất khối- Ayase Saki dưới danh nghĩa anh em sau khi bố mẹ cả hai quyết định tái hôn...",

    volumes: [
      {
        volTitle: "Vol 1: Siêu hội trưởng và tên trợ lý không lương",
        volCover:
          "https://upload.wikimedia.org/wikipedia/en/3/3c/Re-Zero_kara_Hajimeru_Isekai_Seikatsu_light_novel_volume_1_cover.jpg",
        chapters: [
          {
            badge: "Mới",
            title: "Chương 1: Người mà tôi không nên thích",
            date: "14/05/2026",

            content: [
              "Thịch.",
              "Tiếng của trái bóng cam va xuống sàn gỗ của nhà thể chất. Trường cấp ba Hosoku đang bị dẫn hai điểm và tôi là người nhận trách nhiệm ném phạt khi thời gian trận đấu chỉ còn hai giây đếm ngược. Cả đội không còn lần gọi timeout nào và lượt ném phạt này của tôi là thứ quyết định xem cả ngôi trường này có thể đi vào trận chung kết hay không.",
              "Anh đội trưởng Kosaki vỗ mạnh vào lưng khi tôi bước lên vạch ném phạt. Mồ hôi anh nhễ nhại, thấm qua cả bộ đồng phục đang mặc. Những người đồng đội khác cũng bước lên, họ chỉ mỉm cười rồi vỗ nhẹ vào lưng tôi như một cách động viên.",
              "Hít một hơi thật sâu, tôi nhìn vào bảng rổ. Nhồi bóng thêm một nhịp. Ngay sau tiếng tuýt còi của trọng tài, tôi ngắm chuẩn mà ném.",
              "Cộp.",
              "Bóng đập bảng rồi va vào vành rổ và rơi xuống lưới. Một điểm tính, tỉ số hiện tại là 89-90. Những người đàn anh trong câu lạc bộ tiến đến và đập tay với tôi, hi vọng của cả bọn lại được thắp lên vào lúc này.",
            ],
          },
          {
            badge: "Mới",
            title: "Chương 2: Nanase Iwaki có phải là người ngoài hành tinh?",
            date: "15/05/2026",
            content: [
              "Đây là nội dung của chương 2... Nội dung sẽ thay đổi tự động dựa vào link URL!",
            ],
          },
        ],
      },
    ],
  },
];

// ================= 2. HÀM VẼ TRANG CHỦ & DANH SÁCH =================
function renderStories(storiesArray) {
  const container = document.getElementById("story-list-container");
  if (!container) return;

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

function sortStories(order) {
  let sortedArray = [...mockStories];
  if (order === "az") {
    sortedArray.sort((a, b) => a.title.localeCompare(b.title, "vi"));
  } else if (order === "za") {
    sortedArray.sort((a, b) => b.title.localeCompare(a.title, "vi"));
  }
  renderStories(sortedArray);
}

// hàm vẽ chi tiết trang truyện
function loadStoryDetail() {
  const detailContainer = document.getElementById("story-detail-container");
  if (!detailContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const storyId = parseInt(urlParams.get("id"));
  const story = mockStories.find((s) => s.id === storyId);

  if (!story) {
    detailContainer.innerHTML = `<h2 style="text-align: center; color: red;">Không tìm thấy truyện!</h2>`;
    return;
  }

  document.title = story.title + " - Tori Lightnovel";

  let tagsHtml = "";
  if (story.tags) {
    for (let i = 0; i < story.tags.length; i++) {
      tagsHtml += `<span class="tag-badge">${story.tags[i]}</span>`;
    }
  }

  let volumesHtml = "";
  if (story.volumes && story.volumes.length > 0) {
    for (let i = 0; i < story.volumes.length; i++) {
      const vol = story.volumes[i];
      let chaptersHtml = "";

      for (let j = 0; j < vol.chapters.length; j++) {
        const chap = vol.chapters[j];
        const badgeHtml = chap.badge
          ? `<span class="chap-badge">${chap.badge}</span>`
          : "";
        const iconHtml = chap.title.includes("Ảnh") ? `🖼️ ` : `📄 `;

        // TRUYỀN ID TRUYỆN, ID TẬP, ID CHƯƠNG LÊN LINK ĐỂ TRANG ĐỌC NHẬN DIỆN
        chaptersHtml += `
          <div class="chap-row">
            <div class="chap-left">
              ${badgeHtml} <a href="Reading.html?storyId=${story.id}&vol=${i}&chap=${j}">${iconHtml}${chap.title}</a>
            </div>
            <div class="chap-right">${chap.date}</div>
          </div>
        `;
      }

      volumesHtml += `
        <div class="vol-box">
          <div class="vol-header">
            <h3>${vol.volTitle} <span style="color: red;">*</span></h3>
          </div>
          <div class="vol-body">
            <div class="vol-cover">
              <img src="${vol.volCover}" alt="Bìa Vol">
            </div>
            <div class="vol-chap-list">
              ${chaptersHtml}
            </div>
          </div>
        </div>
      `;
    }
  }

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

    <div style="margin-top: 40px;">
        ${volumesHtml}
    </div>
  `;

  detailContainer.innerHTML = htmlContent;
}

document.addEventListener("DOMContentLoaded", () => {
  renderStories(mockStories);
  loadStoryDetail();
});
