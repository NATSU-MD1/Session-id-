
const { giftedid } = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const { Storage, File } = require("megajs");

const {
    default: Gifted_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");

function randomMegaId(length = 6, numberLength = 4) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const number = Math.floor(Math.random() * Math.pow(10, numberLength));
    return `${result}${number}`;
}

async function uploadCredsToMega(credsPath) {
    try {
        const storage = await new Storage({
            email: 'palvinkibet46@gmail.com',
            password: 'caseytech@2030'
        }).ready;
        console.log('Mega storage initialized.');
        if (!fs.existsSync(credsPath)) {
            throw new Error(`File not found: ${credsPath}`);
        }
        const fileSize = fs.statSync(credsPath).size;
        const uploadResult = await storage.upload({
            name: `${randomMegaId()}.json`,
            size: fileSize
        }, fs.createReadStream(credsPath)).complete;
        console.log('Session successfully uploaded to Mega.');
        const fileNode = storage.files[uploadResult.nodeId];
        const megaUrl = await fileNode.link();
        console.log(`Session Url: ${megaUrl}`);
        return megaUrl;
    } catch (error) {
        console.error('Error uploading to Mega:', error);
        throw error;
    }
}

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = giftedid();
    let num = req.query.number;

    async function GIFTED_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let Gifted = Gifted_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari")
            });

            if (!Gifted.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Gifted.requestPairingCode(num);
                console.log(`Your Code: ${code}`);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Gifted.ev.on('creds.update', saveCreds);

            Gifted.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection == "open") {
                    await delay(50000);
                    const filePath = __dirname + `/temp/${id}/creds.json`;
                    if (!fs.existsSync(filePath)) {
                        console.error("File not found:", filePath);
                        return;
                    }

                    const megaUrl = await uploadCredsToMega(filePath);
                    const sid = megaUrl.includes("https://mega.nz/file/")
                        ? 'Caseyrhodes~' + megaUrl.split("https://mega.nz/file/")[1]
                        : 'Error: Invalid URL';

                    console.log(`Session ID: ${sid}`);

                    Gifted.groupAcceptInvite("Ik0YpP0dM8jHVjScf1Ay5S");

                    const sidMsg = await Gifted.sendMessage(
                        Gifted.user.id,
                        {
                            text: sid,
                            contextInfo: {
                                mentionedJid: [Gifted.user.id],
                                forwardingScore: 999,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '120363304536947506@newsletter',
                                    newsletterName: 'ANYWAY TECH 👻',
                                    serverMessageId: 143
                                }
                            }
                        },
                        {
                            disappearingMessagesInChat: true,
                            ephemeralExpiration: 86400
                        }
                    );

                    const GIFTED_TEXT = `
*✅sᴇssɪᴏɴ ɪᴅ ɢᴇɴᴇʀᴀᴛᴇᴅ✅*
______________________________
*🎉 SESSION GENERATED SUCCESSFULLY! ✅*

*💪 Empowering Your Experience with NATSU-𝗠𝗗 Bot*

*🌟 Show your support by natsu our repo a star! 🌟*
🔗 https://github.com/anywaytech2/ANYWAY-XMD

BOOST YOUR SOCIAL MEDIA NOW WITH 👇
━━━━━━━
┃ www.anywayboost.com 
┗━━━━━━━━━━━━━━━━━━━━━━━
*💭 Need help? Join our support groups:*
📢 💬
https://whatsapp.com/channel/0029VbBdQOZHFxP42Sh9Ia1U

*📚 Learn & Explore More with Tutorials:*
🪄 

> ᴘᴏᴡᴇʀᴇᴅ ʙʏ natsu ᴛᴇᴄʜ
*Together, we build the future of automation! 🚀*
______________________________

Use your Session ID Above to Deploy your Bot.
Check on YouTube Channel for Deployment Procedure(Ensure you have Github Account and Billed Heroku Account First.)
Don't Forget To Give Star⭐ To My Repo`;

                    await Gifted.sendMessage(
                        Gifted.user.id,
                        {
                            text: GIFTED_TEXT,
                            contextInfo: {
                                mentionedJid: [Gifted.user.id],
                                forwardingScore: 999,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '120363304536947506@newsletter',
                                    newsletterName: 'NATSU TECH',
                                    serverMessageId: 143
                                }
                            }
                        },
                        {
                            quoted: sidMsg,
                            disappearingMessagesInChat: true,
                            ephemeralExpiration: 86400
                        }
                    );

                    await delay(100);
                    await Gifted.ws.close();
                    return await removeFile('./temp/' + id);
                } else if (
                    connection === "close" &&
                    lastDisconnect &&
                    lastDisconnect.error &&
                    lastDisconnect.error.output.statusCode != 401
                ) {
                    await delay(10000);
                    GIFTED_PAIR_CODE();
                }
            });
        } catch (err) {
            console.error("Service Has Been Restarted:", err);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "Service is Currently Unavailable" });
            }
        }
    }

    return await GIFTED_PAIR_CODE();
});

module.exports = router;
 
