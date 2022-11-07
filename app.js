const express = require('express');
const app = express();
app.use(express.json());

app.get('/',(req,res)=>{
    res.status(200).json({'Welcome to Laundri API zombie endpoint'});
});

const port = process.env.PORT || 8000;
app.listen(port,()=>{
    console.log(`Server Started at port ${port}`);
});