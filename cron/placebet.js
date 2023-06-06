require("dotenv").config();

const cron = require('node-cron');

const { placebet } = require('./../lib/placebet');
const { monitor } = require('../models/monitor');
const { stakemode } = require('../models/stakemode');
const { auth } = require('./../models/auth')

const { EmbedBuilder, WebhookClient } = require('discord.js');
const webhookClient = new WebhookClient({url: process.env.DISCORD_WEBHOOK_URL});

const runplacebet = () => {
  cron.schedule("*/3 * * * * *", async() => {

    const embed = new EmbedBuilder()
    .setTitle('Betfair')
    .setColor(0x00FFFF);

    await webhookClient.send({
      content: 'PIG!!!!!!!!!!!!!!!!!!',
      username: 'BETBOT',
      avatarURL: 'https://i.imgur.com/AfFp7pu.png',
      embeds: [embed],
    });

    var [monitors, stakemodes, seesion] = await Promise.all([
      monitor.find({betting: true}),
       stakemode.find({}),
       auth.find({site: 'betfair'})
    ]); 

    if ((monitors.length != 0) && (stakemode.length != 0) && (seesion.length != 0)) {
      var funcs = []
      for (var x in monitors) {
          // funcs.push(placebet(monitors[x].monitId, monitors[x].sites[0].competition[0], stakemodes, seesion[0], 100));
      }
  
      var rets = await Promise.all(funcs)
    } 
  });
}
module.exports.runplacebet = runplacebet;
