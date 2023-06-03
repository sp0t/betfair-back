const { match } = require('../models/match');

const setBetState = async() => {
    var current = new Date().getTime();
    var data = await match.find({state: 0});

    for (x in data) {
        if (current - data[x].update > 60000) {
            data[x].state = 1;
            await data[x].save();
        }
    }
}

module.exports.setBetState = setBetState;
