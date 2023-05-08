const mongoose = require("mongoose");

const url = `mongodb+srv://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@cluster0.o8n9g.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`;

async function connect() {
  try {
    await mongoose.connect(url,{ 
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`Succesfully connect to ${process.env.DATABASE_NAME} database`);
  } catch (err) {
    console.log(err);
    console.log(`Fail to connect to MongoDB ${process.env.DATABASE_NAME}`);
  }
}


module.exports = { connect };