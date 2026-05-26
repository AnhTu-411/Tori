const mongoose = require('mongoose');

const URI = "mongodb://jackieson235_db_user:QktRphCodQ4fzjGO@ac-sqykxqf-shard-00-00.m8oi10t.mongodb.net:27017,ac-sqykxqf-shard-00-01.m8oi10t.mongodb.net:27017,ac-sqykxqf-shard-00-02.m8oi10t.mongodb.net:27017/tori_database?ssl=true&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(URI)
  .then(() => {
    console.log("Connected directly without SRV!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Failed:", err);
    process.exit(1);
  });
