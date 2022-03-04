const fs = require("fs")
module.exports = async(m, { conn, command, text, args, isOwner }) => {
    switch (command) {
        case 'setbotbio':
        if (!isOwner) throw botMessage.ownerOnly()
        if (!text) throw "Fill a text for the bio."
        try {
          await conn.setStatus(text)
          m.reply("Successfully changed the bio.")
        } catch (e) {
          console.log(e)
          throw "An error occured. Please check your console."
        }
        break
      case 'setbotname':
        if (!isOwner) throw botMessage.ownerOnly()
        if (!text) throw "Fill a text for a new name."
        if (text.length > 25) throw "Maximum letter 25 only, please try again."
        try {
          await conn.updateProfileName(text)
          m.reply("Successfully changed the bot name.")
        } catch (e) {
          console.log(e)
          throw "An error occured. Please check your console."
        }
        break
      case 'setbotpp':
        if (!isOwner) throw botMessage.ownerOnly()
        if (!m.quoted.mtype == 'imageMessage' || !m.mtype == 'imageMessage') throw 'Only image can be replaced!'
        let qImage = m.quoted ? m.quoted: m
        let ppImage = await qImage.download()
        conn.updateProfilePicture(conn.user.jid, ppImage)
        m.reply("Successfully changed the bot's profile picture.")
        break
      case 'setprefix':
        if (!isOwner) throw botMessage.ownerOnly()
        if (!text) throw "Prefix?"
        if (text.length > 1) throw "You can't make more of one arguments!"
        config.prefix = text
        fs.writeFileSync("./config.json", JSON.stringify(config, null, "\t"))
        m.reply(`Successfully changed the prefix to "${config.prefix}"`)
        break
      case 'setfooter':
        if (!isOwner) throw botMessage.ownerOnly()
        if (!text) throw 'Footer?'
        config.footer = text
        fs.writeFileSync("config.json", JSON.stringify(config, null, '\t'))
        m.reply(`Successfully changed the footer to "${config.footer}".`)
        break
      case 'resetdatabase':
        if (!isOwner) throw botMessage.ownerOnly()
        switch (args[0]) {
        case 'user':
          _targetReset = m.text.trim().split(/ +/).slice(1)[0]
          _targetJid = m.text.trim().split(/ +/).slice(2)
          conn.send2Button(m.chat, "Are you sure deleting this user's database?", config.footer, "Yes", config.prefix + "resetdatabase yes", "No", config.prefix + "resetdatabase no", m)
          break;
        case 'chats':
          _targetReset = m.text.trim().split(/ +/).slice(1)[0]
          _targetJid = m.quoted.text.trim().split(/ +/).slice(2)
          conn.send2Button(m.chat, "Are you sure deleting this chat's database?", config.footer, "Yes", config.prefix + "resetdatabase yes", "No", config.prefix + "resetdatabase no", m)
          break;
        case 'all':
          _targetReset = m.text.trim().split(/ +/).slice(1)[0]
          conn.send2Button(m.chat, "Are you sure deleting all database?", config.footer, "Yes", config.prefix + "resetdatabase yes", "No", config.prefix + "resetdatabase no", m)
          break
        case 'yes':
          switch (_targetReset) {
          case 'user':
            delete global.db.data.users[_targetJid]
            m.reply("Successfully deleting user database.")
            break;
          case 'chats':
            delete global.db.data.chats[_targetJid]
            m.reply("Successfully deleting chats database.")
            break
          case 'all':
            global.db.data.users = {}
            global.db.data.chats = {}
            m.reply("Successfully deleting all database.")
            break
          default:
            console.log(m)
            break
          }
          break
        case 'no':
          m.reply("Cancelled request by user.")
          break
        default:
          throw `Invalid input! List function you can reset :\n=> ${config.prefix}resetdatabase user (number user)\n=> ${config.prefix}resetdatabase chats (number group)\n=> ${config.prefix}resetdatabase all`
        }
        break
    }
}