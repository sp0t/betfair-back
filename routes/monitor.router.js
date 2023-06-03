module.exports = app => {
    const monitor = require("../controller/monitor.controller");
    
    app.post("/addMornitor", monitor.addMornitor);
    app.post("/removeMornitor", monitor.removeMornitor);
    app.get("/getMornitor", monitor.getMornitor);
    app.get("/getSport", monitor.getSport);
    app.get("/getLeague", monitor.getLeague);
    app.post("/setMonit", monitor.setMonit);
    app.post("/setBetting", monitor.setBetting);
    app.post("/setPlayMode", monitor.setPlayMode);
    app.post("/updateMornitor", monitor.updateMornitor);
};
