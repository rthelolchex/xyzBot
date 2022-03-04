const { yta, ytv, servers: y2mateServers } = require('../lib/y2mate')
const isUrl = require("is-url")
const axios = require("axios")
module.exports = async(m, { conn, command, text, args }) => {
    async function tinyURL(url) {
        if (!isUrl(url)) return "URL Invalid"
        const { data: res } = await axios.get('https://tinyurl.com/api-create.php?url=' + url)
        return res
    }
    switch (command) {
        case 'yta':
        if (!text) throw "URL?"
        let _y2mateServer = (args[1] || y2mateServers[0]).toLowerCase()
        yta(args[0], y2mateServers.includes(_y2mateServer) ? _y2mateServer : y2mateServers[0]).then(async (res) => {
          let { dl_link, thumb, title, filesizeF } = res
          conn.sendFile(m.chat, thumb, 'thumbnail.jpg', `${monospace("╔══> [ Y T M P 3 ] <══")}\n║ ◈ Title : ${title}\n║ ◈ File size : ${filesizeF}\n║ ◈ Link Download : ${await tinyURL(dl_link)}\n╚══════\n\n${config.footer}`.trim(), m)
        })
        break
      case 'ytv':
        let _ytmp4Server = (args[1] || y2mateServers[0]).toLowerCase()
        ytv(args[0], y2mateServers.includes(_ytmp4Server) ? _ytmp4Server : y2mateServers[0]).then(async (res) => {
          let { dl_link, thumb, title, filesizeF } = res
          conn.sendFile(m.chat, thumb, 'thumbnail.jpg', `${monospace("╔══> [ Y T M P 4 ] <══")}\n║ ◈ Title : ${title}\n║ ◈ File size : ${filesizeF}\n║ ◈ Link Download : ${await tinyURL(dl_link)}\n╚══════\n\n${config.footer}`.trim(), m)
        })
        break
    }
}