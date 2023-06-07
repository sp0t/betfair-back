module.exports = app => {
    const balance = require("../controller/balance.controller");
    console.log('getbalance=====================1')
    app.get("/getBalance", balance.getBalance);
    app.post("/setMaxBalance", balance.setMaxBalance);
    app.post("/resetAvailableBalance", balance.resetAvailableBalance);
};