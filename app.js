const express = require('express');
const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://admin-mukul:Test123@cluster0.vwhb9kr.mongodb.net/Laundri",{
    useUnifiedTopology: true,
    useNewUrlParser: true,
});

const app = express();
app.use(express.json());

app.get('/',(req,res)=>{
    res.status(200).json({message:'Welcome to Laundri API zombie endpoint'});
});

const port = process.env.PORT || 8000;
app.listen(port,()=>{
    console.log(`Server Started at port ${port}`);
});