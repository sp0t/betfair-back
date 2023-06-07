module.exports = app => {
    const balance = require("../controller/balance.controller");
    app.get("/getBalance", balance.getBalance);
    app.post("/setMaxBalance", balance.setMaxBalance);
    app.post("/resetAvailableBalance", balance.resetAvailableBalance);
};