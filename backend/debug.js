
async function debugFilter() {
  const API_URL = "http://localhost:5000/api";
  try {
    const res = await fetch(`${API_URL}/stories`);
    const allStoriesCache = await res.json();
    console.log("Fetched stories count:", allStoriesCache.length);
    
    if (allStoriesCache.length > 0) {
      console.log("Sample story genres:", allStoriesCache[0].genres);
    }

    const keyword = "";
    const status = "Tất cả";
    const year = "Tất cả";
    const searchGenres = ["hành động"]; // Simulate checking "Hành động"

    const currentStories = allStoriesCache.filter(story => {
      // 1. Keyword
      const safeTitle = story.title ? story.title.toLowerCase() : "";
      const safeAuthor = story.author ? story.author.toLowerCase() : "";
      const matchKeyword = safeTitle.includes(keyword) || safeAuthor.includes(keyword);

      // 2. Status
      const matchStatus = (status === "Tất cả") || (story.status === status);

      // 3. Year
      let matchYear = true;

      // 4. Genres (AND logic, exact match within array)
      let matchGenre = true;
      if (searchGenres.length > 0) {
        if (!story.genres) {
          matchGenre = false;
        } else {
          let normalizedStoryGenres = [];
          if (Array.isArray(story.genres)) {
             story.genres.forEach(g => {
                if (g) g.split(',').forEach(subG => normalizedStoryGenres.push(subG.trim().toLowerCase()));
             });
          } else if (typeof story.genres === "string") {
             story.genres.split(',').forEach(subG => normalizedStoryGenres.push(subG.trim().toLowerCase()));
          }
          matchGenre = searchGenres.every(searchG => normalizedStoryGenres.includes(searchG));
        }
      }

      return matchKeyword && matchStatus && matchYear && matchGenre;
    });

    console.log("Filtered count (Hành động):", currentStories.length);
  } catch(e) {
    console.error(e);
  }
}

debugFilter();
