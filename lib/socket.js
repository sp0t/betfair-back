require("dotenv").config();
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.WEBSOCKET_PORT });
let sportName = 'ALL';
let competitionName = 'ALL';
let monitID = '';
let betID = '';
let awayName = '';
let homeName = '';

const startSocketServer = async() => {
    wss.on('connection', (ws) => {
        console.log('WebSocket connected');
        ws.on('message', (message) => {
            const parsedMessage = JSON.parse(message);

            if (parsedMessage.type == 'SportLeagueName') {
                sportName = parsedMessage.sportname;
                competitionName = parsedMessage.competitionname;
                console.log('SportLeagueName===============>', sportName, competitionName);
            }

            if (parsedMessage.type == 'BetInformation') {
                monitID = parsedMessage.monitid;
                betID = parsedMessage.betid;
                awayName = parsedMessage.away;
                homeName = parsedMessage.home;
            }
        });

        // Event handler for WebSocket disconnection
        ws.on('close', () => {
        console.log('WebSocket disconnected');
        });
    });
}

const getSportLeagueName = () => {
    var ret = {
        sportname: sportName,
        competitionname: competitionName
    };

    return ret;
}

const getBetInformation = () => {
    var ret = {
        monitid: monitID,
        betid: betID,
        away: awayName,
        home: homeName
    };

    return ret;
}


module.exports.wss = wss;
module.exports.startSocketServer = startSocketServer;
module.exports.getSportLeagueName = getSportLeagueName;
module.exports.getBetInformation = getBetInformation;