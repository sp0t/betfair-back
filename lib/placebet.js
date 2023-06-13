require("dotenv").config();
const axios = require("axios");
const { match } = require('./../models/match');
const { bet } = require('./../models/bet');
const { balance } = require('../models/balance');
const { EmbedBuilder, WebhookClient } = require('discord.js');
const { wss } = require('./socket')
const webhookClient = new WebhookClient({url: process.env.DISCORD_WEBHOOK_URL});

const placebet = async(monitId, sportname, competition, stakemode, token, kellymode) => {
	
	var [matchs,  totalfund]= await Promise.all([
		match.find({monitId: monitId, betid: '0', state: 0, competitionName: {$ne: ''}}),
		balance.find({})
	]) 
	var funcs = [];

	for (var x in matchs) {
		if (matchs[x].ps3838odd.away != undefined && matchs[x].ps3838odd.home != undefined && matchs[x].betfairodd.away != undefined && matchs[x].betfairodd.home != undefined) {
			var btaway = matchs[x].betfairodd.away;
			var bthome = matchs[x].betfairodd.home;
			var psaway = matchs[x].ps3838odd.away;
			var pshome = matchs[x].ps3838odd.home;

			if (btaway != '-' && bthome != '-' && psaway != '-' && pshome != '-') {
				if (matchs[x].stakemode.state) {
					if (matchs[x].stakemode.diffmode == 0) {
						if (matchs[x].stakemode.betmode == 0) {
							if (bthome > btaway) {
								if ((matchs[x].stakemode.from <= Math.abs(btaway - psaway)) && Math.abs((btaway - psaway) <= matchs[x].stakemode.to)) {
									if (kellymode) {
										if (matchs[x].stakemode.kellybalance > 0 && matchs[x].stakemode.kellybalance < totalfund[0].available) {
											funcs.push(betting(matchs[x].betfairodd.marketid, sportname,  matchs[x].betfairodd.awayid, btaway, matchs[x].stakemode.kellybalance, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate))
											totalfund[0].available = totalfund[0].available - matchs[x].stakemode.kellybalance;
										}
									} else {
										if (matchs[x].stakemode.stake > 0 && matchs[x].stakemode.stake <= totalfund[0].available) {
											funcs.push(betting(matchs[x].betfairodd.marketid, sportname,  matchs[x].betfairodd.awayid, btaway, matchs[x].stakemode.stake, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate))
											totalfund[0].available = totalfund[0].available - matchs[x].stakemode.stake;
										}
									}
								}
							} else {
								if ((matchs[x].stakemode.from <= Math.abs(bthome - pshome)) && Math.abs((bthome - pshome) < matchs[x].stakemode.to)) {
									if (kellymode) {
										if (matchs[x].stakemode.kellybalance > 0 && matchs[x].stakemode.kellybalance < totalfund[0].available) {
											funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, matchs[x].stakemode.kellybalance, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate))
											totalfund[0].available = totalfund[0].available - matchs[x].stakemode.kellybalance;
										}
									} else {
										if (matchs[x].stakemode.stake > 0 && matchs[x].stakemode.stake <= totalfund[0].available) {
											funcs.push(betting(matchs[x].betfairodd.marketid, sportname,  matchs[x].betfairodd.awayid, btaway, matchs[x].stakemode.stake, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate))
											totalfund[0].available = totalfund[0].available - matchs[x].stakemode.stake;
										}
									}
								}
							}
						}	else {
							var fund = (matchs[x].stakemode.stake * totalfund / 100) >  matchs[x].stakemode.max ? matchs[x].stakemode.max : (matchs[x].stakemode.stake * totalfund / 100);
	
							if (bthome > btaway) {
								if ((matchs[x].stakemode.from <= Math.abs(btaway - psaway)) && (Math.abs(btaway - psaway) < matchs[x].stakemode.to)) {
									if (kellymode) {
										if (matchs[x].stakemode.kellybalance > 0 && matchs[x].stakemode.kellybalance < totalfund[0].available) {
											funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, matchs[x].stakemode.kellybalance, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate))
											totalfund[0].available = totalfund[0].available - matchs[x].stakemode.kellybalance;
										}
									} else {
										if (fund > 0 && fund <= totalfund[0].available) {
											funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, fund, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate))
											totalfund[0].available = totalfund[0].available - fund;
										}
									}
								}
							} else {
								if ((matchs[x].stakemode.from <= Math.abs(bthome - pshome)) && (Math.abs(bthome - pshome) < matchs[x].stakemode.to)) {
									if (kellymode) {
										if (matchs[x].stakemode.kellybalance > 0 && matchs[x].stakemode.kellybalance < totalfund[0].available) {
											funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, matchs[x].stakemode.kellybalance, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate))
											totalfund[0].available = totalfund[0].available - matchs[x].stakemode.kellybalance;
										}
									} else {
										if (fund > 0 && fund <= totalfund[0].available) {
											funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, fund, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate))
											totalfund[0].available = totalfund[0].available - fund;
										}
									}
								}
							}
						}
					} else {
						if (matchs[x].stakemode.betmode == 0) {
							if (bthome > btaway) {
								if ((matchs[x].stakemode.from <= (Math.abs(btaway - psaway) * 100 / btaway)) && ((Math.abs(btaway - psaway) * 100 / btaway) < matchs[x].stakemode.to)) {
									if (kellymode) {
										if (matchs[x].stakemode.kellybalance > 0 && matchs[x].stakemode.kellybalance < totalfund[0].available) {
											funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, matchs[x].stakemode.kellybalance, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate))
											totalfund[0].available = totalfund[0].available - matchs[x].stakemode.kellybalance;
										}
									} else {
										if (matchs[x].stakemode.stake > 0 && matchs[x].stakemode.stake <= totalfund[0].available) {
											funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, matchs[x].stakemode.stake, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate))
											totalfund[0].available = totalfund[0].available - matchs[x].stakemode.stake;
										}
									}
								}
							} else {
								if ((matchs[x].stakemode.from <= (Math.abs(bthome - pshome) * 100 / bthome)) && ((Math.abs(bthome - pshome) * 100 / bthome) < matchs[x].stakemode.to)) {
									if (kellymode) {
										if (matchs[x].stakemode.kellybalance > 0 && matchs[x].stakemode.kellybalance < totalfund[0].available) {
											funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, matchs[x].stakemode.kellybalance, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate))
											totalfund[0].available = totalfund[0].available - matchs[x].stakemode.kellybalance;
										}
									} else {
										if (matchs[x].stakemode.stake > 0 && matchs[x].stakemode.stake <= totalfund[0].available) {
											funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, matchs[x].stakemode.stake, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate))
											totalfund[0].available = totalfund[0].available - matchs[x].stakemode.stake;
										}
									}
								}
							}
						}	else {
							var fund = (matchs[x].stakemode.stake * totalfund / 100) >  matchs[x].stakemode.max ? matchs[x].stakemode.max : (matchs[x].stakemode.stake * totalfund / 100);
	
							if (bthome > btaway) {
								if ((matchs[x].stakemode.from <= (Math.abs(btaway - psaway) * 100 / btaway)) && ((Math.abs(btaway - psaway) * 100 / btaway) < matchs[x].stakemode.to)) {
									if (kellymode) {
										if (matchs[x].stakemode.kellybalance > 0 && matchs[x].stakemode.kellybalance < totalfund[0].available) {
											funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, matchs[x].stakemode.kellybalance, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate))
											totalfund[0].available = totalfund[0].available - matchs[x].stakemode.kellybalance;
										}
									} else {
										if (fund > 0 && fund <= totalfund[0].available) {
											funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, fund, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate))
											totalfund[0].available = totalfund[0].available - fund;
										}
									}
								}funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, fund, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate))
							} else {
								if ((matchs[x].stakemode.from <= (Math.abs(bthome - pshome) * 100 / bthome)) && ((Math.abs(bthome - pshome) * 100 / bthome) < matchs[x].stakemode.to)) {
									if (kellymode) {
										if (matchs[x].stakemode.kellybalance > 0 && matchs[x].stakemode.kellybalance < totalfund[0].available) {
											funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, matchs[x].stakemode.kellybalance, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate))
											totalfund[0].available = totalfund[0].available - matchs[x].stakemode.kellybalance;
										}
									} else {
										if (fund > 0 && fund <= totalfund[0].available) {
											funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, fund, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate))
											totalfund[0].available = totalfund[0].available - fund;
										}
									}
								}
							}
						}
					}
				} else {
					for (var y in stakemode) {
						if (stakemode[y].diffmode == 0) {
							if (stakemode[y].betmode == 0) {
								if (bthome > btaway) {
									if ((stakemode[y].from <= Math.abs(btaway - psaway)) && Math.abs((btaway - psaway) < stakemode[y].to)) {
										if ((matchs[x].stakemode.from <= (Math.abs(bthome - pshome) * 100 / bthome)) && ((Math.abs(bthome - pshome) * 100 / bthome) < matchs[x].stakemode.to)) {
											if (kellymode) {
												if (matchs[x].stakemode.kellybalance > 0 && matchs[x].stakemode.kellybalance < totalfund[0].available) {
													funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, matchs[x].stakemode.kellybalance, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate));
													totalfund[0].available = totalfund[0].available - matchs[x].stakemode.kellybalance;
													break;
												}
											} else {
												if (stakemode[y].stake > 0 && stakemode[y].stake <= totalfund[0].available) {
													funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, stakemode[y].stake, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate));
													totalfund[0].available = totalfund[0].available - stakemode[y].stake;
													break;
												}
											}
										}
									}
								} else {
									if ((stakemode[y].from <= Math.abs(bthome - pshome)) && Math.abs((bthome - pshome) < stakemode[y].to)) {
										if (kellymode) {
											if (matchs[x].stakemode.kellybalance > 0 && matchs[x].stakemode.kellybalance < totalfund[0].available) {
												funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, matchs[x].stakemode.kellybalance, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate));
												totalfund[0].available = totalfund[0].available - matchs[x].stakemode.kellybalance;
												break;
											}
										} else {
											if (stakemode[y].stake > 0 && stakemode[y].stake <= totalfund[0].available) {
												funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, stakemode[y].stake, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate));
												totalfund[0].available = totalfund[0].available - stakemode[y].stake;
												break;
											}
										}
									}
								}
							}	else {
								var fund = (stakemode[y].stake * totalfund / 100) >  stakemode[y].max ? stakemode[y].max : (stakemode[y].stake * totalfund / 100);
	
								if (bthome > btaway) {
									if ((stakemode[y].from <= Math.abs(btaway - psaway)) && Math.abs((btaway - psaway) < stakemode[y].to)) {
										if ((stakemode[y].from <= Math.abs(bthome - pshome)) && Math.abs((bthome - pshome) < stakemode[y].to)) {
											if (kellymode) {
												if (matchs[x].stakemode.kellybalance > 0 && matchs[x].stakemode.kellybalance < totalfund[0].available) {
													funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, matchs[x].stakemode.kellybalance, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate));
													totalfund[0].available = totalfund[0].available - matchs[x].stakemode.kellybalance;
													break;
												}
											} else {
												if (fund > 0 && fund <= totalfund[0].available) {
													funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, fund, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate));
													totalfund[0].available = totalfund[0].available - fund;
													break;
												}
											}
										}
									}
								} else {
									if ((stakemode[y].from <= Math.abs(bthome - pshome)) && Math.abs((bthome - pshome) < stakemode[y].to)) {
										if ((stakemode[y].from <= Math.abs(bthome - pshome)) && Math.abs((bthome - pshome) < stakemode[y].to)) {
											if (kellymode) {
												if (matchs[x].stakemode.kellybalance > 0 && matchs[x].stakemode.kellybalance < totalfund[0].available) {
													funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, matchs[x].stakemode.kellybalance, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate));
													totalfund[0].available = totalfund[0].available - matchs[x].stakemode.kellybalance;
													break;
												}
											} else {
												if (fund > 0 && fund <= totalfund[0].available) {
													funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, fund, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate));
													totalfund[0].available = totalfund[0].available - fund;
													break;
												}
											}
										}
									}
								}
							}
						} else {
							if (stakemode[y].betmode == 0) {
								if (bthome > btaway) {
									if ((stakemode[y].from <= (Math.abs(btaway - psaway) * 100 / btaway)) && ((Math.abs(btaway - psaway) * 100 / btaway) < stakemode[y].to)) {
										if ((stakemode[y].from <= Math.abs(bthome - pshome)) && Math.abs((bthome - pshome) < stakemode[y].to)) {
											if (kellymode) {
												if (matchs[x].stakemode.kellybalance > 0 && matchs[x].stakemode.kellybalance < totalfund[0].available) {
													funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, matchs[x].stakemode.kellybalance, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate))
													totalfund[0].available = totalfund[0].available - matchs[x].stakemode.kellybalance;
													break;
												}
											} else {
												if (stakemode[y].stake > 0 && stakemode[y].stake <= totalfund[0].available) {
													funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, stakemode[y].stake, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate))
													totalfund[0].available = totalfund[0].available - stakemode[y].stake;
													break;
												}
											}
										}
									}
								} else {
									if ((stakemode[y].from <= (Math.abs(bthome - pshome) * 100 / bthome)) && ((Math.abs(bthome - pshome) * 100 / bthome) < stakemode[y].to)) {
										if (kellymode) {
											if (matchs[x].stakemode.kellybalance > 0 && matchs[x].stakemode.kellybalance < totalfund[0].available) {
												funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, matchs[x].stakemode.kellybalance, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate))
												totalfund[0].available = totalfund[0].available - matchs[x].stakemode.kellybalance;
												break;
											}
										} else {
											if (stakemode[y].stake > 0 && stakemode[y].stake <= totalfund[0].available) {
												funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, stakemode[y].stake, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate))
												totalfund[0].available = totalfund[0].available - stakemode[y].stake;
												break;
											}
										}
									}
								}
							}	else {
								var fund = (stakemode[y].stake * totalfund / 100) >  stakemode[y].max ? stakemode[y].max : (stakemode[y].stake * totalfund / 100);
	
								if (bthome > btaway) {
									if ((stakemode[y].from <= (Math.abs(btaway - psaway) * 100 / btaway)) && ((Math.abs(btaway - psaway) * 100 / btaway) < stakemode[y].to)) {
										if (kellymode) {
											if (matchs[x].stakemode.kellybalance > 0 && matchs[x].stakemode.kellybalance < totalfund[0].available) {
												funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, matchs[x].stakemode.kellybalance, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate))
												totalfund[0].available = totalfund[0].available - matchs[x].stakemode.kellybalance;
												break;
											}
										} else {
											if (fund > 0 && fund <= totalfund[0].available) {
												funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.awayid, btaway, fund, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].away, btaway, bthome, psaway, pshome, matchs[x].gamedate))
												totalfund[0].available = totalfund[0].available - fund;
												break;
											}
										}
									}
								} else {
									if ((stakemode[y].from <= (Math.abs(bthome - pshome) * 100 / bthome)) && ((Math.abs(bthome - pshome) * 100 / bthome) < stakemode[y].to)) {
										if (kellymode) {
											if (matchs[x].stakemode.kellybalance > 0 && matchs[x].stakemode.kellybalance < totalfund[0].available) {
												funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, matchs[x].stakemode.kellybalance, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate))
												totalfund[0].available = totalfund[0].available - matchs[x].stakemode.kellybalance;
												break;
											}
										} else {
											if (fund > 0 && fund <= totalfund[0].available) {
												funcs.push(betting(matchs[x].betfairodd.marketid, sportname, matchs[x].betfairodd.homeid, bthome, fund, token, matchs[x].eventId, matchs[x].away, matchs[x].home , competition, matchs[x].home, btaway, bthome, psaway, pshome, matchs[x].gamedate))
												totalfund[0].available = totalfund[0].available - fund;
												break;
											}
										}
									}
								}
							}
						}
					}
				} 
			}
		}
	} 

	if (funcs.length > 0)
		var ret = await Promise.all([funcs]);
}

