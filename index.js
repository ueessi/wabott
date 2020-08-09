const { create, decryptMedia } = require('@open-wa/wa-automate')
const moment = require('moment')
const {tiktok, instagram, twitter, facebook} = require('./lib/dl-video')
const urlShortener = require('./lib/shortener')
const color = require("./lib/color")
const { video } = require('tiktok-scraper')
const features = require('./lib/features')

const serverOption = {
    headless: true,
    qrRefreshS: 20,
    qrTimeout: 0,
    authTimeout: 0,
    autoRefresh: true,
    cacheEnabled: false,
    chromiumArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
}

const opsys = process.platform;
if (opsys === "win32" || opsys === "win64") {
    serverOption['executablePath'] = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
} else if (opsys === "linux") {
    serverOption['browserRevision'] = '737027';
} else if (opsys === "darwin") {
    serverOption['executablePath'] = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
}

const startServer = async (from) => {
create('Imperial', serverOption)
        .then(client => {
            console.log('[DEV] Keyzent')
            console.log('[SERVER] Server Started!')

            // Force it to keep the current session
            client.onStateChanged(state => {
                console.log('[Client State]', state)
                if (state === 'CONFLICT') client.forceRefocus()
            })

            client.onMessage((message) => {
                msgHandler(client, message)
            })
        })
}

