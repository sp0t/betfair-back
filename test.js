const axios = require("axios");
const arr = [1, 5, 6, 9];
const valueToRemove = 6;
const newArr = arr.filter(item => item !== valueToRemove);

const convertDate = (dateString) => {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const formattedDate = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
}

const run = async() => {
    var options = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic UFc3MTEwMDAwUDpQYXNzd29yZDEh'
        },
        params: {
          sportId: 4,
          leagueIds: 487,
        }
      };

    var oddOption = options;
    oddOption.params.oddsFormat = 'Decimal';

    // console.log(oddOption)

    var ret1 =await axios.get("https://api.ps3838.com/v3/fixtures", options);

    var ret2 =await axios.get("https://api.ps3838.com/v3/odds", oddOption)

    ret1 = ret1.data.league[0].events;
    ret2 = ret2.data.leagues[0].events;

    for (var x in ret2) {
        var odd = (ret2[x].periods).find(el => el.number == '0');
        var fixture = ret1.find(el => el.id == ret2[x].id);
        var market = {};
        var away = fixture.away;
        var home = fixture.home;
        var gamedate = convertDate(fixture.starts);

        console.log(ret2[x].id)
        market.moneyline = odd.moneyline;
        market.spreads = {};
        for (var x in odd.spreads) {
            market.spreads[odd.spreads[x].hdp] = {};
            market.spreads[odd.spreads[x].hdp].away = odd.spreads[x].away;
            market.spreads[odd.spreads[x].hdp].home = odd.spreads[x].home;
        }
        market.totals = {};
        for (var x in odd.totals) {
            market.totals[odd.totals[x].points] = {};
            market.totals[odd.totals[x].points].over = odd.totals[x].over;
            market.totals[odd.totals[x].points].under = odd.totals[x].under;
        }

        market.teamTotal = odd.teamTotal;
        console.log(away, home, gamedate, odd.lineId)
    }

}

run();