const betting = async(marketid, sportname, selectionId, price, size, token, eventid, away, home, leagueid, betplace, btaway, bthome, psaway, pshome, gamedate) => {

    console.log('betting notice.....');
    var betfair = {away: btaway, home: bthome};
    var other = {away: psaway, home: pshome};

    var options = {
        headers: {
          'X-Application': 'XCy3BR7EjehV32o3',
          'Accept':'application/json'
        }
      };
    options.headers['Content-type'] = "application/json";
    options.headers['X-Authentication'] = token;

    data = {
        'marketId': marketid,
        'instructions': [
            {
                'selectionId': selectionId,
                'side': 'BACK', 
                'orderType': 'LIMIT',
                'limitOrder': {
                    'size': size,
                    'price': price
                }
            }
        ]
      }

    try {
        var ret =  await axios.post('https://api.betfair.com/exchange/betting/rest/v1.0/placeOrders/', data, options);
				if (ret.data.status == 'SUCCESS')
				{
					var [betresult, betdata] = await Promise.all([
						bet.insertMany ( [
							{
								betid: ret.data.instructionReports[0].betId,
								betdate: ret.data.instructionReports[0].placedDate,
								gamedate: gamedate,
								away: away,
								home: home,
								odds: price,
								stake: size,
								place: betplace,
								market: 'moneyline',
								competition: leagueid,
								eventid: eventid,
								betfair: betfair,
								other: other,
								state: 0
							}
						]),						
						match.find({eventId: eventid, state: 0})
					]) 

					betdata[0].betid = ret.data.instructionReports[0].betId;

					var [ret, ret1] = await Promise.all([
						balance.find({}),
						betdata[0].save(),
					])

					var content = `Bet on ${away} vs ${home} in ${sportname}.\n(Place: ${betplace}, Stake: $${size}, Odd: ${price})`;

					const embed = new EmbedBuilder()
					.setTitle('Betfair')
					.setColor(0xff0000);

					await webhookClient.send({
						content: content,
						username: 'Betfair',
						avatarURL: 'https://i.imgur.com/oBPXx0D.png'
						// embeds: [embed],
					});

					var senddata = {
						type: 'betalarm',
						data: content
					  }
					
					// Broadcast the match data to all connected clients
					wss.clients.forEach((client) => {
					if (client.readyState === WebSocket.OPEN) {
							client.send(JSON.stringify(senddata));
						}
					});

					if (ret[0] != undefined){
						ret[0].available = ret[0].available - size;
						ret[0].save();
					}

				}      
    } catch (error) {
       console.error(error);
    }
}
module.exports.placebet = placebet;