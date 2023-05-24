module.exports = app => {
    const mornitor = require("../controller/mornitor.controller");
    app.post("/addMornitor", mornitor.addMornitor);
    app.post("/removeMornitor", mornitor.removeMornitor);
    app.get("/getMornitor", mornitor.getMornitor);
    app.get("/getSport", mornitor.getSport);
    app.get("/getLeague", mornitor.getLeague);
    app.post("/setMornitor", mornitor.setMornitor);
    app.post("/setInPlay", mornitor.setInPlay);
};