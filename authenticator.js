var OAuth = require('oauth').OAuth;
var config = require('./config');

//kreiranje oauth objekta radi pristupanja Twitteru
var oauth = new OAuth(
    config.request_token_url,
    config.access_token_url,
    config.consumer_key,
    config.consumer_secret,
    config.oauth_version,
    config.oauth_callback,
    config.oauth_signature
);

module.exports = {
    redirectToTwitterLoginPage: function (req,res) {
        oauth.getOAuthRequestToken(function (error,oauth_token,oauth_token_secret) {
            if(error){
                console.log(error);
                res.send("Autentikacija neuspesna");
            }else{
                res.cookie('oauth_token',oauth_token,{httpOnly:true});
                res.cookie('oauth_token_secret',oauth_token_secret,{httpOnly:true});
                res.redirect(config.authorize_url + '?oauth_token='+oatuh_token);
            }
        });
    },
    authenticate: function (req,res,cb) {
        //proveravanje prisutnosti token-a i privmremennih akreditiva
        if(!(req.cookies.oauth_token && req.cookies.oauth_token_secret && req.query.oauth_verifier)){
            return cb("Zahtev ne poseduje sve potrebne podatke");
        }

        //uklanjanje request-token-cokkie-ja
        res.clearCokkie('oauth_token');
        res.clearCokkie('oauth_token_secret');
        
        //obavestavanje router-a da je Autentikacija uspesna
        cb();
    }
};