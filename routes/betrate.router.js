module.exports = app => {
    const betrate = require("../controller/betrate.controller");
    app.post("/addBetrate", betrate.addBetrate);
    app.post("/removeBetrate", betrate.removeBetrate);
    app.get("/getBetrate", betrate.getBetrate);
};