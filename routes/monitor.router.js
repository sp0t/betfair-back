module.exports = app => {
    const monitor = require("../controller/monitor.controller");
    
    app.post("/addMonitor", monitor.addMonitor);
    app.post("/removeMonitor", monitor.removeMonitor);
    app.get("/getMonitor", monitor.getMonitor);
    app.get("/getSport", monitor.getSport);
    app.get("/getLeague", monitor.getLeague);
    app.post("/setMonit", monitor.setMonit);
    app.post("/setBetting", monitor.setBetting);
    app.post("/setPlayMode", monitor.setPlayMode);
    app.post("/setKellyMode", monitor.setKellyMode);
    app.post("/updateMornitor", monitor.updateMornitor);
};
