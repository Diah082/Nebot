const fs = require('fs');
const path = require('path');

const autoPromosi = async (A17, global) => {
    try {
        const getGroups = await A17.groupFetchAllParticipating();
        const groups = Object.entries(getGroups).map(([_, group]) => group);
        const anu = groups.map(group => group.id);

        const readJSON = (fileName) => {
            try {
                const data = fs.readFileSync(path.join(__dirname, '../database', fileName), 'utf8');
                const parsed = JSON.parse(data);
                return parsed.text && parsed.text.trim() ? parsed.text : null;
            } catch {
                return null;
            }
        };

        const promoText = readJSON('promo.json');
        const autoscriptText = readJSON('autoscript.json');
        const recodeText = readJSON('recode.json');
        const vpsText = readJSON('VPs.json');

        // Kalau semua kosong, hentikan
        if (!promoText && !autoscriptText && !recodeText && !vpsText) {
            console.log('❌ Semua pesan kosong. Tidak ada yang dikirim.');
            return;
        }

        const nowtime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        const randomDelay = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        const sendWithContext = async (groupId, text, body) => {
            await A17.sendMessage(groupId, {
                text,
                contextInfo: {
                    externalAdReply: {
                        showAdAttribution: true,
                        title: nowtime,
                        body,
                        thumbnail: global.Thumb,
                        sourceUrl: global.website,
                        mediaType: 1,
                        renderLargerThumbnail: true,
                    },
                },
            });
        };

        console.log(`📢 Mulai mengirim promosi ke ${anu.length} grup...`);

        for (let i = 0; i < anu.length; i++) {
            const groupId = anu[i];
            console.log(`🔹 Mengirim ke grup ${i + 1}/${anu.length} - ${groupId}`);

            try {
                if (promoText) await sendWithContext(groupId, promoText, 'Promo Terbaru dari Newbie Store');
                if (autoscriptText) await sendWithContext(groupId, autoscriptText, 'Autoscript Tunneling by Newbie Store');
                if (recodeText) await sendWithContext(groupId, recodeText, 'Jasa Recode Newbie Store');
                if (vpsText) await sendWithContext(groupId, vpsText, 'VPS Newbie Store');

                await new Promise(res => setTimeout(res, randomDelay(5000, 8000))); // Delay antar grup
            } catch (err) {
                if (err.message.includes("rate-overlimit")) {
                    console.warn(`⏳ Terkena rate limit! Menunggu 1 menit...`);
                    await new Promise(res => setTimeout(res, 60000));
                } else {
                    console.error(`❌ Gagal kirim ke grup ${groupId}:`, err.message);
                }
            }
        }

        console.log(`✅ Promosi selesai dikirim ke ${anu.length} grup.`);
    } catch (err) {
        console.error('❌ Error saat menjalankan promosi otomatis:', err.message);
    }
};

module.exports = autoPromosi;
