var express = require("express");
var router = express.Router();
var ObjectId = require("mongodb").ObjectId;

router.get(/\/(U|u)sers/, function(req,res){
    var db = req.db;
    var col = db.collection("Users");
    col.find({}).toArray(function(err,elems){
        if(err) throw err;
        res.send(elems);
    })
});

router.get(/\/(U|u)ser\/([a-zA-Z0-9]+)/,function(req,res){
    var db = req.db;
    var col = db.collection("Users");
    //console.log(req.params);
    col.find({_id: ObjectId(req.params[1])}).toArray(function(err,elems){
         if(err) throw err;
         else {
             if(elems.length !=1) res.status(404).end();
             else {
                 res.send(elems[0]);
                console.log("User requested: " + elems[0].name);
             }
        }
    })
});

router.get(/\/(E|e)vents/, function(req,res){
    var db = req.db;
    var col = db.collection("Events");
    col.find().toArray(function(err,elems){
        if(err) throw err;
        res.send(elems);
    });
});

router.get(/\/(E|e)vent\/([a-zA-Z0-9]+)/, function(req,res){
    var db = req.db;
    var col = db.collection("Events");
    col.find({_id: ObjectId(req.params[1])}).toArray(function(err, elems){
        if(err) throw err;
        else if(elems.length != 1) res.status(404).end();
        else res.send(elems[0]);
    })
});

router.post(/\/(E|e)vent\/create/, function(req,res){
    req.body = Object.keys(req.body)[0];
    var n_event = JSON.parse(req.body);
    var year = n_event.date.match(/(\d+)-\d+-\d+/)[1];
    var month = n_event.date.match(/\d+-(\d+)-\d+/)[1];
    var day = n_event.date.match(/\d+-\d+-(\d+)/)[1];
    n_event.date = (new Date()).setYear(year);
    n_event.date = (new Date(n_event.date)).setMonth(month-1);
    n_event.date =new Date ((new Date(n_event.date)).setDate(day));
    console.log(n_event);

    var ev = {
        assistants: [],
        location: {
            lat: n_event.location.lat,
            lon: n_event.location.lon,
            air: "KAA"
        },
        date: n_event.date,
        name: n_event.name,
        stats:{
            num_assistants: n_event.assistants.length,
            num_confirmed: 0
        }
    };

    for(var i = 0; i < n_event.assistants.length; ++i){
        ev.assistants.push({
            _id : ObjectId(n_event.assistants[i]._id),
            name: n_event.assistants[i].name,
            email: n_event.assistants[i].email,
            img: n_event.assistants[i].img,
            location : n_event.assistants[i].location,
            meta:{
                status: "Pending",
                flights: []
            }
        })
    }

    var db = req.db;
    var col = db.collection("Events");
    col.insert(ev, function(err,data){
        if(err) throw err;
        var rl = data.ops[0];
        var usr_evt = {
            location: rl.location,
            _id: rl._id,
            name: rl.name,
            date: rl.date
        };
        var l = db.collection("Users");

        function notify(pending){
            if(pending.length != 0){
                l.update({
                    _id: ObjectId(pending[0]._id)
                },{"$push":{"events.pending": usr_evt}},function(err,data){
                    if(err) throw err;
                    else {
                        pending.splice(0,1);
                        notify(pending);
                    }
                })
            } else {
                res.end("OK");
            }
        }

        notify(n_event.assistants);

    })
    res.send("OK");
});


router.post(/\/users\/add/, function(req,res){
    var n_usr = {
        name: req.body.name,
        email: req.body.email,
        img: req.body.img,
        location: {
            lat: req.body.lat,
            lon: req.body.lon,
            airport: req.body.air
        },
        events:{
            pending:[],
            confirmed:[]
        }
    };

    var db = req.db;
    var col = db.collection("Users");
    col.insert(n_usr, function(){
        console.log("New User: " + n_usr.name);
        res.send("/user.html");
    })
});



module.exports = router;
