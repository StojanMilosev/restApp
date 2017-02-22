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
app.get(url.parse(config.oauth_callback).path,req.query.oauth_verifier,function(req,res){
    authenticator.authenticate(req,res,function(err){
        if(err){
            console.log(err);
            res.sendStatus(401);
        }else{
            res.send("autentikacija uspesna");
        }
    });
});
//Tweet
app.get('/tweet',function(req,res) {
    if (!req.cookies.access_token || !req.cookies.access_token_secret) {
        return res.sendStatus(401);
    }

    authenticator.post('https://api.twitter.com/1.1/statuses/update.json',
        req.cookies.acces_token, req.cookies.acces_token_secret,
        {
            status:"REST API Hello world"
        },
        function (error,data) {
            if (error) {
                return res.status(400).send(error);
            }

            res.send("Uspesan tweet");
        }
    );
});
//listening for requests
app.listen(process.env.PORT || 8080,function () {
    console.log("listening on port" + process.env.PORT);
});