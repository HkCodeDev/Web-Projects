const fs = require('fs');
const path = require('path');

let items = [];
let categories = [];

module.exports = {
    initialize: function() {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8', (err, data) => {
                if (err) {
                    reject("unable to read file");
                    return;
                }
                try {
                    items = JSON.parse(data);
                } catch (e) {
                    reject("unable to parse items file");
                    return;
                }

                fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
                    if (err) {
                        reject("unable to read file");
                        return;
                    }
                    try {
                        categories = JSON.parse(data);
                        resolve();
                    } catch (e) {
                        reject("unable to parse categories file");
                    }
                });
            });
        });
    },
    getAllItems: function() {
        return new Promise((resolve, reject) => {
            if (items.length === 0) {
                reject("no results returned");
            } else {
                resolve(items);
            }
        });
    },
    getPublishedItems: function() {
        return new Promise((resolve, reject) => {
            const publishedItems = items.filter(item => item.published === true);
            if (publishedItems.length === 0) {
                reject("no results returned");
            } else {
                resolve(publishedItems);
            }
        });
    },
    getCategories: function() {
        return new Promise((resolve, reject) => {
            if (categories.length === 0) {
                reject("no results returned");
            } else {
                resolve(categories);
            }
        });
    },
    addItem: function(itemData) {
        return new Promise((resolve, reject) => {
            if (itemData.published === undefined) {
                itemData.published = false;
            } else {
                itemData.published = true;
            }
            itemData.id = items.length + 1;
            items.push(itemData);
            resolve(itemData);
        });
    },
    getItemsByCategory: function(category) {
        return new Promise((resolve, reject) => {
            const filteredItems = items.filter(item => item.category == category);
            if (filteredItems.length === 0) {
                reject("no results returned");
            } else {
                resolve(filteredItems);
            }
        });
    },
    getItemsByMinDate: function(minDateStr) {
        return new Promise((resolve, reject) => {
            const minDate = new Date(minDateStr);
            const filteredItems = items.filter(item => new Date(item.postDate) >= minDate);
            if (filteredItems.length === 0) {
                reject("no results returned");
            } else {
                resolve(filteredItems);
            }
        });
    },
    getItemById: function(id) {
        return new Promise((resolve, reject) => {
            const item = items.find(item => item.id == id);
            if (item) {
                resolve(item);
            } else {
                reject("no result returned");
            }
        });
    }
};
