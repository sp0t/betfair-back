const { odds } = require('./../models/odds');

const placebet = async(site1, site2, competition1, competition2) => {
    console.log(site1, site2, competition1, competition2)
    var odd1 = await odds.find({site: site1, competitionId: parseInt(competition1)});
    var odd2 = await odds.find({site: site2, competitionId: parseInt(competition2)});

    console.log(odd1);
    console.log(odd2);
}

module.exports.placebet = placebet;