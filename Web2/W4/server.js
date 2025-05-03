const express = require('express');
const path = require('path');
const storeService = require('./store-service');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');

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

// Configure express-handlebars with custom helpers
const hbs = exphbs.create({
    extname: '.hbs',
    helpers: {
        navLink: function(url, options){
            return (
                '<li class="nav-item"><a ' +
                (url == app.locals.activeRoute ? ' class="nav-link active" ' : ' class="nav-link" ') +
                ' href="' + url + '">' +
                options.fn(this) + '</a></li>'
            );
        },
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context) {
            return context;
        }
    }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');

// Middleware to set active route
app.use(function(req, res, next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});

// Serve static files from the 'public' folder
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // To parse form data

// Redirect the root route to "/about"
app.get('/', (req, res) => {
    res.redirect('/shop');
});

// Return the about.html file from the views folder
app.get('/about', (req, res) => {
    res.render('about');
});

// Route to return all published items
app.get("/shop", async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
  
    try {
      // declare empty array to hold "item" objects
      let items = [];
  
      // if there's a "category" query, filter the returned items by category
      if (req.query.category) {
        // Obtain the published "item" by category
        items = await storeService.getPublishedItemsByCategory(req.query.category);
      } else {
        // Obtain the published "items"
        items = await storeService.getPublishedItems();
      }
  
      // sort the published items by itemDate
      items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
  
      // get the latest item from the front of the list (element 0)
      let item = items[0];
  
      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;
      viewData.item = item;
    } catch (err) {
      viewData.message = "no results";
    }
  
    try {
      // Obtain the full list of "categories"
      let categories = await storeService.getCategories();
  
      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
    } catch (err) {
      viewData.categoriesMessage = "no results";
    }
  
    // render the "shop" view with all of the data (viewData)
    res.render("shop", { data: viewData });
  });

// Route to return a specific item by id
app.get('/shop/:id', async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "item" objects
    let items = [];

    // if there's a "category" query, filter the returned items by category
    if (req.query.category) {
      // Obtain the published "items" by category
      items = await storeService.getPublishedItemsByCategory(req.query.category);
    } else {
      // Obtain the published "items"
      items = await storeService.getPublishedItems();
    }

    // sort the published items by itemDate
    items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));

    // store the "items" data in the viewData object (to be passed to the view)
    viewData.items = items;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the item by "id"
    viewData.item = await storeService.getItemById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await storeService.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", { data: viewData });
});

// Route to return all items with optional filters
app.get('/items', (req, res) => {
    if (req.query.category) {
        storeService.getItemsByCategory(req.query.category)
            .then((data) => {
                res.render('items', { items: data });
            })
            .catch((err) => {
                res.render('items', { message: "no results" });
            });
    } else if (req.query.minDate) {
        storeService.getItemsByMinDate(req.query.minDate)
            .then((data) => {
                res.render('items', { items: data });
            })
            .catch((err) => {
                res.render('items', { message: "no results" });
            });
    } else {
        storeService.getAllItems()
            .then((data) => {
                res.render('items', { items: data });
            })
            .catch((err) => {
                res.render('items', { message: "no results" });
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
            res.render('categories', { categories: data });
        })
        .catch((err) => {
            res.render('categories', { message: "no results" });
        });
});

// Add this route to serve the addItem.html file
app.get('/items/add', (req, res) => {
    res.render('addItem');
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
    res.status(404).render('404');
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
