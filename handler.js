global.config = require('./config.json');
const {
  MessageType,
  newMessagesDB
} = require('@adiwajshing/baileys')
const lang = require('./lang');
const util = require('util');
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

module.exports = async(conn, m, chatUpdate) => {
  switch (m.mtype) {
    case MessageType.image:
    case MessageType.video:
    case MessageType.audio:
    if (!m.key.fromMe) await delay(1000)
    if (!m.msg.url) await conn.updateMediaMessage(m)
    break
  }
  
  if (m.isBaileys) return
  global.botMessage = new lang[config.lang](config.prefix)
  let from = m.key.remoteJid;
  let groupMetadata = m.isGroup ? await conn.groupMetadata(from): "";
  let isROwner = [conn.user.jid,
    ...config.ownerNumber].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
  let isOwner = isROwner || m.key.fromMe
  let isPrems = isROwner || config.premiumUser.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
  let participants = m.isGroup ? groupMetadata.participants: [] || []
  let user = m.isGroup ? participants.find(u => u.jid == m.sender): {}
  let bot = m.isGroup ? participants.find(u => u.jid == conn.user.jid): {}
  let isAdmin = user.isAdmin || user.isSuperAdmin || false
  let isBotAdmin = bot.isAdmin || bot.isSuperAdmin || false
  if (typeof m.text !== 'string') m.text = ''
  let isCommand = (m.text.startsWith(config.prefix) && m.text.length > 1) ? true: false
  let command = m.text.startsWith(config.prefix) ? m.text.slice(config.prefix.length).trim().split(/ +/).shift().toLowerCase(): ""
  let args = m.text.trim().split(/ +/).slice(1)
  let text = args.join` `
  let pushname = await conn.getName(m.sender)
  m.exp = 0

  
  // eval
  if (isOwner && m.text.startsWith("> ")) {
    console.log(`=> Executing function ${m.text.slice(2)} from owner.`)
    try {
      _eval = await eval(m.text.slice(2))
      if (typeof _eval !== "string") _eval = await util.inspect(_eval)
      m.reply(_eval)
    } catch (e) {
      m.reply(util.format(e))
    }
  }

  // Console
  if (!isCommand) {
    m.exp += Math.ceil(Math.random() * 10)
    console.log(`=> [ MESSAGE ] Message from ${conn.getName(m.sender)} ${m.isGroup ? `in ${conn.getName(from)}`: ''}`)
  }
  if (isCommand) {
    m.exp += 17
    console.log(`=> [ COMMAND ] Executing command ${command} from ${conn.getName(m.sender)} ${m.isGroup ? `in ${conn.getName(from)}`: ''}`)
  }
  // console.log(args.splice(1).join` `.length)
  
  
  // Options when you starting this script
  if (isCommand && !isOwner && opts['owneronly']) {
    console.log("=> Cancelling execute command because the command not executed by owner.")
    return m.reply("shhh... still under work in progress, do not disturb...")
  }
  
  // functions
  global.monospace = (str) => {
    return "```" + str + "```"
  }
  global.clockString = (ms) => {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
  }
  

  // Database
  try {
    // User database
    let databaseUser = global.db.data.users[m.sender]
    if (typeof databaseUser !== 'object') global.db.data.users[m.sender] = {}
    if (databaseUser) {
      if (!isNumber(databaseUser.exp)) databaseUser.exp = 0;
      if (!isNumber(databaseUser.limit)) databaseUser.limit = 10;
      if (!isNumber(databaseUser.level)) databaseUser.level = 0
      if (!('autolevelup' in databaseUser)) databaseUser.autolevelup = false
      if (!isNumber(databaseUser.afk)) databaseUser.afk = -1
      if (!('afkReason' in databaseUser)) databaseUser.afkReason = ''
      if (!('banned' in databaseUser)) databaseUser.banned = false
      if (!('registered' in databaseUser)) databaseUser.registered = false
      if (!databaseUser.registered) {
        if (!('name' in databaseUser)) databaseUser.name = conn.getName(m.sender)
        if (!isNumber(databaseUser.age)) databaseUser.age = -1
        if (!isNumber(databaseUser.regTime)) databaseUser.regTime = -1
      }
    } else global.db.data.users[m.sender] = {
      exp: 0,
      limit: 10,
      level: 0,
      autolevelup: false,
      afk: -1,
      afkReason: '',
      banned: false,
      registered: false,
      name: conn.getName(m.sender),
      age: -1,
      regTime: -1
    }

    // Group database settings
    let databaseChat = global.db.data.chats[from]
    if (typeof databaseChat !== 'object') global.db.data.chats[from] = {}
    if (databaseChat) {
      if (!('isBanned' in databaseChat)) databaseChat.isBanned = false
      if (!('welcome' in databaseChat)) databaseChat.welcome = false
      if (!('detect' in databaseChat)) databaseChat.detect = false
      if (!('sWelcome' in databaseChat)) databaseChat.sWelcome = ''
      if (!('sBye' in databaseChat)) databaseChat.sBye = ''
      if (!('sPromote' in databaseChat)) databaseChat.sPromote = ''
      if (!('sDemote' in databaseChat)) databaseChat.sDemote = ''
      if (!('delete' in databaseChat)) databaseChat.delete = true
      if (!('getmsg' in databaseChat)) databaseChat.getmsg = false
    } else global.db.data.chats[from] = {
      isBanned: false,
      welcome: false,
      detect: false,
      sWelcome: '',
      sBye: '',
      sPromote: '',
      sDemote: '',
      delete: true,
      getmsg: false
    }

    // Warn database
    if (m.isGroup) {
      let dbWarn = global.db.data.warns[m.chat]
      if (typeof dbWarn !== "object") global.db.data.warns[m.chat] = {}
      if (dbWarn) {
        if (typeof dbWarn.users !== "object") dbWarn.users = {}
      } else global.db.data.warns[m.chat] = {
        users: {}
      }
    }
  } catch (e) {
    console.log(e)
  }

  // AFK
  let afkUser = global.db.data.users[m.sender]
  if (afkUser.afk > -1) {
    m.reply(botMessage.stopAFK(pushname, afkUser.afkReason, clockString(new Date - afkUser.afk), config.footer))
    afkUser.afk = -1
    afkUser.afkReason = ''
  }
  let afkJids = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])]
  for (let jid of afkJids) {
    let users = global.db.data.users[jid]
    if (!users) continue
    let afkTime = users.afk
    if (!afkTime || afkTime < 0) continue
    let reason = users.afkReason || ''
    m.reply(jid.includes(config.ownerNumber[0]) ? botMessage.userAFK(reason, clockString(new Date - afkTime), config.footer).replace("Dia", "Saya") : botMessage.userAFK(reason, clockString(new Date - afkTime), config.footer))
  }
  if (!m.isGroup && global.db.data.users[config.ownerNumber[0] + "@s.whatsapp.net"].afk > 0 && !isCommand) {
    let ownerdb = global.db.data.users[config.ownerNumber[0] + "@s.whatsapp.net"]
    let afkTime = ownerdb.afk
    if (!afkTime || afkTime < 0) return
    let reason = ownerdb.afkReason || ''
    m.reply(botMessage.userAFK(reason, clockString(new Date - afkTime), config.footer).replace("Dia", "Saya"))
  }

  // Sticker commands
  // Thanks to Nurutomo for sticker handler
  if (m.mtype == 'stickerMessage') {
    if (!m.msg.fileSha256) return
    if (global.db.data.stickerFilter.includes(m.msg.fileSha256.toString('hex'))) {
      if (isAdmin) return m.reply("Jangan gitu lah bang, mentang-mentang anda admin")
      let warnUsers = global.db.data.warns[m.chat].users[m.sender]
      if (typeof warnUsers !== "object") global.db.data.warns[m.chat].users[m.sender] = {
        count: 0,
        reason: []
      }
      global.db.data.warns[from].users[m.sender].reason.push("Telah mengirim sticker yang dilarang oleh admin.")
      global.db.data.warns[from].users[m.sender].count += 1
      if (global.db.data.warns[from].users[m.sender].count == 3) {
        m.reply(botMessage.lastWarnKick("@" + m.sender.split`@`[0], global.db.data.warns[from].users[m.sender].reason))
        delete global.db.data.warns[from].users[m.sender]
        return await conn.groupRemove(from, [m.sender])
      }
      conn.sendButton(from, botMessage.warn("@" + m.sender.split`@`[0], global.db.data.warns[from].users[m.sender].count, "3", "Telah mengirim sticker dilarang oleh admin."), config.footer, botMessage.deleteWarnButton(), config.prefix + "deletewarn", m)
    }

    if (!(m.msg.fileSha256.toString('hex') in global.db.data.sticker)) return
    let stickerHash = global.db.data.sticker[m.msg.fileSha256.toString('hex')]
    let { text, mentionedJid } = stickerHash
    conn.emit('chat-update', {
        ...chatUpdate,
        messages: newMessagesDB([
            conn.cMod(m.chat,
                await conn.prepareMessage(m.chat, text, MessageType.extendedText, {
                    contextInfo: {
                        mentionedJid
                    },
                    ...(m.quoted ? { quoted: m.quoted.fakeObj } : {}),
                    messageId: m.id,
                }),
                text,
                m.sender
            )
        ])
    })
  }
  
  // Anti p chat (userbot)
  if (!m.isGroup && !m.key.fromMe) {
    if (m.text == "p" || m.text == "P") {
      global.db.data.users[m.sender].warnCount += 1
      if (global.db.data.users[m.sender].warnCount > 2) {
        m.reply(botMessage.blockP())
        global.db.data.users[m.sender].warnCount = 0
        return conn.blockUser(m.sender, "add")
      }
      m.reply(botMessage.antiP(global.db.data.users[m.sender].warnCount, config.footer))
    }
  }

  try {
    for (let commandFiles in global.commands) {   
      let cmd = global.commands[commandFiles]
      let extra = {
        args,
        command,
        text,
        conn,
        participants,
        groupMetadata,
        isROwner,
        isOwner,
        isAdmin,
        isBotAdmin,
        isPrems,
        chatUpdate,
        pushname,
      }
      try {
        await cmd.call(conn, m, extra)
      } catch (e) {
        m.reply(util.format(e))
      }
    }
  } catch (e) {
    console.log(e)
  } finally {
    if (m) {
      if (m.sender && (databaseUser = global.db.data.users[m.sender])) {
        databaseUser.exp += m.exp
      }
    }
  }
}