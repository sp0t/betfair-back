module.exports = app => {
    const betrate = require("../controller/stakemode.controller");
    app.post("/addStakeMode", betrate.addStakeMode);
    app.post("/removeStakeMode", betrate.removeStakeMode);
    app.get("/getStakeMode", betrate.getStakeMode);
};