const express = require('express');
const app = express();
const mongo = require('mongodb').MongoClient;
const pug = require('pug');
const format_number = require('number-formatter');

//Connection URL
const url = process.env.MONGODB_URI;
const dbName = 'countyrank';

//set views
app.set('views','views');
app.set('view engine','pug');

app.use(express.static('.'));

app.get('/index', function(req,res) {
  res.render('index');
})

app.get('/results', function(req,res) {
  var state = req.query.state
  var rankby = req.query.rankby

  //pass parameters to MongoDB database query
  mongo.connect(process.env.MONGODB_URI, function(err,db) {
    console.log(db);
    var col = db.collection('rankings');
    if(rankby==='Largest') {
      col.find({"State": state,"_rank_top":{$lte:10}},{_id:0}).sort({"_rank_top":1}).map(function(doc) {return {"rank":doc._rank_top,"rank_overall":doc.rank_overall_top, "CountyName":doc.CountyName,"LandArea":format_number( "#,##0.##",doc.CountyLandAreaMiles)};})
        .toArray(function(err,doc) {
          res.render('results',{array:doc,'state':state, 'header':'Largest Counties'});
        });
    } else if(rankby==='Smallest') {
      col.find({"State":state,"_rank_bott":{$lte:10}},{_id:0}).sort({"_rank_bott":1}).map(function(doc) {return {"rank":doc._rank_bott,"rank_overall":doc.rank_overall_bott, "CountyName":doc.CountyName,"LandArea":format_number( "#,##0.##",doc.CountyLandAreaMiles)};})
        .toArray(function(err,doc) {
          res.render('results',{array:doc,'state':state, 'header':'Smallest Counties'});
        });
    } else {
      res.render('index');
    }
  });
})

app.get('*', function(req,res) {
  res.render('index');
});

app.listen(process.env.PORT);
