module.exports = app => {
    const formula = require("../controller/formula.controller");
    app.get("/getFormula", formula.getFormula);
    app.post("/addFormula", formula.addFormula);
    app.post("/modifyFormula", formula.modifyFormula);
    app.post("/removeFormula", formula.removeFormula);
};