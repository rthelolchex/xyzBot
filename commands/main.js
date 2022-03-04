const help = require('../help.js')
module.exports = async(m, { conn, command, pushname, isOwner, isPrems }) => {
    switch (command) {
        case 'help': case 'menu':
            conn.send2Button(m.chat, help.help(conn, m, config.prefix, pushname, clockString(process.uptime() * 1000), isOwner ? "Owner" : isPrems ? "Premium" : "Free user"), config.footer, "Owner bot", config.prefix + "owner", "Donate", config.prefix + "donate", m)
            break
    }
}