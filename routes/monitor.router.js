module.exports = app => {
    const mornitor = require("../controller/mornitor.controller");
    
    app.post("/addMornitor", mornitor.addMornitor);
    app.post("/removeMornitor", mornitor.removeMornitor);
    app.get("/getMornitor", mornitor.getMornitor);
    app.get("/getSport", mornitor.getSport);
    app.get("/getLeague", mornitor.getLeague);
    app.post("/setDiffMode", mornitor.setDiffMode);
    app.post("/setBetMode", mornitor.setBetMode);
    app.post("/setMonit", mornitor.setMonit);
    app.post("/setBetting", mornitor.setBetting);
    app.post("/setPlayMode", mornitor.setPlayMode);
    app.post("/setMarket", mornitor.setMarket);
    app.post("/updateMornitor", mornitor.updateMornitor);
};
