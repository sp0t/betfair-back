module.exports = app => {
    const monitor = require("../controller/monitor.controller");
    
    app.post("/addMonitor", monitor.addMonitor);
    app.post("/updateMonitor", monitor.updateMonitor);
    app.post("/removeMonitor", monitor.removeMonitor);
    app.get("/getMonitor", monitor.getMonitor);
    app.get("/getSport", monitor.getSport);
    app.get("/getLeague", monitor.getLeague);
    app.get("/getMarket", monitor.getMarket);
    app.post("/setMonit", monitor.setMonit);
    app.post("/setBetting", monitor.setBetting);
    app.post("/setPlayMode", monitor.setPlayMode);
    app.post("/setKellyMode", monitor.setKellyMode);
};
