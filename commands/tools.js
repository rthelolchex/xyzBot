const { sticker } = require('../lib/sticker.js');
const axios = require('axios')
const isUrl = require('is-url')
const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)
module.exports = async(m, { conn, command, isAdmin, isBotAdmin, text }) => {
    async function tinyURL(url) {
        if (!isUrl(url)) return "URL Invalid"
        const { data: res } = await axios.get('https://tinyurl.com/api-create.php?url=' + url)
        return res
      }
    switch (command) {
        case 'readviewonce':
        if (!m.quoted) return m.reply(botMessage.noMessage())
        if (m.quoted.mtype !== "viewOnceMessage") return m.reply(botMessage.notViewOnce())
        await conn.copyNForward(m.chat, await conn.loadMessage(m.chat, m.quoted.id), false, {
          readViewOnce: true
        }).catch(_ => m.reply(botMessage.errViewOnce()))
        break
      case 'sticker': case 'stiker': case 's':
        let stiker = false
        try {
          let q = m.quoted ? m.quoted: m
          if (!q.download) throw botMessage.notQuotedMedia()
          m.reply(botMessage.processing())
          let mime = (q.msg || q).mimetype || ''
          if (/webp/.test(mime)) {
            let img = await q.download()
            stiker = await sticker(img, false, config.packname, config.author)
          } else if (/image/.test(mime)) {
            let img = await q.download()
            stiker = await sticker(img, false, config.packname, config.author)
          } else if (/video/.test(mime)) {
            if ((q.msg || q).seconds > 11) return m.reply('Max 10 detik!')
            let img = await q.download()
            stiker = await sticker(img, false, config.packname, config.author)
          } else if (m.quoted.text) {
            if (isUrl(m.quoted.text)) stiker = await sticker(false, text, config.packname, config.author)
            else throw 'URL tidak valid! akhiri dengan jpg/gif/png'
          }
        } catch (e) {
          console.error(e)
        }
        finally {
          if (stiker) await conn.sendFile(m.chat, stiker, '', '', m)
          else m.reply('Conversion failed')
        }
        break
      case 'readmore': case 'spoiler':
        let [l,
          r] = text.split`|`
        if (!l) l = ''
        if (!r) r = ''
        m.reply(l + readMore + r)
        break
      case 'allchats':
        let _groupChats = []
        let _privateChats = []
        conn.chats.all().forEach(chats => {
          if (chats.jid.endsWith("@g.us")) {
            let str = `=> Group Name : ${chats.name}\n=> Group jid : ${chats.jid}\n`
            _groupChats.push(str)
          }
          if (chats.jid.endsWith("@s.whatsapp.net")) {
            let str = `=> Contact Name : ${chats.name}\n=> Contact jid : ${chats.jid}\n`
            _privateChats.push(str)
          }
        })
        let allchatHeader = monospace("==> [ A L L  C H A T S ] <==")
        m.reply(`${allchatHeader}\nGroup chats total : ${_groupChats.length}\nPrivate chats total : ${_privateChats.length}\nTotal chats : ${_groupChats.length + _privateChats.length}\n\n=> Group Chats <=\n${_groupChats.join("\n")}\n\n=> Private Chats <=\n${_privateChats.join("\n")}`)
        break
      case 'tinyurl':
        if (!text) throw "URL?"
        if (!isUrl(text)) throw "URL invalid"
        let shortURL = await tinyURL(text)
        m.reply(`Here's your shortlink.\n${shortURL}`)
        break
      case 'setcmd':
        global.db.data.sticker = global.db.data.sticker || {}
        if (!m.quoted) throw "Reply a sticker message!"
        if (!m.quoted.fileSha256) throw "SHA256 hash missing, please reply other sticker."
        if (!text) throw "Command?"
        let _stickerCommand = global.db.data.sticker
        let _stickerHash = m.quoted.fileSha256.toString('hex')
        if (_stickerCommand[_stickerHash] && _stickerCommand[_stickerHash].locked) throw 'You have no permission to change this sticker command!'
        _stickerCommand[_stickerHash] = {
          text,
          mentionedJid: m.mentionedJid,
          creator: m.sender,
          at: + new Date,
          locked: false,
        }
        m.reply(`Successfully set command ${text} for this sticker.`)
        break
      case 'delcmd':
        _delstickerHash = text
        if (m.quoted && m.quoted.fileSha256) _delstickerHash = m.quoted.fileSha256.toString('hex')
        if (!_delstickerHash) throw "No hash."
        let _stickerDB = global.db.data.sticker
        if (_stickerDB[_delstickerHash] && _stickerDB[_delstickerHash].locked) throw "You have no permission to delete this sticker command!"
        delete _stickerDB[_delstickerHash]
        m.reply(`Successfully deleting command for this sticker.`)
        break
      case 'filtersticker': case 'bansticker':
        if (!m.isGroup) throw botMessage.groupOnly()
        if (!isAdmin) throw botMessage.adminOnly()
        if (!isBotAdmin) throw botMessage.botAdmin()
        global.db.data.stickerFilter = global.db.data.stickerFilter || []
        if (!m.quoted) throw "Reply a sticker message!"
        if (!m.quoted.fileSha256) throw "SHA256 hash missing, please reply other sticker."
        global.db.data.stickerFilter.push(m.quoted.fileSha256.toString('hex'))
        m.reply("Successfully filtering this sticker.")
        break
      case 'unfiltersticker': case 'unbansticker':
        if (!m.isGroup) throw botMessage.groupOnly()
        if (!isAdmin) throw botMessage.adminOnly()
        if (!isBotAdmin) throw botMessage.botAdmin()
        if (!m.quoted) throw "Reply a sticker message!"
        if (!m.quoted.fileSha256) throw "SHA256 hash missing, please reply other sticker."
        if (!global.db.data.stickerFilter.includes(m.quoted.fileSha256.toString('hex'))) throw "This sticker is not on filter list!"
        let _deletedStickerHash = global.db.data.stickerFilter.indexOf(m.quoted.fileSha256.toString('hex'))
        global.db.data.stickerFilter.splice(_deletedStickerHash, 1)
        m.reply("Successfully unfilter this sticker.")
        break
    }
}