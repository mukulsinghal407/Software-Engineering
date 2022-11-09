const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

mongoose.connect("mongodb+srv://admin-mukul:Test123@cluster0.vwhb9kr.mongodb.net/Laundri",{
    useUnifiedTopology: true,
    useNewUrlParser: true,
});

const user = mongoose.Schema({

});
const order = mongoose.Schema({

});

const User = mongoose.model('users',user);
const Order = mongoose.model('orders',order);
const app = express();
app.use(express.json());

app.get('/',(req,res)=>{
    res.status(200).json({message:'Welcome to Laundri API zombie endpoint'});
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
})

const port = process.env.PORT || 8000;
app.listen(port,()=>{
    console.log(`Server Started at port ${port}`);
});