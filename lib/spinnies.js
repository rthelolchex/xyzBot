const spin = require('spinnies');

const spinner = {
  interval: 180,
  frames: [
    "x|",
    "xy|",
    "xyz|",
    "xyzB|",
    "xyzBo|",
    "xyzBot|",
    "xyzBot |",
    "xyzBot b|",
    "xyzBot by|",
    "xyzBot by |",
    "xyzBot by r|",
    "xyzBot by rt|",
    "xyzBot by rth|",
    "xyzBot by rthe|",
    "xyzBot by rthel|",
    "xyzBot by rthelo|",
    "xyzBot by rthelol|",
    "xyzBot by rthelolc|",
    "xyzBot by rthelolch|",
    "xyzBot by rthelolche|",
    "xyzBot by rthelolchex|",
    "xyzBot by rthelolchex",
    "xyzBot by rthelolchex|",
    "xyzBot by rthelolchex",
    "xyzBot by rthelolchex|",
    "xyzBot by rthelolchex",
    "xyzBot by rthelolchex|",
    "xyzBot by rthelolchex",
    "xyzBot by rthelolchex|",
    "xyzBot by rthelolchex",
    "xyzBot by rthelolchex|",
    "xyzBot by rthelolchex",
    "xyzBot by rthelolchex|",
    "xyzBot by rthelolchex",
    "xyzBot by rthelolchex|",
    "xyzBot by rthelolchex",
    "xyzBot by rthelolchex|",
    "xyzBot by rthelolchex",
    "xyzBot by rthelolchex|",
    "xyzBot by rthelolchex",
    "xyzBot by rthelolchex|",
    "xyzBot by rthelolchex",
    "xyzBot by rthelolchex|",
    "xyzBot by rthelolchex",
    "xyzBot by rthelolchex|",
    "xyzBot by rthelolche|",
    "xyzBot by rthelolch|",
    "xyzBot by rthelolc|",
    "xyzBot by rthelol|",
    "xyzBot by rthelo|",
    "xyzBot by rthel|",
    "xyzBot by rthe|",
    "xyzBot by rth|",
    "xyzBot by rt|",
    "xyzBot by r|",
    "xyzBot by |",
    "xyzBot by|",
    "xyzBot b|",
    "xyzBot |",
    "xyzBot|",
    "xyzBo|",
    "xyzB|",
    "xyz|",
    "xy|",
    "x|",
    "|",
    "",
    "|",
    "",
    "|",
    "",
    "|",
    "",
    "|",
    "",
    "|",
    "",
    "|",
    "",
    "|",
    "",
    "|",
    "",
    "|",
    "",
    "|",
    "",
    "|",
    "",
    ]
}
  
  let globalSpinner;
  
  
  const getGlobalSpinner = (disableSpins = false) => {
    if(!globalSpinner) globalSpinner = new spin({ color: 'cyanBright', succeedColor: 'cyanBright', spinner, disableSpins});
    return globalSpinner;
  }
  
  spins = getGlobalSpinner(false)
  
  const startspin = (id, text) => {
      spins.add(id, {text: text})
      }
  const info = (id, text) => {
      spins.update(id, {text: text})
  }
  const success = (id, text) => {
      spins.succeed(id, {text: text})
  
      }
  
  const close = (id, text) => {
      spins.fail(id, {text: text})
  }

module.exports = { startspin, info, success, close }