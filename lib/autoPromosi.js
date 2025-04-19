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

        if (!promoText && !autoscriptText && !recodeText && !vpsText) {
            console.log('❌ Semua pesan kosong. Tidak ada yang dikirim.');
            return;
        }

        const groupDbPath = path.join(__dirname, '../database/group.json');
        let groupDb = {};
        if (fs.existsSync(groupDbPath)) {
            try {
                groupDb = JSON.parse(fs.readFileSync(groupDbPath, 'utf8'));
            } catch (e) {
                console.error('❌ Gagal membaca group.json:', e.message);
            }
        }

        const randomDelay = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        const sendWithContext = async (groupId, text, body) => {
            await A17.sendMessage(groupId, {
                text,
                contextInfo: {
                    externalAdReply: {
                        showAdAttribution: true,
                        title: global.BotName,
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

        let grupDikirim = 0;
        let grupDilewati = 0;

        for (let i = 0; i < anu.length; i++) {
            const groupId = anu[i];

            if (groupDb[groupId]?.promosi === false) {
                console.log(`⏩ Lewati grup ${groupId} (promosi: false)`);
                grupDilewati++;
                continue;
            }

            console.log(`🔹 Mengirim ke grup ${i + 1}/${anu.length} - ${groupId}`);

            try {
				if (promoText) {
					await sendWithContext(groupId, promoText, 'Promo Terbaru dari Newbie Store');
					await new Promise(res => setTimeout(res, randomDelay(2000, 3000)));
				}
				if (autoscriptText) {
					await sendWithContext(groupId, autoscriptText, 'Autoscript Tunneling by Newbie Store');
					await new Promise(res => setTimeout(res, randomDelay(2000, 3000)));
				}
				if (recodeText) {
					await sendWithContext(groupId, recodeText, 'Jasa Recode Newbie Store');
					await new Promise(res => setTimeout(res, randomDelay(2000, 3000)));
				}
				if (vpsText) {
					await sendWithContext(groupId, vpsText, 'VPS Newbie Store');
					await new Promise(res => setTimeout(res, randomDelay(2000, 3000)));
				}


                // Kirim file .hc dari /database/filehc
                const folderPath = path.join(__dirname, '../database/filehc');
                console.log('📦 Coba akses folder:', folderPath);

                if (!fs.existsSync(folderPath)) {
                    console.log('🚫 Folder filehc tidak ditemukan!');
                } else {
                    console.log('📂 Folder ditemukan! Ambil file sekarang...');
                    const allFiles = fs.readdirSync(folderPath);
                    console.log('📂 Isi folder filehc:', allFiles);

                    const hcFiles = allFiles.filter(f => /\.hc['"]?$/.test(f.toLowerCase()));
                    if (hcFiles.length === 0) {
                        console.log('📭 Tidak ada file .hc ditemukan di folder!');
                    }
                    console.log('✅ File yang akan dikirim:', hcFiles);

					for (const fileName of hcFiles) {
						const filePath = path.join(folderPath, fileName);
						try {
							const fileBuffer = fs.readFileSync(filePath);
							await A17.sendMessage(groupId, {
								document: fileBuffer,
								fileName: fileName.replace(/['"]+$/, ''),
								mimetype: 'application/octet-stream'
							});
							console.log(`📁 Kirim file ${fileName} ke grup ${groupId} (${i + 1}/${anu.length})`);
							await new Promise(res => setTimeout(res, randomDelay(2000, 3000))); // ⏱️ Delay antar file
						} catch (e) {
							console.error(`❌ Gagal kirim file ${fileName} ke ${groupId}:`, e.message);
						}
                    }
                }

                grupDikirim++;
                await new Promise(res => setTimeout(res, randomDelay(3000, 5000)));
            } catch (err) {
                console.error(`❌ Gagal kirim ke grup ${groupId}:`, err.message);
            }
        }

        const nowTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
        console.log(`✅ Promosi selesai dikirim ke ${grupDikirim} grup dari total ${anu.length}`);

        const notifText = `📢 *AutoPromosi Bot Selesai*\n\n🕒 Waktu       : ${nowTime}\n👥 Total Grup  : ${anu.length}\n✅ Dikirim ke  : ${grupDikirim} grup\n⏩ Dilewati     : ${grupDilewati} grup`;

        if (global.OwnerNumber && Array.isArray(global.OwnerNumber)) {
            for (const no of global.OwnerNumber) {
                const jid = no.includes('@s.whatsapp.net') ? no : `${no}@s.whatsapp.net`;
                try {
                    await A17.sendMessage(jid, { text: notifText });
                } catch (err) {
                    console.error(`❌ Gagal kirim notifikasi ke admin ${no}:`, err.message);
                }
            }
        }
    } catch (err) {
        console.error('❌ Error saat menjalankan autopromosi:', err.message);
    }
};

module.exports = autoPromosi;
