const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

mongoose.connect("mongodb+srv://admin-mukul:Test123@cluster0.vwhb9kr.mongodb.net/Laundri",{
    useUnifiedTopology: true,
    useNewUrlParser: true,
});

//Schemas
const user = mongoose.Schema({
    name:{
        type:String,
        required: true,
    },
    roll_no:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:Number,  //0->Student 1->Staff 2->Admin 
        required:true
    }
});
const order = mongoose.Schema({
    user_id:{
        type:String,
        required:true
    },
    clothes:{
        type:[{
            name:String,
            quantity:Number
        }],
        required:true
    }
});
const slot = mongoose.Schema({
    start_time:{
        type:Date,
        required:true
    },
    end_time:{
        type:Date,
        required:true
    },
    capacity:{
        type:Number,
        required:true
    },
    number_of_students:{
        type:Number,
        required:true
    },
    user_ids:[{type:String,required:true}]
});

//Models
const User = mongoose.model('users',user);
const Order = mongoose.model('orders',order);
const Slot = mongoose.model('slot',slot);

const app = express();
app.use(express.json());

//GET Requests
app.get('/',(req,res)=>{
    res.status(200).json({message:'Welcome to Laundri API zombie endpoint'});
});

app.get('/slot',(req,res)=>{
    Slot.find({},(err,result)=>{
        if(err){
            res.status(400).json({error:"The slots are unavailable"});
        }
        else{
            res.status(200).json({slots:result});
        }
    });
});

app.get('/history/:user_id',(req,res)=>{
    Order.find({user_id:req.params.user_id},(error,result)=>{
        if(error){
            res.status(401).json({error:'There was a connection error with the database.'})
        }
        if(result.length === 0){
            res.status(400).json({error:'No records found.'});
        }
        else{
            res.status(200).json({results:result})
        }
    })
})

//POST Requests
app.post('/bookSlot?:start_time',(req,res)=>{
    slots.forEach(e=>{
        if(str(e.start_time) == req.params.start_time){
            e.number_of_students = e.number_of_students - 1;
            if(e.number_of_students===capacity){
                const index = slots.indexOf(e);
                delete slots[index];
            }
        res.status(200).json({message:'Successfully Booked'});
        }
    })  
    res.status(400).json({error:'The Slot was not booked successfully'});
});

app.post('/login',(req,res)=>{
    const user = req.body;
    User.findOne(user,(err,result)=>{
        if(err){
            res.status(401).json({error:'User is not found'});
        }
        else{
            const token = jwt.sign(result,'Laundri');
            res.status(200).json({message:'User logged in successfully',info:token});
        }
    });
});

app.post('/register',(req,res)=>{
    const info = req.body;
    User.create(info,(err,result)=>{
        if(err){
            res.status(400).json({error:'Unable to create user with the defined information'});
        }
        else{
            res.status(200).json({message:'User Created successfullly',info:result});
        }
    });
});

app.post('/getDetails',(req,res)=>{
    const orderId = req.body.orderId;
    Order.findById(orderId,(err,result)=>{
        if(err){
            res.status(400).json({error:'The order was not found'});
        }
        else{
            res.status(200).json({message:'Successful',info:result})
        }
    })
});

app.post('/addSlot',(req,res)=>{
    const slot = req.body;
    slots.push(slot);
    res.status(200).json({message:'The slot has been made successfully'});
});

app.post('/getSlotDetails?:slot_time',(req,res)=>{
    slots.forEach(slot=>{
        if( str(slot.start_time) === req.params.slot_time){
            res.status(200).json({info:slot});
        }
    });
    res.status(401).json({error:'Information not found for the given slot'});
});

const port = process.env.PORT || 8000;
app.listen(port,()=>{
    console.log(`Server Started at port ${port}`);
});