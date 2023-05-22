var x = 'erecse';

console.log(x.includes('ec'))

var funcs = []
  for (var x in chains) {
    for (var y in ids) {
      funcs.push(getDepositMaxGas(chains[x], ids[y]))
    }
  }
  var rets = await Promise.all(funcs)