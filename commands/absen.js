let _date = new Date
let date = _date.toLocaleDateString('id', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})
module.exports = async(m, { conn, command, text }) => {
    switch (command) {
        case 'absen': case 'hadir': case 'present':
        if (!m.isGroup) return m.reply(botMessage.isGroup())
        conn.absen = conn.absen ? conn.absen: {}
        if (!(m.chat in conn.absen)) return conn.sendButton(m.chat, botMessage.noAbsen(), config.footer, 'Mulai', `${config.prefix}mulaiabsen`, m)
        let _absen = conn.absen[m.chat][1]
        const wasVote = _absen.includes(m.sender)
        if (wasVote) throw 'Kamu sudah absen!'
        _absen.push(m.sender)
        list = _absen.map((v, i) => `│ ${i + 1}.  @${v.split`@`[0]}`).join('\n')
        caption = `
Tanggal: ${date}

${conn.absen[m.chat][2] ? conn.absen[m.chat][2] + '\n': ''}
╭─「 Daftar Absen 」
│ Total: ${_absen.length}
${list}
╰────`.trim()
        await conn.send2Button(m.chat, caption, config.footer, 'Absen', `${config.prefix}absen`, 'Cek', `${config.prefix}cekabsen`, m)
        break
      case 'mulaiabsen':
        if (!m.isGroup) return m.reply(botMessage.groupOnly())
        // if (!isAdmin) return m.reply(botMessage.adminOnly())
        // if (!isBotAdmin) return m.reply(botMessage.botAdmin())
        conn.absen = conn.absen ? conn.absen: {}
        if (m.chat in conn.absen) return conn.send2Button(m.chat, `Masih ada absen di chat ini!`, 'xyzBot - reborn m.chat rexproject', 'Hapus', `${config.prefix}hapusabsen`, 'Cek', `${config.prefix}cekabsen`, conn.absen[m.chat][0])
        conn.absen[m.chat] = [
          await conn.sendButton(m.chat, `Absen dimulai`, config.footer, 'Absen', `${config.prefix}absen`, m),
          [],
          text
        ]
        break
      case 'cekabsen':
        if (!m.isGroup) return m.reply(botMessage.groupOnly())
        conn.absen = conn.absen ? conn.absen: {}
        if (!(m.chat in conn.absen)) return conn.sendButton(m.chat, botMessage.noAbsen(), config.footer, 'Mulai', `${config.prefix}absen`, m)
        let absen = conn.absen[m.chat][1]
        list = absen.map((v, i) => `│ ${i + 1}. @${v.split`@`[0]}`).join('\n')
        caption = `
Tanggal: ${date}

${conn.absen[m.chat][2] ? conn.absen[m.chat][2] + '\n': ''}
╭─「 Daftar Absen 」
│ Total: ${absen.length}
${list}
╰────`.trim()
        conn.send2Button(m.chat, caption, config.footer, 'Absen', `${config.prefix}absen`, 'Hapus', `${config.prefix}hapusabsen`, m)
        break
      case 'deleteabsen': case 'hapusabsen':
        if (!m.isGroup) return m.reply(botMessage.groupOnly())
        // if (!(isAdmin || isOwner)) return m.reply(botMessage.adminOnly())
        conn.absen = conn.absen ? conn.absen: {}
        if (!(m.chat in conn.absen)) return conn.sendButton(m.chat, botMessage.noAbsen(), config.footer, 'Mulai', `${config.prefix}absen`, m)
        delete conn.absen[m.chat]
        m.reply("Absen successfully deleted.")
        break
    }
}