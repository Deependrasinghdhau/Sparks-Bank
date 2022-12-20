//Requiring modules
const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const hbs = require('hbs');
const customer = require("./models/customers");
const transaction = require("./models/transaction");
const bodyParser = require("body-parser");

//Declaring port
const port = process.env.PORT || 3000;

//Initializing body-parser
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());



//Enabling public folder as static folder
const staticpath = path.join(__dirname, "../public");
app.use(express.static(staticpath));

//Setting Viewing Engine or Handle-bars
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "./templates/views"));
hbs.registerPartials(path.join(__dirname, "./templates/partials"));

//Home page request
app.get('/', (req,res) => {
    res.render("./index");
})

//Register page request
app.get('/register', (req, res) => {
    res.render("./register");
})

//Saving user to database
app.post("/submitform", async (req, res) => {
    try {
        const data = await customer.find();
        if (data.length == 0) {
        req.body.accountno = 75136250;
        } else {
          const last = data[data.length - 1].accountno;
          req.body.accountno = last + 1;
      }
      const user = new customer(req.body);
      const createUser = await user.save();
      res.status(201).render("./index");
    } catch (e) {
      res.status(400).send(e);
    }
});

//Send money button request
app.get('/send/:accno', (req, res) => {
  const accountno = req.params.accno;
  res.render("./sendmoney", { accountno:`${accountno}`});
})

// html reading from files
const page = fs.readFileSync("./src/templates/views/viewall.hbs", "utf-8");
const template = fs.readFileSync("./src/templates/views/template.hbs","utf-8");
const footer = fs.readFileSync("./src/templates/partials/footer.hbs", "utf-8");

//replacing function for data replace in viewall.hbs
const replaceVal = (tempVal, orgVal) => {
    let replacedata = tempVal.replace("{%tempname%}", orgVal.name); 
    replacedata = replacedata.replace("{%tempbalance%}", orgVal.currentbalance);
    if (orgVal.accountno != undefined) {
        replacedata = replacedata.replace("{%tempaccountno%}", orgVal.accountno);
        replacedata = replacedata.replace("{%accountno%}", orgVal.accountno);
    }
    else {
        replacedata = replacedata.replace("{%tempaccountno%}", "N/a");
    }
    return replacedata;
}

// creating dynamic view all customers page 
app.get("/viewall", async (req, res) => {
    try {
        const data = await customer.find();
        // console.log(data);
        // console.log(data[0].name);

        const avval = data.map(val => replaceVal(template,val)).join("");
      res.writeHead(200,{'Content-Type': 'text/html'});
        res.write(page);
        res.write(avval);
        res.write(footer);
        res.end();
        // for (let i = 0; i < data.length; i++){
        //     res.write(`<h1>${data[i].name}</h1>`);
        // }
        // res.end();
        
    } catch (e) {
        res.status(400).send(e);
    }
})

const sendtemplate2 = fs.readFileSync('./src/templates/views/sendmoney2.hbs');

//Money sending request or logic
app.post("/sendmoney", async (req, res) => {
  try {
    let error = 0;
    const user = new transaction(req.body);
    const sender = await customer.find({ accountno: `${user.sender}` });
    const receiver = await customer.find({ accountno: `${user.receiver}` });


    if (sender[0].currentbalance >= user.amount && receiver.length != 0 && user.sender!=user.receiver) {
      let newCurrentBal = sender[0].currentbalance - user.amount;
      const result = await customer.updateOne({ accountno: `${sender[0].accountno}` }, {
        $set: {
          currentbalance: `${newCurrentBal}`
        }
      });

      newCurrentBal = receiver[0].currentbalance + user.amount;
      const result2 = await customer.updateOne({ accountno: `${receiver[0].accountno}` }, {
        $set: {
          currentbalance: `${newCurrentBal}`
        }
      })
      error = 0;
      user.status = "Successful";
      // console.log(result);
      // console.log(result2);
    } else {
      if (sender[0].currentbalance < user.amount) {
        res.render('./sendmoney2', {
          tempstatus: "Transaction Failed",
          color: "red",
          temperror: "Insufficient Balance!",
          tempdisplay: "block"
        })
        // res.send("Insufficient Balance!");
      }
      else if (receiver.length == 0) {
        res.render('./sendmoney2', {
          tempstatus: "Transaction Failed",
          color: "red",
          temperror: "Receiver does not exist!",
          tempdisplay: "block"
        })
        // res.send("Receiver does not exist");
      }
      else if (user.sender == user.receiver) { 
        res.render('./sendmoney2', {
          tempstatus: "Transaction Failed",
          color: "red",
          temperror: "Sender and Receiver account no. can not be same!",
          tempdisplay: "block"
        })
        // res.send("Sender and Receiver account no. can not be same!");
      }
      error = 1;
      user.status = "Failed";
    }
    const createUser = await user.save();
    // console.log(user);
    if (error == 0) {
      
      res.status(201).render('./sendmoney2', {
        tempstatus: "Transaction Successful.",
        color: "green",
        tempdisplay: "none"
      });

    }
  } catch (e) {
    res.status(400).send(e);
  }
});

const transactionPage = fs.readFileSync("./src/templates/views/viewall2.hbs", "utf-8");
const transactionTemplate = fs.readFileSync("./src/templates/views/transaction.hbs", "utf-8");

const replaceValtrans = (tempVal, orgVal) => {
  let replacedata = tempVal.replace("{%tempsender%}", orgVal.sender);
  replacedata = replacedata.replace("{%tempamount%}", orgVal.amount);
  replacedata = replacedata.replace("{%tempreceiver%}", orgVal.receiver);
  if (orgVal.status == "Successful") {
    replacedata = replacedata.replace("{%tempcolor%}", "green");
  }
  else {
    replacedata = replacedata.replace("{%tempcolor%}", "red");
  }
  replacedata = replacedata.replace("{%tempstatus%}", orgVal.status);
  return replacedata;
}

app.get('/transactions', async (req, res) => {
  try {
    const data = await transaction.find().sort({_id:-1});
    const avval = data.map(val => replaceValtrans(transactionTemplate, val)).join("");

    res.write(transactionPage);
    res.write(avval);
    res.write(footer);
    res.end();
    
  } catch (e) {
    res.status(400).send(e);
  }
})

app.get('/about', (req, res) => {
  res.render("./about.hbs")
})


const mongoose = require("mongoose");
const mongodb = require("mongodb");


// global database
const { MongoClient, ServerApiVersion } = require("mongodb");
const DB =
  "mongodb+srv://deependra:dhauji@cluster0.h3uln.mongodb.net/BankSystem?retryWrites=true&w=majority";
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
    app.listen(port, () => {
      console.log("server is listening at port 3000");
  })
  
  })
  .catch((error) => console.log("no-connection"));


//Server startup



