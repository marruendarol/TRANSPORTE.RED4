/*-----------------------------------------------------------------------------------
	API transportista
	transporte.red®
	v 1.0
-------------------------------------------------------------------------------------*/

var express = require('express');
var router = express.Router();
var databases = require('./database');
var dbf = require('./utilities');
var mongoose = databases.mongoose;
var ObjectId = require('mongoose').Types.ObjectId
var validators = databases.validators;
var Schema = mongoose.Schema

var transportistaReq = require('./user');
var transportistas =transportistaReq.transportistas;
var modelTrans = transportistaReq.modelTransportista;

/*-----------------------------------------------------------------------------------
	READ MODEL
-------------------------------------------------------------------------------------*/
router.get('/model',function(req,res){
	res.json(modelTrans)
});


/*-----------------------------------------------------------------------------------
	READ transportista
-------------------------------------------------------------------------------------*/
router.get('/item',function(req,res){


	var userId = req.session._id; ;
	console.log(userId,"USERID")
    var projection = {ts:0}
	transportistas.find({idUser:new ObjectId(userId)},{},function(err,docs){
		res.json(docs[0])
	})
});


/*-----------------------------------------------------------------------------------
    READ Files
-------------------------------------------------------------------------------------*/
router.get('/file-hist/:mongoid/:field',function(req,res){

    var id = req.params.mongoid;
    var field = req.params.field;    
    var projection = {};
    projection[field] = 1;
    projection['_id'] = 0;

    var userId = req.session.id; ;

    console.log(field,"FIELD ")
    
    transportistas.find({userId:userId},projection,function(err,docs){
            var resA = [];
            console.log(docs[0][field])
            for (var i = 0; i < docs[0][field].length; i++) {
                resA.push({
                    uuid : docs[0][field][i].id,
                    name : docs[0][field][i].url
                });
            }

            res.json(resA);
        
    })
});


/*-----------------------------------------------------------------------------------
    GET transportista
-------------------------------------------------------------------------------------*/
router.get('/transportista',function(req,res){

    var _id = req.body._id;

    transportistas.find({},function(err,doc){
        if (err) return handleError(err);
        var items = [];
        for (var i = 0; i < doc.length; i++) {
            items.push({value:doc[i]._id,text:doc[i].nombre})
        }

        res.json(items)
    });
});


/*-----------------------------------------------------------------------------------
	UPDATE UNIDAD
-------------------------------------------------------------------------------------*/
router.post('/update/',function(req,res){
	var userId = req.session._id; ;
	var data = req.body.data;
	transportistas.update({idUser:new ObjectId(userId)},data,function(err,doc){
            res.send(data);
	});
});


/*---------------------------------------------------------
* FILE UPLOAD
----------------------------------------------------------*/

var multer  = require('multer')
var storage = multer.diskStorage({
        destination: function (req, file, cb) {
        	console.log(req.queryt)
            cb(null, 'public/uploads/'+ req.query.folder)
        },
        filename: function (req, file, cb) {
            console.log(req.body.named,"QQ FLINE NAE",req.body)
            cb(null, req.body.named + req.body.qqfilename.slice(req.body.qqfilename.length-4,req.body.qqfilename.length))
        },
        error: function(err){
            console.log(err)
        }
    })

var upload = multer({ storage: storage  })
//app.use(multer({storage:storage}).any());



router.post('/file-upload', upload.single('file'), function (req, res, next) {
    var filename = req.body.named + req.body.qqfilename.slice(req.body.qqfilename.length-4,req.body.qqfilename.length)
    res.json({params : req.query,success: true,id:req.body.named,filename:filename})
})



var fs = require('fs');

router.delete('/file-delete/:id', function (req, res) {
    var fileURL = './public/uploads/logos/'+ req.query.filename + req.query.extension;
    console.log(fileURL,"FILE RUL")
    fs.unlink(fileURL, function(err) {
        if(err && err.code == 'ENOENT') {
            // file doens't exist
            res.json({success:false,msg:err,fileURL:fileURL})
        } else if (err) {
            // maybe we don't have enough permission
            res.json({success:false,msg:err})
        } else {
            res.json({success:true})
        }
    });
   

})



/*-----------------------------------------------------------------------------------
	EXPORT EXPRESS ROUTER
-------------------------------------------------------------------------------------*/
module.exports = router;



