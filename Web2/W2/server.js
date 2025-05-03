/**
*  WEB322 - Assignment 2 & 3 & 4 & 5
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy. 
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites, friendsgpt or otherwise) or distributed to other students.
*  I understand that if caught doing so, I will receive zero on this assignment and possibly 
*  fail the entire course..
*  Name: Hoda Karimi
*  Student ID: 138611223
*  Date: July 30 2024
*  Vercel Web App URL: web322-app-e2ot-aiz8z1p1a-hoda-karimis-projects.vercel.app
*  GitHub Repository URL: https://github.com/hk522/web322-app.git
**/
const express = require('express');
const path = require('path');
const storeService = require('./store-service');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');
const pg = require('pg'); 

const app = express();
const port = process.env.PORT || 8080;
app.use(express.urlencoded({ extended: true }));


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
        },
        formatDate: function(dateObj) {
            if (!dateObj || isNaN(new Date(dateObj))) {
                return "Invalid Date";
            }
            dateObj = new Date(dateObj);
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }
        
    }
});

app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to set active route
app.use(function(req, res, next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});
app.use(express.urlencoded({ extended: true }));
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
    storeService.getAllItems()
        .then((data) => {
            if (data.length > 0) {
                res.render('items', { items: data });
            } else {
                res.render('items', { message: "no results" });
            }
        })
        .catch((err) => {
            res.render('items', { message: "no results" });
        });
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
            if (data.length > 0) {
                res.render('categories', { categories: data });
            } else {
                res.render('categories', { message: "no results" });
            }
        })
        .catch((err) => {
            res.render('categories', { message: "no results" });
        });
});


// Add this route to serve the addItem.html file
app.get('/items/add', (req, res) => {
    storeService.getCategories()
        .then((data) => {
            res.render('addItem', { categories: data });
        })
        .catch((err) => {
            res.render('addItem', { categories: [] });
        });
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
//Updating Routes (server.js) to Add / Remove Categories &Items
app.get('/categories/add', (req, res) => {
    try {
        res.render('addCategory');
    } catch (err) {
        console.error("Error rendering addCategory view:", err);
        res.status(500).send("Error rendering addCategory view: " + err.message);
    }
});
app.post('/categories/add', (req, res) => {
    storeService.addCategory(req.body)
        .then(() => {
            res.redirect('/categories');
        })
        .catch((err) => {
            console.error("Error adding category:", err);
            res.status(500).send("Error adding category: " + err.message);
        });
});
app.get('/categories/delete/:id', (req, res) => {
    storeService.deleteCategoryById(req.params.id)
        .then(() => {
            res.redirect('/categories');
        })
        .catch((err) => {
            res.status(500).send("Unable to Remove Category / Category not found");
        });
});
app.get('/items/delete/:id', (req, res) => {
    storeService.deleteItemById(req.params.id)
        .then(() => {
            res.redirect('/items');
        })
        .catch((err) => {
            res.status(500).send("Unable to remove item / Item not found");
        });
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