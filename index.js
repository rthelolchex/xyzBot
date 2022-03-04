console.clear()
console.log("Initializing...\n")
const { WAConnection: _WAConnection, MessageType } = require("@adiwajshing/baileys");
const fs = require("fs");
const cfonts = require("cfonts");
const package = require("./package.json");
const config = require("./config.json");
const yargs = require('yargs/yargs');
const simple = require('./lib/simple');
const _ = require('lodash')
const cp = require("child_process")
const WAConnection = simple.WAConnection(_WAConnection);
const syntaxerror = require('syntax-error')
const path = require('path')
const Readline = require("readline")
const rl = Readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

// Load database
var low
try {
  low = require('lowdb')
} catch (e) {
  low = require('./lib/lowdb')
}
const { Low, JSONFile } = low


global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.db = new Low(
  /https?:\/\//.test(opts['db'] || '') ?
    new cloudDBAdapter(opts['db']) :
    new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`)
)

console.log("==========================================================")
cfonts.say("xyzBot", {
  font: "block"
})
console.log("==========================================================")
console.log(package.name, "by", package.author)
console.log("BOT_VERSION =", "xyz_v" + package.version + "-" + config.versionStatus + "-" + config.buildDate)
console.log("OWNER_NUMBER =", config.ownerNumber[0])
console.log("PREFIX_USED =", `"${config.prefix}"`)
console.log("TOTAL_FEATURES =", "25") // fill your total feature here
console.log("==========================================================")
nocache('./handler.js', module => console.log(`=> Reloading "${module}" because of changes.`))

let isConfigurated = null

const question1 = () => {
  console.log("Sepertinya anda pertama kali memasang bot ini, silahkan atur dan sesuaikan pengaturan untuk bot ini.")
  return new Promise((resolve, reject) => {
    rl.question("Silahkan ketik prefix untuk bot ini.\nPrefix : ", function(str) {
      if (!str) {
        console.log("Prefix tidak boleh kosong!\n\n")
        return question1()
      }
      config.prefix = str.toString()
      resolve({ prefix: str })
    })
  })
}

const question2 = () => {
  return new Promise((resolve, reject) => {
    rl.question("Masukkan nomor owner untuk bot ini.\nNomor owner : ", function(str) {
      if (!str) {
        console.log("Nomor owner tidak boleh kosong!\n\n")
        return question2()
      }
      config.ownerNumber.push(str)
      resolve({ ownerNumber: str })
    })
  })
}

const question3 = () => {
  console.log("Saatnya ke sticker packname dan author.")
  return new Promise((resolve, reject) => {
    rl.question("Masukkan sticker packname untuk bot ini.\nPackname : ", function(str) {
      if (!str) {
        console.log("Packname tidak boleh kosong!\n\n")
        return question3()
      }
      config.packname = str.toString()
      resolve({ packname: str })
    })
  })
}

const question4 = () => {
  return new Promise((resolve, reject) => {
    rl.question("Masukkan sticker author untuk bot ini ini.\nAuthor : ", function(str) {
      if (!str) {
        console.log("Author tidak boleh kosong!\n\n")
        return question4()
      }
      config.author = str.toString()
      resolve({ author: str })
    })
  })
}

const question5 = () => {
  console.log("Tahap terakhir, footer setiap buttonMessage.")
  return new Promise((resolve, reject) => {
    rl.question("Masukkan footer buat buttonMessage untuk bot ini.\nFooter : ", function(str) {
      if (!str) {
        console.log("Footer tidak boleh kosong!\n\n")
        return question5()
      }
      config.footer = str.toString()
      isConfigurated = true
      resolve({ footer: str })
    })
  })
}

rl.on('close', function() {
    if (!isConfigurated) {
        console.log("\n\nProses dibatalkan.")
        process.exit(0)
    }
    console.log("Pengaturan selesai, happy coding dengan bot!")
    fs.writeFileSync("./config.json", JSON.stringify(config, null, "\t"))
    fs.unlinkSync("./newUser")
    InitializeWA()
})

async function InitializeWA() {
  global.conn = new WAConnection();
  let authFile = opts['session'] ? opts['session'] + '.json' : `session.data.json`
  if (fs.existsSync(authFile)) conn.loadAuthInfo(authFile)
  if (!opts['test']) setInterval(async () => {
    await global.db.write()
  }, 60 * 1000) // Save every minute
  if (opts['owneronly']) conn.logger.info("Owner only (maintenance) mode has been enabled.")
  
  loadDatabase()
  async function loadDatabase() {
    await global.db.read()
    global.db.data = {
      users: {},
      chats: {},
      stats: {},
      msgs: {},
      sticker: {},
      settings: {},
      warns: {},
      stickerFilter: [],
      ...(global.db.data || {})
    }
    global.db.chain = _.chain(global.db.data)
  }
  
  conn.on("chat-update", async (chatUpdate) => {
    if (chatUpdate.hasNewMessage && chatUpdate.messages) {
      let m = chatUpdate.messages.all()[0]
      if (!m || !m.message || m.key && m.key.remoteJid === 'status@broadcast') return
      // Load handlers
      simple.smsg(conn, m)
      require('./handler')(conn, m, chatUpdate)
    } else return
  })
  
  conn.on('close', DisconnectReason => {
    if (DisconnectReason.reason == 'invalid_session') {
      if (fs.existsSync(authFile)) {
        fs.unlinkSync(authFile)
      }
      conn.logger.warn('invalid session, deleting session file and please rescan the qr.')
      conn.clearAuthInfo()
    }
    setTimeout(async () => {
          try {
            if (conn.state === 'close') {
              if (fs.existsSync(authFile)) await conn.loadAuthInfo(authFile)
              await conn.connect()
              fs.writeFileSync(authFile, JSON.stringify(conn.base64EncodedAuthInfo(), null, '\t'))
            }
          } catch (e) {
            conn.logger.error(e)
          }
        }, 5000)
  })
  conn.onParticipantsUpdate = async({ jid, participants, action, m }) => {
    let chat = global.db.data.chats[jid] || {}
    switch (action) {
      case 'add':
      case 'remove':
        if (chat.welcome) {
          let groupMetadata = await conn.groupMetadata(jid)
          for (let user of participants) {
            text = (action === 'add' ? (chat.sWelcome || conn.welcome || 'Hey there, @user! Welcome to @subject.').replace('@subject', conn.getName(jid)).replace('@desc', groupMetadata.desc) :
              (chat.sBye || conn.bye || 'Goodbye, @user!')).replace('@user', '@' + user.split('@')[0])
            if (chat.rules && action == 'add') {
              conn.sendButton(jid, text + "\nMake sure you read the rules before starting.", config.footer, "Rules", config.prefix + "rules")
            } else conn.sendMessage(jid, text, MessageType.text, { contextInfo: { mentionedJid: [user] } })
          }
        }
        break
    }
  }
  conn.on('group-participants-update', conn.onParticipantsUpdate)
  
  conn.connect().then(async () => {
    fs.writeFileSync("./session.data.json", JSON.stringify(conn.base64EncodedAuthInfo(), null, "\t"))
  })
  // Command loader
  let commandFolder = path.join(__dirname, 'commands')
  let commandFilter = filename => /\.js$/.test(filename)
  global.commands = {}
  for (let filename of fs.readdirSync(commandFolder).filter(commandFilter)) {
    try {
      global.commands[filename] = require(path.join(commandFolder, filename))
    } catch (e) {
      conn.logger.error(e)
      delete global.commands[filename]
    }
  }
  global.reload = (_event, filename) => {
    if (commandFilter(filename)) {
      let dir = path.join(commandFolder, filename)
      if (dir in require.cache) {
        delete require.cache[dir]
        if (fs.existsSync(dir)) conn.logger.info(`reloading file '${filename}'`)
        else {
          conn.logger.warn(`deleted file '${filename}'`)
          return delete global.commands[filename]
        }
      } else conn.logger.info(`requiring new file '${filename}'`)
      let err = syntaxerror(fs.readFileSync(dir), filename)
      if (err) conn.logger.error(`syntax error while loading '${filename}'\n${err}`)
      else try {
        global.commands[filename] = require(dir)
      } catch (e) {
        conn.logger.error(e)
      } finally {
        global.commands = Object.fromEntries(Object.entries(global.commands).sort(([a], [b]) => a.localeCompare(b)))
      }
    }
  }
  Object.freeze(global.reload)
  fs.watch(path.join(__dirname, 'commands'), global.reload)
  
  // Quick Test
  async function _quickTest() {
    let test = await Promise.all([
      cp.spawn('ffmpeg'),
      cp.spawn('ffprobe'),
      cp.spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
      cp.spawn('convert'),
      cp.spawn('magick'),
      cp.spawn('gm'),
    ].map(p => {
      return Promise.race([
        new Promise(resolve => {
          p.on('close', code => {
            resolve(code !== 127)
          })
        }),
        new Promise(resolve => {
          p.on('error', _ => resolve(false))
        })
      ])
    }))
    let [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm] = test
    console.log(test)
    let s = global.support = {
      ffmpeg,
      ffprobe,
      ffmpegWebp,
      convert,
      magick,
      gm
    }
    require('./lib/sticker').support = s
    Object.freeze(global.support)
  
    if (!s.ffmpeg) conn.logger.warn('Please install ffmpeg for sending videos (pkg install ffmpeg)')
    if (s.ffmpeg && !s.ffmpegWebp) conn.logger.warn('Stickers may not animated without libwebp on ffmpeg (--enable-ibwebp while compiling ffmpeg)')
    if (!s.convert && !s.magick && !s.gm) conn.logger.warn('Stickers may not work without imagemagick if libwebp on ffmpeg doesnt isntalled (pkg install imagemagick)')
  }
  
  _quickTest()
    .then(() => conn.logger.info('Quick Test Done'))
    .catch(console.error)
}


async function start() {
  if (fs.existsSync("./newUser")) {
    await question1()
    await question2()
    await question3()
    await question4()
    await question5()
    rl.close()
  } else InitializeWA()
}
start()

/*
 * Uncache if there is file change
 * @param {string} module Module name or path
 * @param {function} cb <optional>
 */
function nocache(module, cb = () => { }) {
  console.log('Module', `'${module}'`, 'is now being watched for changes')
  fs.watchFile(require.resolve(module), async () => {
      await uncache(require.resolve(module))
      cb(module)
  })
}

/**
* Uncache a module
* @param {string} module Module name or path
*/
function uncache(module = '.') {
  return new Promise((resolve, reject) => {
      try {
          delete require.cache[require.resolve(module)]
          resolve()
      } catch (e) {
          reject(e)
      }
  })
}


process.on('exit', async () => {
  await global.db.write()
})
