// use next line to debug code, just insert and uncomment
// const pry = require('pryjs'); eval(pry.it);
// return res.send(<variable name>);

const express           = require("express");
const bodyParser        = require("body-parser");
const request           = require("request");
const session           = require('express-session');
const flash             = require('connect-flash');
const app               = express();

// SESSION CONFIGURATION
app.use(require("express-session")({
    secret: "Me siento poderoso en el dia de hoy, gracias a Dios",
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

// APP CONFIGURATION
app.set("view engine", "ejs"); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use((req, res, next) => {
    // make error and success variables available globally
    res.locals.error        = req.flash("error");
    res.locals.success      = req.flash("success");
    next();
});
// ================================================
// ROUTES


// ================================================
// Root route

app.get("/", (req, res) => {
    res.render("index");
});
// ================================================
// All Breeds List route

app.get("/allBreedsList", (req, res) => {
    const url = "https://dog.ceo/api/breeds/list/all";
    request(url, function(error, response, list){
        if(!error && response.statusCode === 200){
            let parsedList = JSON.parse(list);
            let breedsArray = Object.keys(parsedList.message);
            res.render("allBreedsList", { breedsArray });
        } else {
            console.log("Error on get '/allBreedsList' ")
            req.flash('error', "Error on get '/allBreedsList' ");
            return res.redirect('back');   
        }
    });  
});
// ================================================
// By Breed Form route
app.get("/byBreed", (req, res) => {
    res.render("byBreedForm");
});


// By Breed Result route
app.post("/byBreedResult", (req, res) => {
  
    // capture the breed in a variable
    // build the api url 
    // call the api with the url
    // render the result

    const selectedBreed = req.body.selectedBreed;
    // if no breed selected redisplay form
    if(selectedBreed === "Choose...") {
        return res.render("byBreedForm");
    }

    const url = "https://dog.ceo/api/breed/" + selectedBreed + "/images";
    request(url, function(error, response, list){
        if(!error && response.statusCode === 200){
            let data = JSON.parse(list);
            res.render("byBreedResult", { data: data, breed: selectedBreed });
        } else {
            console.log("Error on post '/byBreedResult' ")
            req.flash('error', "Error on post '/byBreedResult' ");
            return res.redirect('back');   
        }
    });  
});
// ================================================
// Show Random Image
    
app.get("/randomImage", (req, res) => {

    // build the api url 
    // call the api with the url
    // render the result

    const url = "https://dog.ceo/api/breeds/image/random";
    request(url, function(error, response, msg){
        if(!error && response.statusCode === 200){
            let msgParsed = JSON.parse(msg);
            let rndImage = msgParsed.message;
            res.render("randomImage", { rndImage: rndImage });
        } else {
            console.log("Error on get '/randomImage' ")
            req.flash('error', "Error on get '/randomImage' ");
            return res.redirect('back');   
        }
    });  
});
// ================================================
// All Sub-Breeds List route

app.get("/allSubBreedsList", (req, res) => {
    
    const url = "https://dog.ceo/api/breeds/list/all";
    request(url, function(error, response, list){
        
        if(!error && response.statusCode === 200){
            let parsedList = JSON.parse(list);
            let breeds = Object.keys(parsedList.message);
            let arrSubBreeds = [];
            for (let i = 0; i < breeds.length; i++) {
                for (let j = 0; j < parsedList.message[breeds[i]].length; j++) {
                    arrSubBreeds.push(breeds[i] + '-' + parsedList.message[breeds[i]][j]);
                }
            }
            res.render("allSubBreedsList", { arrSubBreeds });
        } else {
            console.log("Error on get '/allSubBreedsList' ")
            req.flash('error', "Error on get '/allSubBreedsList' ");
            return res.redirect('back');   
        }
    });  
});

// ================================================
// Sub-Breed images route

app.get("/subBreedImages/:subBreed", (req, res) => {
    
    // create the url
    // do the request and receive a response
    // parse the response
    // save the response list in an array 
    // render template with image list

    let parts = req.params.subBreed.split("-");

    const url = "https://dog.ceo/api/breed/" + parts[0] + "/" + parts[1] + "/images";
    
    request(url, function(error, response, list){
        
        if(!error && response.statusCode === 200){
            let parsedList = JSON.parse(list);
            let urls = [];
            for (let i = 0; i < parsedList.message.length; i++) {
                urls.push(parsedList.message[i]);
            }
            res.render("subBreedImageList", { urls, subBreed: req.params.subBreed });
        } else {
            console.log("Error on get '/subBreedImages/:subBreed' ")
            req.flash('error', "Error on get '/subBreedImages/:subBreed' ");
            return res.redirect('back');   
        }
    });  
});

app.post("/image", (req, res) => {

    // extract the breed from the req.body.link
    // render image and also send breed with the image

    let linkSegmentsArr = req.body.link.split("/breeds/");
    let breedAndImageStr = linkSegmentsArr[1];
    let breedAndImageArr = breedAndImageStr.split("/");
    let breedStr = breedAndImageArr[0];
    res.render("selectedImage", { selectedImage: req.body.link, breed: breedStr });
    
});

// ================================================
// Server listener logic
if(process.env.PORT && process.env.PORT > 0){

    app.listen(process.env.PORT, process.env.IP, function(){
        console.log("Server has Started on port " + process.env.PORT + " and IP " + process.env.IP);
    });

} else {

    var processEnvPORT = 3000;
    var processEnvIP = '0.0.0.0';
    // var processEnvIP = 'localhost';
    app.listen(processEnvPORT, processEnvIP, function(){
        console.log("Server has Started on port " + processEnvPORT + " and IP " + processEnvIP);
    });
};