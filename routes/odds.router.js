module.exports = app => {
    const odds = require("../controller/odds.controller");
    app.get("/getOddData", odds.getOddData);
};