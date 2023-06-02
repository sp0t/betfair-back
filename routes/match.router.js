module.exports = app => {
    const match = require("../controller/match.controller");
    app.get("/getMatchs", match.getMatchs);
    app.post("/setMatchStakeMode", match.setMatchStakeMode);
    app.post("/setMatchBetMode", match.setMatchBetMode);
    app.post("/setMatchDiffMode", match.setMatchDiffMode);
    app.post("/setRun", match.setRun);
};