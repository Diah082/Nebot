const fs = require("fs");
const chalk = require("chalk");

const updateConfig = (key, key1, value) => {
  try {
    // Baca isi file config.js
    let configContent = fs.readFileSync("./config.js", "utf8");
    console.log("Isi file sebelum diubah:", configContent);

    // Menentukan regex untuk menemukan key yang diinginkan
    const regex = new RegExp(`(global\\.${key} = process\\.env\\.${key1} \\|\\|) [^;]+;`, "g");
    
    // Mengganti nilai pada bagian yang ditemukan
    const newValue = `global.${key} = process.env.${key1} || ${value};`;

    // Jika regex tidak menemukan variabel yang sesuai, tampilkan pesan error
    if (!regex.test(configContent)) {
      console.error(`❌ Variabel global.${key} tidak ditemukan di config.js`);
      return;
    }

    // Ganti nilai yang ditemukan dengan nilai baru
    configContent = configContent.replace(regex, newValue);
    console.log("Isi file setelah diubah:", configContent);

    // Tulis ulang file config.js
    fs.writeFileSync("./config.js", configContent, "utf8");
    console.log(chalk.green(`✔️ Config berhasil diperbarui: ${key} = ${value}`));
  } catch (err) {
    console.error(chalk.red(`❌ Gagal memperbarui config.js: ${err.message}`));
  }
};

module.exports = { updateConfig };
