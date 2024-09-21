const express = require("express");
const bodyParser = require("body-parser");
const spotifyWebApi = require('spotify-web-api-node');
const ejs = require("ejs");
const { json } = require("body-parser");
const app = express();


app.use(express.static("Public"));
app.set("view engine", "ejs");

var trackName = "";
const topArtists = [];


const scopes = ["user-read-email", "user-read-private", "user-library-read","user-top-read"];
var accessToken = "";
var refreshToken = "";

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const clientID = "bcf3de84b8924b17b903893731a5bb64";
// const secretClientID = "e4e74dcd5d744d89929d21b858fd21fe";
// const redirect_uri = "localhost:3000";

var spotifyApi = new spotifyWebApi({

    clientId: "bcf3de84b8924b17b903893731a5bb64",
    clientSecret: "e4e74dcd5d744d89929d21b858fd21fe",
    redirectUri: "http://localhost:3000/callback"

});

app.get("/", function (req, res) {

    console.log("Home Called");
    var authorizeURL = spotifyApi.createAuthorizeURL(scopes);
    res.render("login", {AuthorizeURL: authorizeURL})

});

app.get("/callback", function (req,res) {

    console.log("Callback Called");
    var code = req.query.code;
    var state = req.query.state;

    spotifyApi.authorizationCodeGrant(code).then(
        function (data) {

            accessToken = data.body["access_token"];
            refreshToken = data.body["refresh_token"];
            spotifyApi.setAccessToken(accessToken);

            res.redirect("/app");

        }, function(err) {

            console.log("Something Went Wrong!", err);

        }

    );

    
});

app.get("/app", function(req, res){

    
    console.log("App Called");

    // spotifyApi.getMySavedTracks({limit: 50}).then(function(data){
    //     console.log(data.body.items[0].track.name);
    // });

    // spotifyApi.getMe().then(function(data){
    //     console.log(data.body.display_name, data.body.id);
    // });

    
    const topTracks = [];

    function getTracks() {
        
        const topTrack = spotifyApi.getMyTopTracks({limit:15}).then(function(data){
        
            return data;
    
        });
    
        topTrack.catch(function(er){console.log(er);}).then(function(data){

            // console.log(data.body.items);
            data.body.items.forEach(item => {

                const data = JSON.stringify(item.name);
                topTracks.push(data);


            });

            
            res.render("app", {topTracks: topTracks});
        });

        
    }

    getTracks();

    // console.log(topTracks);


    spotifyApi.getMe().catch(function(er) {console.log(er);}).then(function(data){

        // console.log(data);

    });

    

    

    const topArtist = spotifyApi.getMyTopArtists({limit: 5}).then(function(data){
        

        data.body.items.forEach(function(item){

            topArtists.push(item.name);

        });

    });

    topArtist.catch(function(er){console.log(er);});

    console.log(topTracks);

    
    // console.log(topTrackss);
    

});

app.listen(3000, function(){

    console.log("Server is running on port 3000");

});