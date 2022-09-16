const mongoose = require("mongoose");
const mongodb = require("mongodb");

//local database

// mongoose
//   .connect("mongodb://localhost:27017/BankSystem", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("connection is successful.");
//   })
//   .catch((error) => {
//     console.log("connection is not successful.");
//   });

// global database
const { MongoClient, ServerApiVersion } = require("mongodb");
const DB =
  "";
const client = new MongoClient(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
client.connect((err) => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

// using mongoose to connect
mongoose
  .connect(DB)
  .then(() => {
    console.log("connection successful.");
  })
  .catch((error) => console.log("no-connection"));
