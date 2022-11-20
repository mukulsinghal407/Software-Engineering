const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// const jwt = require("jsonwebtoken");

mongoose.connect(
  "mongodb+srv://admin-mukul:Test123@cluster0.vwhb9kr.mongodb.net/Laundri",
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }
);

//Schemas
const user = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  roll_no: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: Number, //0->Student 1->Staff 2->Admin
    required: true,
    default: 0,
  },
  hostel: {
    type: String,
    required: true,
    default: "O",
  },
  phone_no: {
    type: String,
    required: true,
    unique: true,
  },
});
const order = mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    required: true,
    default: 0, //0->pending 1->fulfilled
  },
  clothes: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
    },
  ],
});
const slot = mongoose.Schema({
  start_time: {
    type: Date,
    required: true,
  },
  end_time: {
    type: Date,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  user_ids: [{ type: String, required: true }],
});

//Models
const User = mongoose.model("users", user);
const Order = mongoose.model("orders", order);
const Slot = mongoose.model("slot", slot);

const app = express();
app.use(bodyParser.json());

//GET Requests
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Laundri API zombie endpoint" });
});

app.get("/slot", (req, res) => {
  Slot.find({}, (err, result) => {
    if (err) {
      res.status(400).json({ error: "The slots are unavailable" });
    } else {
      var temp = [];
      result.forEach((element) => {
        if (element.capacity !== element.user_ids.length) {
          temp.push(element);
        }
      });
      console.log(result);
      temp.length === 0
        ? res
            .status(200)
            .json({ message: "There are no available slots", slots: temp })
        : res.status(200).json({ message: "The available slots", slots: temp });
    }
  });
});

app.get("/orderHistory/user_id=:user_id", (req, res) => {
  Order.find({ user_id: req.params.user_id }, (error, result) => {
    if (error) {
      res
        .status(401)
        .json({ error: "There was a connection error with the database." });
    } else if (result?.length === 0) {
      res.status(200).json({ error: "No records found." });
    } else {
      res
        .status(200)
        .json({ message: "History of the orders", results: result });
    }
  });
});

app.get("/orderDetails/user_id=:user_id", (req, res) => {
  const user_id = req.params.user_id;
  Order.find({ user_id }, (err, result) => {
    if (err) {
      res.status(400).json({ error: "The order was not found" });
    } else if (result?.length === 0) {
      res.status(200).json({ message: "No orders found." });
    } else {
      res.status(200).json({ message: "Successful", info: result });
    }
  });
});

app.get("/userDetails/user_id=:user_id", (req, res) => {
  const user_id = req.params.user_id;
  User.findById(user_id, (err, result) => {
    if (err) {
      res.status(400).json({ error: "Database connection issue" });
    } else if (result == null) {
      res.status(401).json({
        message: "The user with the defined credentials wasn't found",
      });
    } else {
      res
        .status(200)
        .json({ message: "The user found successfully", user: result });
    }
  });
});

// app.get("/getSlotDetails/slot_id=:slot_id", (req, res) => {
//     const slot_id = req.params.slot_id;
//     Slot.findById(slot_id,(err,result)=>{
//         if(err){
//             res.status(400).json({error:'Database connection failure'});
//         }else if(result==null){
//             res.status(401).json({erro:'No slot found for given inputs'});
//         }else{
//             res.status(200).json({message:'The slot has been found',slot:result});
//         }
//     });
// });

app.post("/login", (req, res) => {
  const user = req.body;
  console.log(user);
  user.password = user.password?.trim();
  user.phone_no = user.phone_no?.trim();
  User.findOne(user, (err, result) => {
    if (err) {
      res.status(400).json({ error: "Database connection failure" });
    } else if (result == null) {
      res.status(401).json({ error: "Invalid User Credentials" ,status:401});
    } else {
      // const token = jwt.sign(result, "Laundri");
      res
        .status(200)
        .json({ message: "User logged in successfully", user: result, status:200});
    }
  });
});

app.post("/register", (req, res) => {
  const info = req.body;
  User.findOne({ phone_no: info.phone_no }, (err, result) => {
    if (err) {
      console.error(err);
      res.status(503).json({ error: "Database Connection issue" });
    } else if (result == null) {
      User.create(info, (error, newResult) => {
        if (error) {
          console.log(error);
          res.status(400).json({
            error: "Unable to create user with the defined information",
          });
        } else {
          res
            .status(201)
            .json({ message: "User Created successfullly", info: newResult });
        }
      });
    } else {
      res.status(401).json({ message: "The user already exists" });
    }
  });
});

app.post("/addSlot", (req, res) => {
  const slot = req.body;
  Slot.create(slot, (err, result) => {
    if (err) {
      res.status(400).json({ error: "The Slot cannot be created" });
    } else {
      res.redirect("/slot");
    }
  });
});

app.post("/bookSlot/slot_id=:slot_id&user_id=:user_id", (req, res) => {
  const slot_id = req.params.slot_id;
  const user_id = req.params.user_id;

  Slot.findOne({ user_ids: { $in: user_id } }, (err, result) => {
    if (err) {
      res.status(400).json({ error: "Database connection failure" });
    } else if (result == null) {
      Slot.findById(slot_id, (er, info) => {
        if (er) {
          res.status(400).json({ error: "Database connection failure" });
        } else {
          //Checking if the slot is already full
          if (info.capacity == info.user_ids?.length) {
            res
              .status(200)
              .json({ message: "The slot has already reached its limit" });
          }
          //If available then book
          else {
            Slot.findByIdAndUpdate(
              slot_id,
              { $addToSet: { user_ids: user_id } },
              (error, oldResult) => {
                if (error) {
                  res.status(400).json({
                    error:
                      "The slot couldn't be booked; Please try again later",
                  });
                } else {
                  Slot.findById(slot_id, (prob, updatedResult) => {
                    if (!prob) {
                      res.status(200).json({
                        message: "Slot Booked Successfully",
                        slot: updatedResult,
                      });
                    } else {
                      console.error(prob);
                    }
                  });
                }
              }
            );
          }
        }
      });
    } else {
      res.status(406).json({ message: "The user has already booked a slot." });
    }
  });
});

//give clothes order placed
app.post("/placeOrder", (req, res) => {
  const order = req.body;
  console.log(order);
  Order.create(order, (err, result) => {
    if (err) {
      console.error(err);
      res.status(400).json({ error: "Missing Values" });
    } else if (result == null) {
      res.status(200).json({ message: "Failed to place order" });
    } else {
      res.status(201).json({ message: "Order Placed Successfully" });
    }
  });
});

//take clothes order taken
app.post("/orderFullfilled/order_id=:order_id", (req, res) => {
  const order_id = req.params.order_id;
  Order.findByIdAndUpdate(order_id, { status: 1 }, (err, result) => {
    if (err) {
      res.status(400).json({ error: "Database connection failure" });
    } else if (result == null) {
      res.status(401).json({ message: "No such order exist" });
    } else {
      res.status(200).json({ message: "Order Updated" });
    }
  });
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server Started at port ${port}`);
});
