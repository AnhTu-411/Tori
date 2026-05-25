function loadRandomStory() {
  const container = document.getElementById("random-story-container");
  if (!container) return;

  // Kiểm tra xem đã tải được dữ liệu thật từ biến currentStories chưa
  if (!currentStories || currentStories.length === 0) {
    container.innerHTML = `<p style="font-size: 14px; color: #888;">Chưa có dữ liệu truyện.</p>`;
    return;
  }

  // Bốc ngẫu nhiên 1 cuốn truyện
  const randomIndex = Math.floor(Math.random() * currentStories.length);
  const story = currentStories[randomIndex];

  const detailHref =
    typeof getStoryDetailHref === "function"
      ? getStoryDetailHref(story._id)
      : ToriRoutes.href("storyDetail", { id: story._id });

  container.innerHTML = `
    <div class="atropos atropos-random" style="width: 100%; height: 100%; cursor: pointer;" onclick="window.location.href='${detailHref}'">
      <div class="atropos-scale">
        <div class="atropos-rotate">
          <div class="atropos-inner">
            <a href="${detailHref}" class="story-card" style="text-decoration: none; display: flex; flex-direction: column; margin: 0 auto; height: 100%;">
              <img src="${story.coverImg}" alt="Bìa ${story.title}" data-atropos-offset="-5">
              <div class="story-info" data-atropos-offset="5" style="flex: 1;">
                <h3 class="story-title">${story.title}</h3>
                <p class="story-author">Tác giả: ${story.author}</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  if (typeof Atropos !== 'undefined') {
    Atropos({
      el: '.atropos-random',
      activeOffset: 40,
      shadow: false,
      highlight: false
    });
  }
}
