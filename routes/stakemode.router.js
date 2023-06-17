module.exports = app => {
    const stakemode = require("../controller/stakemode.controller");
    app.post("/addStakeMode", stakemode.addStakeMode);
    app.post("/removeStakeMode", stakemode.removeStakeMode);
    app.post("/modifyStakeMode", stakemode.modifyStakeMode);
    app.get("/getStakeMode", stakemode.getStakeMode);
};