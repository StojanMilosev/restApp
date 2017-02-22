var url = require('url');
var express = require('express');
var authenticator = require('./authenticator');
var config = require('./config');
var cookieParser = require('cookie-parser');
var app = express();

//Dodavanje cookie funkcionalnosti 
app.use(cookieParser());

//Preusmeravanje korisnika ka Twiter login stranici
app.get('/auth/twitter',authenticator.redirectToTwitterLoginPage);

//callback url prema kojem je korisnik preusmeren nakon autentikacije
app.get(url.parse(config.oauth_callback).path,function(req,res){
    authenticator.authenticate(req,res,function(err){
        if(err){
            console.log(err);
            res.sendStatus(401);
        }else{
            res.send("autentikacija uspesna");
        }
    });
});

//listening for requests
app.listen(process.env.PORT || 8080,function () {
    console.log("listening on port" + config.port);
});