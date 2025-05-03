const express = require('express');
const path = require('path');
const storeService = require('./store-service');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

const app = express();
const port = process.env.PORT || 8080;

// Cloudinary configuration
cloudinary.config({
    cloud_name: 'drsj0yp9z',
    api_key: '314826291923293',
    api_secret: 'Qj0w3l7oz1L-iEK4Ac7eh80HMUE',
    secure: true
});

// Multer configuration
const upload = multer(); // no { storage: storage } since we are not using disk storage

// Serve static files from the 'public' folder
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // To parse form data

// Redirect the root route to "/about"
app.get('/', (req, res) => {
    res.redirect('/about');
});

// Return the about.html file from the views folder
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Route to return all published items
app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
});

// Route to return all items with optional filters
app.get('/items', (req, res) => {
    if (req.query.category) {
        storeService.getItemsByCategory(req.query.category)
            .then((data) => {
                res.json(data);
            })
            .catch((err) => {
                res.status(500).json({ message: err });
            });
    } else if (req.query.minDate) {
        storeService.getItemsByMinDate(req.query.minDate)
            .then((data) => {
                res.json(data);
            })
            .catch((err) => {
                res.status(500).json({ message: err });
            });
    } else {
        storeService.getAllItems()
            .then((data) => {
                res.json(data);
            })
            .catch((err) => {
                res.status(500).json({ message: err });
            });
    }
});

// Route to return a single item by id
app.get('/item/:id', (req, res) => {
    storeService.getItemById(req.params.id)
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.status(404).json({ message: err });
        });
});

// Route to return all categories
app.get('/categories', (req, res) => {
    storeService.getCategories()
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.status(500).json({ message: err });
        });
});

// Add this route to serve the addItem.html file
app.get('/items/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'addItem.html'));
});

// Route to handle item addition
app.post('/items/add', upload.single("featureImage"), (req, res) => {
    if(req.file){
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }

        upload(req).then((uploaded) => {
            processItem(uploaded.url);
        }).catch((err) => {
            res.status(500).send("Error uploading image to Cloudinary: " + err);
        });
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;
        storeService.addItem(req.body)
            .then(() => {
                res.redirect('/items');
            })
            .catch((err) => {
                res.status(500).send("Error adding item: " + err);
            });
    }
});

// Handle unmatched routes
app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

// Initialize the store service and start the server
storeService.initialize()
    .then(() => {
        app.listen(port, () => {
            console.log(`Express http server listening on port http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.log('Failed to initialize the store service:', err);
    });

module.exports = app;
