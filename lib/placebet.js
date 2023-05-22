const { odds } = require('./../models/odds');

const placebet = async(site1, competition1, site2, competition2) => {
    console.log(site1, competition1)
    var odd1 = await odds.find({});
    // var odd2 = await odds.find({});

    console.log(odd1);
    // console.log(odd2);
}

module.exports.placebet = placebet;