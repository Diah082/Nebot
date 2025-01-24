const fs = require('fs');
const path = require('path');

// Path ke file groups.json
const groupsPath = path.join(__dirname, '../database/groups.json');

// Inisialisasi data grup
let groups = {};

// Fungsi untuk memuat data dari file JSON
function loadGroups() {
  if (fs.existsSync(groupsPath)) {
    try {
      groups = JSON.parse(fs.readFileSync(groupsPath));
    } catch (error) {
      console.error('Gagal memuat groups.json, menggunakan struktur kosong:', error);
      groups = {};
    }
  }
}

// Fungsi untuk menyimpan data ke file JSON
function saveGroups() {
  try {
    fs.writeFileSync(groupsPath, JSON.stringify(groups, null, 2));
  } catch (error) {
    console.error('Gagal menyimpan groups.json:', error);
  }
}

// Fungsi untuk mendapatkan data grup tertentu
function getGroup(groupId) {
  return groups[groupId] || null;
}

// Fungsi untuk memperbarui atau menambahkan grup
function updateGroup(groupId, data) {
  groups[groupId] = { ...groups[groupId], ...data };
  saveGroups();
}

// Fungsi untuk menghapus grup dari database
function deleteGroup(groupId) {
  if (groups[groupId]) {
    delete groups[groupId];
    saveGroups();
  }
}

// Muat data saat pertama kali dijalankan
loadGroups();

// Ekspor fungsi untuk digunakan di seluruh bot
module.exports = {
  getGroup,
  updateGroup,
  deleteGroup,
  saveGroups,
  loadGroups,
};

