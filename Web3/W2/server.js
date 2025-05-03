/********************************************************************************
*  WEB422 – Assignment 2
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
*  Name: Hoda Karimi Student ID: 138611223 Date: ______________
*  github: https://github.com/hk522/Web422A2.git
*  Vercel: https://web422-a2-393eqmlhk-hoda-karimis-projects.vercel.app/
*  Note: I added a Json file to test my code
*  because I had some problem with pages and needed to make sure it works
*  And I know we are suppose to initialize perPage to 10 but I 
*  Initialized it to 2 to test If page works correctly
*************************************************************************************/
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require('path');
const ListingsDB = require("./modules/listingsDB.js");
const db = new ListingsDB();

dotenv.config();
const app = express();

app.use(cors());

app.use(express.json());
app.use(express.static(__dirname));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'index.html'));
});


const PORT = process.env.PORT || 3000;

db.initialize(process.env.MONGODB_CONN_STRING)
  .then(() => {
    app.post("/api/listings", async (req, res) => {
      try {
        const newListing = await db.addNewListing(req.body);
        res.status(201).json(newListing); // 201: Created
      } catch (err) {
        res.status(500).json({ error: "Unable to add listing" }); // 500: Internal Server Error
      }
    });

    // GET /api/listings - Get all listings 
    app.get("/api/listings", async (req, res) => {
        const page = parseInt(req.query.page);
        const perPage = parseInt(req.query.perPage);
        const name = req.query.name;
  
        if (!page || !perPage) {
          return res.status(400).json({ error: "page and perPage query parameters must be valid numbers" }); // 400: Bad Request
        }
  
        try {
          const listings = await db.getAllListings(page, perPage, name);
          res.json(listings);
        } catch (err) {
          res.status(500).json({ error: "Unable to fetch listings" }); // 500: Internal Server Error
        }
      });

    // GET /api/listings/:id - Get a specific listing by its _id
    app.get("/api/listings/:id", async (req, res) => {
      try {
        const listing = await db.getListingById(req.params.id);
        if (listing) {
          res.json(listing);
        } else {
          res.status(404).json({ error: "Listing not found" }); // 404: Not Found
        }
      } catch (err) {
        res.status(500).json({ error: "Unable to fetch the listing" }); // 500: Internal Server Error
      }
    });

    // PUT /api/listings/:id - Update a listing by its _id
    app.put("/api/listings/:id", async (req, res) => {
      try {
        const updateResult = await db.updateListingById(req.body, req.params.id);
        if (updateResult.nModified > 0) {
          res.status(200).json({ message: "Listing updated successfully" }); // 200: OK
        } else {
          res.status(404).json({ error: "Listing not found or not updated" }); // 404: Not Found
        }
      } catch (err) {
        res.status(500).json({ error: "Unable to update the listing" }); // 500: Internal Server Error
      }
    });

    // DELETE /api/listings/:id - Delete a listing by its _id
    app.delete("/api/listings/:id", async (req, res) => {
      try {
        const deleteResult = await db.deleteListingById(req.params.id);
        if (deleteResult.deletedCount > 0) {
          res.status(204).end(); // 204: No Content
        } else {
          res.status(404).json({ error: "Listing not found" }); // 404: Not Found
        }
      } catch (err) {
        res.status(500).json({ error: "Unable to delete the listing" }); // 500: Internal Server Error
      }
    });

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // Log any errors
    console.error("Failed to connect to MongoDB:", err);
  });
  module.exports = app;
