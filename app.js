let express = require("express"),
    ejs = require('ejs'),
    app = express(),
    path = require('path'),
    multer = require('multer'),
    { createWorker } = require('tesseract.js'),
    fs = require('fs');

    // const worker = await createWorker('eng');

    app.set('view engine', 'ejs'); // code to set the ejs for rendering template
 
let storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './uploads')
    },
    filename: function(req, file, callback) {
        console.log(file)
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
   })
 
   app.get('/api/file', function(req, res) {
    res.render('index')
   })
 
  app.post('/api/file', function(req, res) {
    let upload = multer({
        storage: storage,
        fileFilter: function(req, file, callback) {
            let ext = path.extname(file.originalname)
            if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
                return callback(res.end('Only images are allowed'), null)
            }
            callback(null, true)
        }
    }).single('userFile');

    upload(req, res, async function(err) {

        // console.log(req);

        const worker = await createWorker('eng', 1, {
            logger: m => console.log(m), // Add logger here
          });

        (async () => {
        const { data: { text } } = await worker.recognize(req.file.path);
        // const progress = await worker.progress;
        // console.log(progress)
        console.log(text);
        await worker.terminate();
        })();

        // res.send("It worked!")
        res.redirect('file');


        // fs.readFile(`./uploads/${req.file.path}`, (err, data) => {
        //     if (err) return console.log("This is your error", err);

        //     console.log(req)
            
        // });
    });
  });
   let port = process.env.PORT || 3000
   app.listen(port, function() {
    console.log('Node.js listening on port ' + port);
   })