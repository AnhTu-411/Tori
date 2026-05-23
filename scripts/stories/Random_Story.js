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
    <a href="${detailHref}" class="story-card" style="text-decoration: none; display: block; margin: 0 auto;">
      <img src="${story.coverImg}" alt="Bìa ${story.title}">
      <div class="story-info">
        <h3 class="story-title">${story.title}</h3>
        <p class="story-author">Tác giả: ${story.author}</p>
      </div>
    </a>
  `;
}
