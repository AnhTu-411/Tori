const mongoose = require('mongoose');
const Story = require('./models/Story');

async function normalizeDB() {
  try {
    await mongoose.connect("mongodb://jackieson235_db_user:QktRphCodQ4fzjGO@ac-sqykxqf-shard-00-00.m8oi10t.mongodb.net:27017,ac-sqykxqf-shard-00-01.m8oi10t.mongodb.net:27017,ac-sqykxqf-shard-00-02.m8oi10t.mongodb.net:27017/tori_database?ssl=true&authSource=admin&retryWrites=true&w=majority");
    console.log("Connected to DB...");

    const stories = await Story.find();
    let updated = 0;

    for (let story of stories) {
      if (story.title) story.title = story.title.normalize('NFC');
      if (story.author) story.author = story.author.normalize('NFC');
      if (story.genres && story.genres.length > 0) {
        let newGenres = [];
        story.genres.forEach(g => {
          if (g) {
            g.split(',').forEach(sub => {
              const cleaned = sub.trim().normalize('NFC');
              if (cleaned) newGenres.push(cleaned);
            });
          }
        });
        story.genres = newGenres;
      }
      
      story.markModified('genres');
      await story.save();
      updated++;
    }

    console.log(`Normalization complete. Updated ${updated} stories.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

normalizeDB();
