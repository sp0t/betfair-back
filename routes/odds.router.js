module.exports = app => {
    const odds = require("../controller/odds.controller");
    app.get("/getMatchs", odds.getMatchs);
    app.get("/getMatchData", odds.getMatchData);
    app.post("/setMatchDiffMode", odds.setMatchDiffMode);
    app.post("/setMatchBetMode", odds.setMatchBetMode);
    app.post("/setRun", odds.setRun);
    app.post("/setMatchStakeMode", odds.setMatchStakeMode);
};