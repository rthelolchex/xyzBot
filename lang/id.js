const fs = require('fs')
class id { 
    constructor(prefix) {
        if (!prefix) throw new Error("Unknown prefix. Please set prefix first at config.json")
        this.prefix = prefix;
        this.bold = (string) => {
            return '*' + string + '*';
        }
        this.monospace = (string) => {
            return '```' + string + '```'
        }
        this.boldItalic = (string) => {
            return '*_' + string + '_*'
        }
    }
    maintenance() {
        return this.monospace("Sedang dalam proses pengembangan, silahkan coba lagi nanti.")
    }
    noCmd() {
        return this.monospace(`Perintah tidak diketahui, silahkan ketik ${this.prefix}help atau ${this.prefix}menu untuk informasi lebih lanjut.`)
    }
    groupOnly() {
        return "Perintah ini hanya bisa digunakan di group!"
    }
    adminOnly() {
        return "Perintah ini hanya dapat dilakukan oleh admin!"
    }
    ownerOnly() {
        return "Perintah ini hanya dapa dilakukan oleh owner!"
    }
    botAdmin() {
         return "Jadikan bot sebagai admin untuk menggunakan perintah ini!"
    }
    notViewOnce() {
        return "Pesan tersebut bukan pesan sekali-lihat!"
    }
    errViewOnce() {
        return "Terjadi error ketika mencoba foward message, mungkin pernah dibuka oleh owner."
    }
    processing() {
        return "*_Memproses..._*"
    }
    notQuotedMedia() {
        return "*_Reply pesan yang berisi media lalu coba lagi._*"
    }
    noAbsen() {
        return this.boldItalic("Tidak ada absen sedang berlangsung!")
    }
    warn(user, count, maxcount, reason) {
      return `Pengguna ${user} memiliki ${count}/${maxcount} peringatan. hati-hati!\nAlasan : ${reason}`
    }
    noMentioned() {
      return "Tag usernya!"
    }
    deleteWarnButton() {
      return "Hapus peringatan (admin only)"
    }
    successDeleteWarn(sender, user) {
      return `Admin ${sender} telah menghapus peringatan untuk ${user}!`
    }
    lastWarnKick(user, reason) {
      return `Baiklah, ${user} telah melebihi batas peringatan, anda akan dikick!.\n\nAlasan : \n${reason.map((v, i) => `=> ${i + 1}. ${v}`).join("\n")}`
    }
    noWarnedUsers() {
      return "Tidak ada pengguna yang terkena peringatan di group ini!"
    }
    stopAFK(pushname, reason, time, footer) {
        return `Selamat datang kembali, ${pushname}!\nAnda kembali ke chat setelah afk selama ${time}.\nAlasan : ${reason ? this.boldItalic(reason) : ''}\n\n${footer}`
    }
    userAFK(reason, time, footer) {
        return `Dia tidak ada untuk saat ini. (selama ${time})\nAlasan : ${reason}\n\n${footer}`
    }
    antiP(count, footer) {
      return `Tolong yang sopan sedikit.\nCount : ${count}/3\nJika anda 3 kali melakukan hal yang sama, mohon maaf anda akan saya blokir.\n\n${footer}`
    }
    blockP() {
      return(`Mohon maaf, anda sudah melakukan lebih dari 3 kali dengan teks "P", anda akan diblokir otomatis.`)
    }
}

module.exports = id;

let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log("=> Reloading 'id.js' because of changes.")
  delete require.cache[file]
  require(file)
})
