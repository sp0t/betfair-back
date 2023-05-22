const { odds } = require('./../models/odds');
const setBetState = async() => {
    var current = new Date().getTime();
    var data = await odds.find({state: 0});

    for (x in data) {
        console.log(data[x].away, data[x].homem, data[x].update)
        if (current - data[x].update > 6000) {
            data[x].state = 1;
            await data[x].save();
        }
    }
}

module.exports.setBetState = setBetState;
