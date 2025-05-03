
const Sequelize = require('sequelize');
const pg = require('pg'); 
var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'Tu5rSBem9KXo', {
    host: 'ep-bitter-bread-a54hilop.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true },
    logging: console.log
});

const Item = sequelize.define('Item', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    itemDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE
});
// Define the Category model
const Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

Item.belongsTo(Category, { foreignKey: 'category' });
const { gte } = Sequelize.Op;

module.exports = {
    initialize: function() {
        return new Promise((resolve, reject) => {
            sequelize.sync({ force: true })
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    console.error("Unable to sync the database:", err);
                    reject("unable to sync the database");
                });
        });
    },
    getAllItems: function() {
        return new Promise((resolve, reject) => {
            Item.findAll()
                .then((data) => {
                    resolve(data);
                })
                .catch((err) => {
                    reject("no results returned");
                });
        });
    },
    getPublishedItems: function() {
        return new Promise((resolve, reject) => {
            Item.findAll({
                where: {
                    published: true
                }
            })
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("no results returned");
            });
        });
    
    },
    getPublishedItemsByCategory: function(category) {
        return new Promise((resolve, reject) => {
            Item.findAll({
                where: {
                    published: true,
                    category: category
                }
            })
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("no results returned");
            });
        });
    },    
    getCategories: function() {
        return new Promise((resolve, reject) => {
            Category.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch((err) => {
                reject("no results returned");
            });
        });
    },    
    addItem: function(itemData) {
        return new Promise((resolve, reject) => {
            itemData.published = (itemData.published) ? true : false;
    
            // Iterate over every property and set blank values to null
            for (let prop in itemData) {
                if (itemData[prop] === "") {
                    itemData[prop] = null;
                }
            }

           
                itemData.itemDate = new Date();
            
    
            Item.create(itemData)
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    reject("unable to create item");
                });
        });
    },    
    getItemsByCategory: function(category) {
        return new Promise((resolve, reject) => {
            Item.findAll({
                where: {
                    category: category
                }
            })
                .then((data) => {
                    resolve(data);
                })
                .catch((err) => {
                    reject("no results returned");
                });
        });
    },

getItemsByMinDate: function(minDateStr) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                itemDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        })
        .then((data) => {
            // If the findAll operation was successful, resolve the promise with the data
            resolve(data);
        })
        .catch((err) => {
            // If there was an error, reject the promise with a meaningful message
            reject("no results returned");
        });
    });
},
    getItemById: function(id) {
        return new Promise((resolve, reject) => {
            Item.findAll({
                where: {
                    id: id
                }
            })
                .then((data) => {
                    if (data.length > 0) {
                        resolve(data[0]);
                    } else {
                        reject("no results returned");
                    }
                })
                .catch((err) => {
                    reject("no results returned");
                });
        });
    },
    addCategory: function(categoryData) {
        return new Promise((resolve, reject) => {
            // Ensure blank values are set to null
            for (let prop in categoryData) {
                if (categoryData[prop] === "") {
                    categoryData[prop] = null;
                }
            }
    
            // Create the new category
            Category.create(categoryData)
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    console.log("addCategory error: ", err); 
                    reject("unable to create category: " + err.message);
                });
        });
    },
    
    deleteCategoryById: function(id) {
        return new Promise((resolve, reject) => {
            Category.destroy({
                where: {
                    id: id
                }
            })
            .then((deleted) => {
                if (deleted) {
                    resolve();
                } else {
                    reject("Category not found");
                }
            })
            .catch((err) => {
                reject("Unable to remove category / Category not found");
            });
        });
    },
    
    deleteItemById: function(id) {
        return new Promise((resolve, reject) => {
            Item.destroy({
                where: {
                    id: id
                }
            })
            .then((deleted) => {
                if (deleted) {
                    resolve();
                } else {
                    reject("Item not found");
                }
            })
            .catch((err) => {
                reject("Unable to remove item / Item not found");
            });
        });
    }
    
};
