var watson = require('watson-developer-cloud');
var visual_recognition = watson.visual_recognition({
    api_key: '8771c3535374726075493c52830cc038ed62acb3',
    version: 'v3',
    version_date: '2016-05-20'
});

var express = require('express');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var app = express();

app.set('view engine', 'ejs');

// middlewares
app.use(fileUpload());
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.render('form', {});
});
app.post('/upload', function (req, res) {
    if (!req.files) {
        res.status(500).end('No files were uploaded.');
    }

    var params = {
        //images_file: fs.createReadStream('./resources/car.png')
        images_file: req.files.images_file.data
    };

    visual_recognition.classify(params, function (err, result) {
        var cr = [];  // classifier result
        if (err) {
            console.log(err);
            res.status(500).end(err);
        }
        else {
            console.log(JSON.stringify(result, null, 2));
            //res.send(JSON.stringify(result, null, 2));
            for (var i = 0; i < result.images.length; i++) {
                for (var j = 0; j < result.images[i].classifiers.length; j++) {
                    for (var k = 0; k < result.images[i].classifiers[j].classes.length; k++) {
                        cr.push(result.images[i].classifiers[j].classes[k]);
                    }
                }
            }
        }
        var photo = new Buffer(req.files.images_file.data).toString('base64');
        var mimetype = req.files.images_file.mimetype;
        res.render('result', {results: cr, photo: photo, mimetype: mimetype});
    });
});

app.listen(8099, function () {
    console.log('Server running...');
});
