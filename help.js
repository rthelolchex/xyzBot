const config = require("./config.json")
const fs = require('fs')
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)
exports.help = (conn, m, prefix, pushname, uptime, statususer) => {
  return `╔${monospace("══> [ xyzBot ] <══")}
║
║ ╔══${monospace("> [ U S E R  S T A T S ] <")}══
║ ║ ◈ Hey there, ${pushname}!
║ ║ ◈ Status User : ${statususer}
║ ║ ◈ Level : ${global.db.data.users[m.sender].level} (WIP, coming soon)
║ ║ ◈ EXP : ${global.db.data.users[m.sender].exp}
║ ╚══════
║ ╔══${monospace("> [ B O T  S T A T S ] <")}══
║ ║ ◈ Uptime : ${uptime}
║ ║ ◈ Battery : ${conn.battery ? `${conn.battery.live ? "Charging," : ''} ${conn.battery.value}%` : 'Not recognized'}
║ ║ ◈ Total features : 42 - 16 duplicate = 36
║ ╚══════
╠════════════
║ ${readMore}
║ Here are the available commands you can use.
║
║ ╔══${monospace("> [ G R O U P ] <")}══
║ ║ ◈ ${prefix}afk (reason)
║ ║ ◈ ${prefix}absen (admin only)
║ ║ ◈ ${prefix}cekabsen
║ ║ ◈ ${prefix}deleteabsen
║ ║ ◈ ${prefix}hapusabsen
║ ║ ◈ ${prefix}mulaiabsen
║ ║ ◈ ${prefix}hadir
║ ║ ◈ ${prefix}present
║ ║ ◈ ${prefix}revokelink (admin only)
║ ║ ◈ ${prefix}resetlink (admin only)
║ ║ ◈ ${prefix}resetlinkgc (admin only)
║ ║ ◈ ${prefix}announcement (text)
║ ║ ◈ ${prefix}hidetag (text)
║ ║ ◈ ${prefix}pengumuman (text)
║ ║ ◈ ${prefix}warn (tag) (reason) (admin only)
║ ║ ◈ ${prefix}warnlist
║ ║ ◈ ${prefix}deletewarn (tag) (admin only)
║ ║ ◈ ${prefix}rules
║ ║ ◈ ${prefix}setrules (text) (admin only)
║ ║ ◈ ${prefix}simulate (text) (admin only)
║ ║ ◈ ${prefix}setgroupsubject (text) (admin only)
║ ║ ◈ ${prefix}setgroupdescription (text) (admin only)
║ ║ ◈ ${prefix}setgroupname (text) (admin only)
║ ║ ◈ ${prefix}setgroupdesc (text) (admin only)
║ ║ ◈ ${prefix}setgcname (text) (admin only)
║ ║ ◈ ${prefix}setgcsubject (text) (admin only)
║ ║ ◈ ${prefix}setgcdesc (text) (admin only)
║ ║ ◈ ${prefix}setgcdescription (text) (admin only)
║ ╚══════
║ ╔══${monospace("> [ T O O L S ] <")}══
║ ║ ◈ ${prefix}readmore (text | spoiler text)
║ ║ ◈ ${prefix}spoiler (text | spoiler text)
║ ║ ◈ ${prefix}readviewonce
║ ║ ◈ ${prefix}setcmd (reply sticker)
║ ║ ◈ ${prefix}delcmd (reply sticker)
║ ║ ◈ ${prefix}sticker
║ ║ ◈ ${prefix}stiker
║ ║ ◈ ${prefix}s
║ ║ ◈ ${prefix}tinyurl (url)
║ ╚══════
║ ╔══${monospace("> [ D O W N L O A D E R ] <")}══
║ ║ ◈ ${prefix}yta (url)
║ ║ ◈ ${prefix}ytv (url)
║ ╚══════
║ ╔══${monospace("> [ O W N E R ] <")}══
║ ║ ◈ ${prefix}setbotbio (text)
║ ║ ◈ ${prefix}setbotname (text)
║ ║ ◈ ${prefix}setbotpp (quote image or image caption)
║ ║ ◈ ${prefix}setfooter (text)
║ ║ ◈ ${prefix}resetdatabase (user/group/all | jid)
║ ╚══════
║ ╔══${monospace("> [ T H A N K S  T O ] <")}══
║ ║ ◈ Nurutomo for some features
║ ║ ◈ Developer modules
║ ╚══════
╚════════════
${config.footer}
`.trim()
}

function monospace(str) {
  return "```" + str + "```"
}

let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log("=> Reloading 'help.js' because of changes.")
  delete require.cache[file]
  require(file)
})