async function msgHandler (client, message) {
    try {
        const { type, body, id, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg } = message
        const { pushname } = sender
        const { formattedTitle } = chat
        const time = moment(t * 1000).format('DD/MM HH:mm:ss')
        const commands = ['#help', '#menu', '#stiker', '#sticker', '#tik', '#ig', '#tw', '#fb','#quotes', '#bucin', 'test', 'tes', 'assalamualaikum', 'P', 'oi', 'oii', 'woi', 'woii', 'thul', 'ngopi', 'hai', 'hallo', 'hi', 'halo', 'bot', 'selamat pagi', 'pagi', 'pgi', 'pgii', 'selamat siang', 'siang', 'selamat malam', 'malam', 'mlam', 'mlm', 'makasi', 'makasih', 'thanks', 'thank', 'maacii', 'mas', 'mbak', 'mba']
        const cmds = commands.map(x => x + '\\b').join('|')
        const cmd = type === 'chat' ? body.match(new RegExp(cmds, 'gi')) : type === 'image' && caption ? caption.match(new RegExp(cmds, 'gi')) : ''
        const args = body.trim().split(' ')
        const isUrl = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
        const uaOverride = "WhatsApp/2.2029.4 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36";

        if (cmd) {
            if (!isGroupMsg) console.log(color('[EXEC]'), color(time, 'yellow'), color(cmd[0]), 'from', color(pushname))
            if (isGroupMsg) console.log(color('[EXEC]'), color(time, 'yellow'), color(cmd[0]), 'from', color(pushname), 'in', color(formattedTitle))
            switch (cmd[0]) {
                case '#help':
                case '#menu':
                    client.sendText(from, '👉 *SELAMAT DATANG* 👈 \n⏰ Bot online pukul 07.00-22.00 \n📌 Sebelum menggunakan, \ntes dengan chat P dulu, \njika bot membalas, maka bot online \n\nMenu: \n1. #stiker / #sticker \nuntuk membuat stiker dengan cara kirim / balas gambar dengan caption #stiker \n2. #tik \nuntuk mendownload video tiktok dengan cara ketik #tik spasi link \n3. #ig \nuntuk mendownload video instagram dengan cara ketik #ig spasi link \n4. #tw \nuntuk mendownload vide twitter dengan cara ketik #tw spasi link \n5. #fb \nuntuk mendownload video facebook dengan cara ketik #fb spasi link \n6. #quotes \nakan mengirim kata kata quotes \n7. #bucin \nhampir sama dengan quotes \n\n❌ *Mohon jangan spam stiker* ❌ \n        kasih jeda 5-10 detik yaa. \n\n         ❣️ *TERIMA KASIH* ❣️')
                    break
                case 'hai':
                case 'hi':
                    client.sendText(from, 'hallo')
                    break
                case 'halo':
                case 'hallo':
                    client.sendText(from, 'hi')
                    break
                case 'test':
                case 'tes':
                    client.sendText(from, 'on')
                    break
                case 'thul':
                case 'tul':
                case 'mas':
                case 'mbak':
                case 'mba':
                case 'bot':
                    client.sendText(from, 'dalem')
                    break
                case 'selamat pagi':
                case 'pagi':
                case 'pgi':
                case 'pgii":
                    client.sendText(from, 'selamat pagi juga ❣️')
                    break
                case 'selamat siang':
                case 'siang':
                    client.sendText(from, 'selamat siang juga ❣️')
                    break
                case 'selamat malam':
                case 'malam':
                case 'mlam':
                case 'mlm':
                    client.sendText(from, 'selamat malam juga ❣️')
                    break
                case 'makasi':
                case 'makasih':
                case 'thanks':
                case 'thank':
                case 'maacii':
                    client.sendText(from, 'sama sama')
                    break
                case 'assalamualaikum':
                    client.sendText(from, 'waalaikumsalam wr. wb.')
                    break
                case 'P':
                case 'oi':
                case 'oii':
                case 'woi':
                case 'woii':
                    client.sendText(from, 'yang sopan dikit napa.')
                    break
                case 'ngopi':
                    client.sendText(from, 'kuy')
                    break
                case '$quotes':
                    const quotes = await features.quotes()
                    if (quotes) {
                        await client.sendText(from, quotes)
                    }
                    break
                case '#bucin':
                    const bucin = await features.bucin()
                    await client.sendText(from, bucin)
                    break
                case '#stiker':
                case '#sticker':
                    if (isMedia) {
                        const mediaData = await decryptMedia(message, uaOverride)
                        const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                        await client.sendImageAsSticker(from, imageBase64)
                    } else if (quotedMsg && quotedMsg.type == 'image') {
                        const mediaData = await decryptMedia(quotedMsg)
                        const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                        await client.sendImageAsSticker(from, imageBase64)
                    } else if (args.length == 2) {
                        const url = args[1]
                        if (url.match(isUrl)) {
                            await client.sendStickerfromUrl(from, url, {method: 'get'})
                                .then(r => { if (!r) client.sendText(from, 'maaf mint, link yang kamu kirim tidak dapat memuat gambar.') })
                                .catch(err => console.log('Caught exception: ', err))
                        } else {
                            client.sendText(from, 'maaf mint, link yang kamu kirim tidak valid.')
                        }
                    } else {
                        client.sendText(from, 'gambarnya mana? \n\npake caption #srtiker ya mint')
                    }
                    break
                case '#tik':
                    if (args.length == 2) {
                        const url = args[1]
                        if (!url.match(isUrl) && !url.includes('tiktok.com')) return client.sendText(from, 'maaf mint, link yang kamu kirim tidak valid')
                        await client.sendText(from, "*Scraping Metadata...*");
                        await tiktok(url)
                            .then((videoMeta) => {
                                const filename = videoMeta.authorMeta.name + '.mp4'
                                const caps = `*Metadata:*\nUsername: ${videoMeta.authorMeta.name} \nMusic: ${videoMeta.musicMeta.musicName} \nView: ${videoMeta.playCount.toLocaleString()} \nLike: ${videoMeta.diggCount.toLocaleString()} \nComment: ${videoMeta.commentCount.toLocaleString()} \nShare: ${videoMeta.shareCount.toLocaleString()} \nCaption: ${videoMeta.text.trim() ? videoMeta.text : '-'} \n\nTerimakasih.`
                                client.sendFile(from,videoMeta.urlbase64, filename, videoMeta.NoWaterMark ? caps : `⚠ Video tanpa watermark tidak tersedia. \n\n${caps}`)
                                    .catch(err => console.log('Caught exception: ', err))
                            }).catch((err) => {
                                client.sendText(from, 'gagal mengambil metadata mint, link yang kamu kirim tidak valid')
                            });
                    }
                    break
                case '#ig':
                    if (args.length == 2) {
                        const url = args[1]
                        if (!url.match(isUrl) && !url.includes('instagram.com')) return client.sendText(from, 'maaf mint, link yang kamu kirim tidak valid')
                        await client.sendText(from, "*Scraping Metadata...*");
                        instagram(url)
                            .then(async (videoMeta) => {
                                const content = []
                                for (var i = 0; i < videoMeta.length; i++) {
                                    await urlShortener(videoMeta[i].video)
                                        .then((result) => {
                                            console.log('Shortlink: ' + result)
                                            content.push(`${i+1}. ${result}`)
                                        }).catch((err) => {
                                            client.sendText(from, `Error, ` + err)
                                        });
                                }
                                client.sendText(from, `link downloadnya mint:\n${content.join('\n')} \n\nTerimakasih.`)
                            }).catch((err) => {
                                console.error(err)
                                if (err == 'Not a video') return client.sendText(from, `error mint, tidak ada video di link yang kamu kirim`)
                                client.sendText(from, `error mint, user private atau link salah`)
                            });
                    }
                    break
                case '#tw':
                    if (args.length == 2) {
                        const url = args[1]
                        if (!url.match(isUrl) && !url.includes('twitter.com') || url.includes('t.co')) return client.sendText(from, 'maaf mint, url yang kamu kirim tidak valid')
                        await client.sendText(from, "*Scraping Metadata...*");
                        twitter(url)
                            .then(async (videoMeta) => {
                                try {
                                    if (videoMeta.type == 'video') {
                                        const content = videoMeta.variants.filter(x => x.content_type !== 'application/x-mpegURL').sort((a, b) => b.bitrate - a.bitrate)
                                        const result = await urlShortener(content[0].url)
                                        console.log('Shortlink: ' + result)
                                        client.sendFileFromUrl(from, content[0].url, 'TwitterVideo.mp4', `link downloadnya mint: ${result} \n\nTerimakasih.`)
                                    } else if (videoMeta.type == 'photo') {
                                        for (var i = 0; i < videoMeta.variants.length; i++) {
                                            await client.sendFileFromUrl(from, videoMeta.variants[i], videoMeta.variants[i].split('/media/')[1], '')
                                        }
                                    }
                                } catch (err) {
                                    client.sendText(from, `Error, ` + err)
                                }
                            }).catch((err) => {
                                console.log(err)
                                client.sendText(from, `maaf mint, link tidak valid atau tidak ada video di link yang kamu kirim`)
                            });
                    }
                    break
                case '#fb':
                        if (args.length == 2) {
                            const url = args[1]
                            if (!url.match(isUrl) && !url.includes('facebook.com')) return client.sendText(from, 'maaf mint, url yang kamu kirim tidak valid')
                            await client.sendText(from, "*Scraping Metadata...*");
                            facebook(url)
                                .then(async (videoMeta) => {
                                    try {
                                        const title = videoMeta.response.title
                                        const thumbnail = videoMeta.response.thumbnail
                                        const links = videoMeta.response.links
                                        const shorts = []
                                        for (var i = 0; i < links.length; i++) {
                                            const shortener = await urlShortener(links[i].url)
                                            console.log('Shortlink: ' + shortener)
                                            links[i]['short'] = shortener
                                            shorts.push(links[i])
                                        }
                                        const link = shorts.map((x) => `${x.resolution} Quality: ${x.short}`) 
                                        const caption = `Text: ${title} \nLink Download: \n${link.join('\n')} \n\nTerimakasih.`
                                        client.sendFileFromUrl(from,thumbnail, 'videos.jpg', caption )
                                    } catch (err) {
                                        client.sendText(from, `Error, ` + err)
                                    }
                                })
                                .catch((err) => {
                                    client.sendText(from, `error mint, url tidak valid atau tidak memuat video \n\n${err}`)
                                })
                        }
                        break
            }
        } else {
            if (!isGroupMsg) console.log('[RECV]', color(time, 'yellow'), 'Message from', color(pushname))
            if (isGroupMsg) console.log('[RECV]', color(time, 'yellow'), 'Message from', color(pushname), 'in', color(formattedTitle))
        }
    } catch (err) {
        console.log(color('[ERROR]', 'red'), err)
    }
}

process.on('Something went wrong', function (err) {
    console.log('Caught exception: ', err);
  });

startServer()
