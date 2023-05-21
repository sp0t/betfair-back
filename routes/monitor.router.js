module.exports = app => {
    const mornitor = require("../controller/mornitor.controller");
    app.post("/addMornitor", mornitor.addMornitor);
    app.post("/removeMornitor", mornitor.removeMornitor);
    console.log('getMornitor roter-->');
    app.get("/getMornitor", mornitor.getMornitor);
    app.post("/setMornitor", mornitor.setMornitor);
};