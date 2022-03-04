module.exports = async (m, { conn, command, isAdmin, isBotAdmin, isOwner, text, args, participants }) => {
    switch (command) {
        case 'add':
        throw "*_Admin feature currently disabled by owner._*"
        break
      case 'kick':
        throw "*_Admin feature currently disabled by owner._*"
        break
      case 'revokelink': case 'resetlink': case 'resetlinkgc':
        if (!m.isGroup) throw botMessage.groupOnly()
        if (!isAdmin) throw botMessage.adminOnly()
        if (!isBotAdmin) throw botMessage.botAdmin()
        conn.revokeInvite(m.chat).then((data) => m.reply(`Successfuly reset the link.\nLink Invitation : https://chat.whatsapp.com/${data.code}`))
        break
      case 'hidetag': case 'pengumuman': case 'announcement':
        if (!m.isGroup) throw botMessage.groupOnly()
        if (!isAdmin) throw botMessage.adminOnly()
        if (!isBotAdmin) throw botMessage.botAdmin()
        let users = participants.map(u => u.jid)
        let _q = m.quoted ? m.quoted: m
        let _c = m.quoted ? m.quoted: m.msg
        let hidetagmsg = conn.cMod(
          m.chat,
          conn.prepareMessagem.chatContent(
            m.chat,
            {
              [_c.toJSON ? _q.mtype: MessageType.extendedText]: _c.toJSON ? _c.toJSON(): {
                text: _c || ''
              }
            },
            {
              contextInfo: {
                mentionedJid: users
              },
              quoted: m
            }
          ),
          text || _q.text.startsWith(config.prefix) ? text : _q.text
        )
        await conn.relayWAMessage(hidetagmsg)
        break
      case "warn":
        if (!m.isGroup) throw botMessage.groupOnly()
        if (!isAdmin) throw botMessage.adminOnly()
        if (!isBotAdmin) throw botMessage.botAdmin()
        if (m.mentionedJid.length < 1) throw botMessage.noMentioned()
        participants.forEach(user => {
          if (user.jid == m.mentionedJid[0] && user.isAdmin) throw "Sadar diri bang, anda malah warn admin"
        })
        let reasonText = args.splice(1).join` `
        if (reasonText.length == 0) reasonText = "Nothing."
        for (let userWarn of m.mentionedJid) {
          let warnUsers = global.db.data.warns[m.chat].users[userWarn]
          if (typeof warnUsers !== "object") global.db.data.warns[m.chat].users[userWarn] = {
            count: 0,
            reason: []
          }
          global.db.data.warns[m.chat].users[userWarn].reason.push(reasonText)
          global.db.data.warns[m.chat].users[userWarn].count += 1
          if (global.db.data.warns[m.chat].users[userWarn].count == 3) {
            m.reply(botMessage.lastWarnKick("@" + userWarn.split`@`[0], global.db.data.warns[m.chat].users[userWarn].reason))
            delete global.db.data.warns[m.chat].users[userWarn]
            return await conn.groupRemove(m.chat, [userWarn])
          }
          conn.sendButton(m.chat, botMessage.warn("@" + userWarn.split`@`[0], global.db.data.warns[m.chat].users[userWarn].count, "3", reasonText), config.footer, botMessage.deleteWarnButton(), config.prefix + "deletewarn", m)
        }
        break
      case 'deletewarn':
        if (!m.isGroup) throw botMessage.groupOnly()
        if (!isAdmin) throw botMessage.adminOnly()
        if (!isBotAdmin) throw botMessage.botAdmin()
        if (m.quoted) {
          if (m.quoted.mentionedJid) {
            for (let user of m.quoted.mentionedJid) {
              delete global.db.data.warns[m.chat].users[user]
              m.reply(botMessage.successDeleteWarn("@" + m.sender.split`@`[0], "@" + user.split`@`[0]))
            }
          }
        } else if (m.mentionedJid) {
          if (m.mentionedJid.length < 1) throw botMessage.noMentioned()
          for (let user of m.mentionedJid) {
            delete global.db.data.warns[m.chat].users[user]
            m.reply(botMessage.successDeleteWarn("@" + m.sender.split`@`[0], "@" + user.split`@`[0]))
          }
        } else throw botMessage.noMentioned()
        break
      case "warnlist":
        if (!m.isGroup) throw botMessage.groupOnly()
        let warnLists = []
        for (let users in global.db.data.warns[m.chat].users) {
          let warnCount = global.db.data.warns[m.chat].users[users].count
          let warnReason = global.db.data.warns[m.chat].users[users].reason
          let str = `=> @${users.split`@`[0]}\n=> Warn count : ${warnCount}\n=> Reason : \n${warnReason.map((v, i) => `=> ${i + 1}. ${v}`).join("\n")}`
          warnLists.push(str)
        }
        if (warnLists.length < 1) throw botMessage.noWarnedUsers()
        m.reply(`${monospace("==> [ W A R N  L I S T ] <==")}\n\n${warnLists.join("\n\n")}\n\n${config.footer}`)
        break
      case 'afk':
        if (!m.isGroup) throw botMessage.groupOnly()
        let _afkUser = global.db.data.users[m.sender]
        _afkUser.afk = + new Date
        _afkUser.afkReason = text ? text : "Please come back later."
        m.reply(`*_Into the void!_*\n@${m.sender.split`@`[0]} is now AFK.\nReason : ${_afkUser.afkReason}\n\n${config.footer}`)
        break
      case 'setwelcome':
        if (!m.isGroup) throw botMessage.groupOnly()
        if (!isAdmin) throw botMessage.adminOnly()
        if (!isBotAdmin) throw botMessage.botAdmin()
        if (!text) throw "Text?"
        global.db.data.chats[m.chat].sWelcome = text
        m.reply("Welcome has set successfully.\nNotes : \n@user (User)\n@subject (Group Name)\n@desc (Description Group)")
        break
      case 'rules':
        if (!m.isGroup) throw botMessage.groupOnly()
        if (!global.db.data.chats[m.chat].rules) throw "No rules has been filled in this group."
        m.reply(`Rules on ${conn.getName(m.chat)}\n${global.db.data.chats[m.chat].rules}\n\n${config.footer}`)
        break
      case 'setrules':
        if (!m.isGroup) throw botMessage.groupOnly()
        if (!isAdmin) throw botMessage.adminOnly()
        if (!isBotAdmin) throw botMessage.botAdmin()
        if (m.quoted.text) {
          global.db.data.chats[m.chat].rules = m.quoted.text
          return m.reply("Rules has been added successfully for this group.")
        }
        if (!text) throw "Text?"
        global.db.data.chats[m.chat].rules = text
        m.reply("Rules has been added successfully for this group.")
        break
      case 'simulate':
        if (!m.isGroup) throw botMessage.groupOnly()
        if (!isAdmin) throw botMessage.adminOnly()
        if (!isBotAdmin) throw botMessage.botAdmin()
        let _event = args[0]
        let _mentions = text.replace(_event, '').trimStart()
        let _who = _mentions ? conn.parseMention(_mentions) : []
        let _participants = _who.length ? _who : [m.sender]
        let _action = false
        m.reply(`Simulating ${_event}...`)
        switch (_event.toLowerCase()) {
          case 'add':
          case 'invite':
          case 'welcome':
              _action = 'add'
              break
          case 'bye':
          case 'kick':
          case 'leave':
          case 'remove':
              _action = 'remove'
              break
          case 'promote':
              _action = 'promote'
              break
          case 'demote':
              _action = 'demote'
              break
          case 'delete':
              _deleted = m
              break
          default: throw `List Event: welcome, bye, delete, promote, demote`
        }
        if (_action) return conn.onParticipantsUpdate({
          jid: m.chat,
          participants: _participants,
          action: _action
        })
        break
      case 'reportadmin':
        if (!isOwner) throw "This feature under developement, please try again later"
        if (!m.isGroup) throw botMessage.groupOnly()
        let _reasontext = args.splice(1).join` `
        if (!_reasontext) throw "Reason?"
        participants.forEach(user => {
          if (user.jid == m.mentionedJid[0] && user.isAdmin) throw "Sadar diri bang, anda malah report admin"
          else if (user.isAdmin) conn.sendMessage(user.jid, `${monospace(`==> Report from ${conn.getName(m.sender)} in group ${conn.getName(m.chat)} <==`)}\n@${m.mentionedJid[0].split`@`[0]} telah melakukan pelanggaran.\nAlasan : ${_reasontext}`, MessageType.extendedText, { contextInfo: { mentionedJid: m.mentionedJid }})
        })
        m.reply(`Reported @${m.mentionedJid[0].split`@`[0]} to admins.`)
        break
      case 'setgroupname': case 'setgroupsubject': case 'setgcname': case 'setgcsubject':
        if (!m.isGroup) throw botMessage.groupOnly()
        if (!isAdmin) throw botMessage.adminOnly()
        if (!isBotAdmin) throw botMessage.botAdmin()
        if (!text) throw "Name / Subject?"
        await conn.groupUpdateSubject(m.chat, text)
        m.reply("Successfully changed group name to " + text + ".")
        break
      case 'setgroupdescription': case 'setgroupdesc': case 'setgcdesc': case 'setgcdesc':
        if (!m.isGroup) throw botMessage.groupOnly()
        if (!isAdmin) throw botMessage.adminOnly()
        if (!isBotAdmin) throw botMessage.botAdmin()
        if (!text) throw "Description?"
        await conn.groupUpdateDescription(m.chat, text)
        m.reply("Successfully changed group description.")
        break
    }
}