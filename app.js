// jshint esversion:6

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const fetch = require('node-fetch');

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.set('view-engine', 'ejs');

// mongoose.connect('mongodb://localhost:27017/userDB', {useNewUrlParser:true, useUnifiedTopology:true});
// connect to mongo database
mongoose.connect("mongodb+srv://admin-dilson:choy@2131986@cluster0.9n8g2.mongodb.net/todolistDB?retryWrites=true&w=majority", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const userSchema = {
  email: String,
  password: String
};
const User = new mongoose.model('User', userSchema);

/* ------------------------------------------fetch data from external server-----------------------------------------*/
const api ="https://jsonplaceholder.typicode.com";
// const api ="https://api.aftership.com/v4";

const idSchema = {
  name: String,
  email:String,
  phone: String
};
const ID = new mongoose.model('ID', idSchema);

/*  Using API key */

// const headers = {
//   "Content-Type": "application/json",
//   "aftership-api-key": "8f3f532f-282d-4383-ad4c-2f44b952d49f"
// }
//
// fetch(api+'/trackings', {headers:headers})
//   .then((res)=>{
//     return res.json();
//   })
//   .then((data)=>{
//     console.log(data);
//     // Object.keys(data).map(function(e){
//     //   const userID
//     // });
//     res.send(data);
//   });
// });

/* Fetch Data and Save it mongoDB */
fetch(api+'/users')
  .then((res)=>{
    return res.json();
  })
  .then((data)=>{
    console.log(data);
    // res.send(data);
    Object.keys(data).map(function(e){
      // res.send(data);
      const newID =new ID({
        name: data[e].name,
        email:data[e].email,
        phone: data[e].phone
      });
      // newID.save();
    })
});

app.get('/fetchAPIdata', function(req, res){
    // read data from database
    ID.find({}, function(err, foundItems){
      if(err){
        console.log(err);
      }else{
        res.render("fetchAPIdata.ejs", {newUser: foundItems});
      }
    });
});

app.get('/fetchAddNew', function(req, res){
    // read data from database
    res.render('fetchAddNew.ejs');
});

app.post('/fetchAddNew', function(req, res){
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;

    const newUser =new ID({
      name: name,
      email: email,
      phone:phone
    });

    ID.insertMany(newUser, function(err){
      if(err){
        console.log(err);
      }else{
        newUser.save();
        res.redirect('/fetchAPIdata');
      }
    });
});

app.post('/delete', function(req, res){
    const id =req.body.delete;
    ID.findByIdAndRemove(id, function(err){
      if(!err){
        console.log(err);
        res.redirect('/fetchAPIdata');
      }
    });
});

app.get('/fetchAPIupdate', function(req, res){
    res.render('fetchAPIupdate.ejs');
});


app.post('/update', function(req, res){
    const id = req.body.update;
    console.log(id);
    res.render('fetchAPIupdate.ejs', {updateID: id});

});

app.post('/updateUser', function(req, res){
    const id = req.body.update;
    ID.findByIdAndRemove(id, function(err){
      if(!err){
        console.log(err);
      }
    });
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;

    const newUser =new ID({
      name: name,
      email: email,
      phone:phone
    });

    ID.insertMany(newUser, function(err){
      if(err){
        console.log(err);
      }else{
        newUser.save();
        res.redirect('/fetchAPIdata');
      }
    });
});

/*---------------------------------------fetch data from external server-----------------------------------------*/

app.get('/', function(req, res){
  res.render('home.ejs');
});

app.get('/login', function(req, res){
  res.render('login.ejs');
});

app.get('/register', function(req, res){
  res.render('register.ejs');
});

app.post('/register', function(req, res){
  const newUser = new User({
      email: req.body.username,
      password: req.body.password
  });
  newUser.save(function(err){
    if(err){
      console.log(err);
    }else{
      res.render('secrets.ejs');
    }
  });
});

app.post('/login', function(req, res){
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({email:username}, function(err, foundUser){
    if(err){
      console.log('Invalid Email Address');
    }else{
      if(foundUser){
        if(foundUser.password === password){
          res.render('secrets.ejs');
        }
      }
    }
  });
});

app.listen(process.env.PORT || 3000, function(){
  console.log('Node server is running on port 3000. Done...');
});
