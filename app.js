var express = require('express');
var exphbs = require('express-handlebars');
var request = require('request');
var cheerio = require('cheerio');
var path = require('path');
var bodyParser = require('body-parser');
var async = require('async');
var Xray = require('x-ray');
var util = require('./utils.js');
var x = new Xray();

var app = express();

//set middleware
app.use(bodyParser());

//set template engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');


/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

//data dump
var data = {reviews: [], prevSearch: []};
var tempData = [];
var counter = 1;

//constructor function for objects stored in data dump
function Critic(name, publication, image, fresh){
	this.name = name,
	this.publication = publication,
	this.image = image,
	this.fresh = fresh
}

function SearchItem(title, review, order){
	this.title = title,
	this.review = review,
	this.order = order,
	this.img = 0
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

//wrapper for the request function
function findMovie(url, callback){
	console.log("Searching for movies at " + url);

	x(url, '.review_table_row', [{
		name: '.critic_name a',
		publication: '.critic_name em',
		image: 'img@src',
		fresh: '.review_container .review_icon @class'
	}])
	(function(err, obj){

	if(obj.length === 0){
		console.log("No object");
		
		//set global counter to 17, return;
		counter = 18;
		callback();
		return;
	}
		//amending tempData, which is a global object....
		util.addData(obj, tempData);
		
		counter++;

		callback();

	});

}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

//initial render GET
app.get('/', function(req, res){
	console.log("Got a Get Request!");

	//clear out old data
	util.clearData(data);

	//render using index template and the data dump
	res.render('index', data);	


});

//main post request
app.post('/', function(req, res){

	//use body-parser to set movie name and choice;
	var movie = util.rottenRename(req.body.titleName);
	var choice = req.body.review;

	//add to search history
	data.prevSearch.push(new SearchItem(movie, choice, data.prevSearch.length + 1));

	//create new url, if no input, return w/o scraping
	if(movie === ''){
		console.log("No more results");
		res.render('index', data);
		return;
	}
	var newURL = 'http://www.rottentomatoes.com/m/' + movie + '/reviews/?page=1';

	
	//asyncranously log through 17 pages of reviews
	async.whilst(

		//condition, will continue while true
		function(){return counter <= 17},

		//function called each time
		function(callback){
		
			//prep URL by amending over the expiring one
			var nextURL = util.strip(newURL, counter);

			//async call
			findMovie(nextURL, callback);
		
		},
		
		//final function, called after all 17 complete
		function(err){

			//amends global objects...

			//flatten data.reviews arrays
			tempData = tempData.reduce(function(a, b) {
			  return a.concat(b);
			}, []);

			//filters results, passes filterMatches() as a function expression! Evaluates
			tempData = util.marryResults(data.reviews, util.filterMatches(tempData, choice), choice);

			//...conclusion...//
			
			//clears existing GLOBAL object
			data.reviews = [];

			//transfers all tempData elements to data.reviews
			for(var i = 0; i < tempData.length; i++){
				data.reviews.push(tempData[i]);
			}

			//sets GLOBAL counter
			counter = 1;
			console.log("reseting counter, rendering...");

			//renders
			if(data.reviews.length < 10){
				//render with images
				res.render('fewresults', data);
			}else{
				res.render('index', data);					
			}			
		}
	);

	//clearz array
	tempData.length = [];
	console.log(data);
});

//set port and listen
var port = 3000;
app.listen(port, function() {
    console.log('Express server listening on port ' + port);
});
