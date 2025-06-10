
let modal = 150000;
let pendapatan = 0;
let totalSaldoTerjual = 0;
let nomorTransaksi = 0;

// Debug mode variables
let debugMode = false;
let debugLog = [];

// Admin variables
let isAdminLoggedIn = false;
const adminPassword = 'admin123'; // Change this to a secure password
let transactionDatabase = [];

// Update modal awal ketika input berubah
document.addEventListener('DOMContentLoaded', function() {
  const modalInput = document.getElementById('modalAwal');
  modalInput.addEventListener('input', function() {
    modal = parseInt(this.value) || 0;
    updateRingkasan();
  });
});

function tambahTransaksi() {
  const saldoInput = document.getElementById('saldoDijual');
  const nominalSaldo = parseInt(saldoInput.value);
  const admin = parseInt(document.getElementById('biayaAdmin').value) || 0;

  logDebug(`Attempting transaction: Saldo=${nominalSaldo}, Admin=${admin}`, 'info');

  // Validasi input
  if (isNaN(nominalSaldo) || nominalSaldo <= 0) {
    logDebug('Validation failed: Invalid saldo amount', 'error');
    showAlert('Masukkan nominal saldo yang valid!', 'error');
    return;
  }

  if (modal < nominalSaldo) {
    logDebug(`Validation failed: Insufficient modal (${modal} < ${nominalSaldo})`, 'error');
    showAlert('Modal tidak cukup untuk transaksi ini!', 'error');
    return;
  }

  // Proses transaksi
  const modalSebelum = modal;
  modal -= nominalSaldo;
  pendapatan += admin;
  totalSaldoTerjual += nominalSaldo;
  nomorTransaksi++;

  logDebug(`Transaction processed: Modal ${modalSebelum} -> ${modal}, Pendapatan +${admin}`, 'success');

  // Tambah ke database
  const waktu = new Date().toLocaleString('id-ID');
  const transactionRecord = {
    id: nomorTransaksi,
    timestamp: new Date().toISOString(),
    waktu: waktu,
    saldoDijual: nominalSaldo,
    biayaAdmin: admin,
    modalTersisa: modal
  };
  
  transactionDatabase.push(transactionRecord);
  saveToLocalStorage();

  // Tambah ke daftar transaksi
  const list = document.getElementById('daftarTransaksi');
  
  // Hapus pesan "Belum ada transaksi" jika ini transaksi pertama
  if (nomorTransaksi === 1) {
    list.innerHTML = '';
  }

  const item = document.createElement('li');
  item.innerHTML = `
    <strong>#${nomorTransaksi}</strong> - ${waktu}<br>
    Saldo Rp${nominalSaldo.toLocaleString('id-ID')} dijual | 
    Keuntungan: Rp${admin.toLocaleString('id-ID')}
  `;
  list.appendChild(item);

  // Update ringkasan
  updateRingkasan();
  updateDebugVariables();
  
  // Clear input dan show success message
  saldoInput.value = '';
  showAlert(`Transaksi berhasil! Saldo Rp${nominalSaldo.toLocaleString('id-ID')} telah dijual.`, 'success');
}

function updateRingkasan() {
  const ringkasan = document.getElementById('ringkasan');
  const persentaseModal = modal > 0 ? ((modal / parseInt(document.getElementById('modalAwal').value)) * 100).toFixed(1) : 0;
  
  ringkasan.innerHTML = `
    <strong>Modal Tersisa:</strong> Rp${modal.toLocaleString('id-ID')} (${persentaseModal}%)<br>
    <strong>Total Saldo Terjual:</strong> Rp${totalSaldoTerjual.toLocaleString('id-ID')}<br>
    <strong>Total Pendapatan Bersih:</strong> Rp${pendapatan.toLocaleString('id-ID')}<br>
    <strong>Jumlah Transaksi:</strong> ${nomorTransaksi}
  `;
}

function showAlert(message, type) {
  // Remove existing alerts
  const existingAlerts = document.querySelectorAll('.alert');
  existingAlerts.forEach(alert => alert.remove());

  // Create new alert
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  
  // Insert at the top of container
  const container = document.querySelector('.container');
  container.insertBefore(alert, container.firstChild);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    alert.remove();
  }, 3000);
}

// Allow Enter key to submit
document.getElementById('saldoDijual').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    tambahTransaksi();
  }
});

// Debugger Functions
function toggleDebugger() {
  debugMode = !debugMode;
  const panel = document.getElementById('debugPanel');
  const button = document.getElementById('debugToggle');
  
  if (debugMode) {
    panel.style.display = 'block';
    button.textContent = 'Nonaktifkan Debug Mode';
    button.style.background = 'linear-gradient(45deg, #27ae60, #229954)';
    logDebug('Debug mode activated', 'success');
    updateDebugVariables();
  } else {
    panel.style.display = 'none';
    button.textContent = 'Aktifkan Debug Mode';
    button.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
  }
}

function logDebug(message, type = 'info') {
  if (!debugMode) return;
  
  const timestamp = new Date().toLocaleTimeString('id-ID');
  const logEntry = {
    time: timestamp,
    message: message,
    type: type
  };
  
  debugLog.push(logEntry);
  
  const logContainer = document.getElementById('debugLog');
  const logItem = document.createElement('div');
  logItem.className = `log-item ${type}`;
  logItem.innerHTML = `[${timestamp}] ${message}`;
  
  logContainer.appendChild(logItem);
  logContainer.scrollTop = logContainer.scrollHeight;
  
  // Keep only last 50 log entries
  if (debugLog.length > 50) {
    debugLog.shift();
    logContainer.removeChild(logContainer.firstChild);
  }
}

function updateDebugVariables() {
  if (!debugMode) return;
  
  document.getElementById('debugModal').textContent = modal.toLocaleString('id-ID');
  document.getElementById('debugPendapatan').textContent = pendapatan.toLocaleString('id-ID');
  document.getElementById('debugSaldoTerjual').textContent = totalSaldoTerjual.toLocaleString('id-ID');
  document.getElementById('debugTransaksi').textContent = nomorTransaksi;
}

function clearDebugLog() {
  document.getElementById('debugLog').innerHTML = '<div class="log-item">Debug log cleared</div>';
  debugLog = [];
  logDebug('Debug log cleared', 'warning');
}

function exportDebugData() {
  const debugData = {
    timestamp: new Date().toISOString(),
    variables: {
      modal: modal,
      pendapatan: pendapatan,
      totalSaldoTerjual: totalSaldoTerjual,
      nomorTransaksi: nomorTransaksi
    },
    logs: debugLog
  };
  
  const dataStr = JSON.stringify(debugData, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `debug-data-${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.json`;
  link.click();
  
  logDebug('Debug data exported', 'success');
}

// Admin Database Functions
function loginAdmin() {
  const password = document.getElementById('adminPassword').value;
  
  if (password === adminPassword) {
    isAdminLoggedIn = true;
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('adminPassword').value = '';
    showAlert('Login admin berhasil!', 'success');
    loadFromLocalStorage();
  } else {
    showAlert('Password admin salah!', 'error');
    document.getElementById('adminPassword').value = '';
  }
}

function logoutAdmin() {
  isAdminLoggedIn = false;
  document.getElementById('adminLogin').style.display = 'block';
  document.getElementById('adminPanel').style.display = 'none';
  document.getElementById('databaseView').style.display = 'none';
  showAlert('Logout berhasil!', 'success');
}

function viewDatabase() {
  if (!isAdminLoggedIn) {
    showAlert('Akses ditolak! Login sebagai admin terlebih dahulu.', 'error');
    return;
  }
  
  const databaseView = document.getElementById('databaseView');
  databaseView.style.display = databaseView.style.display === 'none' ? 'block' : 'none';
  
  if (databaseView.style.display === 'block') {
    updateDatabaseView();
  }
}

function updateDatabaseView() {
  // Update statistics
  document.getElementById('dbTotalTransaksi').textContent = transactionDatabase.length;
  document.getElementById('dbTotalSaldo').textContent = totalSaldoTerjual.toLocaleString('id-ID');
  document.getElementById('dbTotalPendapatan').textContent = pendapatan.toLocaleString('id-ID');
  
  // Update table
  const tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = '';
  
  transactionDatabase.forEach(transaction => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${transaction.id}</td>
      <td>${transaction.waktu}</td>
      <td>Rp${transaction.saldoDijual.toLocaleString('id-ID')}</td>
      <td>Rp${transaction.biayaAdmin.toLocaleString('id-ID')}</td>
      <td>Rp${transaction.modalTersisa.toLocaleString('id-ID')}</td>
    `;
    tableBody.appendChild(row);
  });
}

function exportDatabase() {
  if (!isAdminLoggedIn) {
    showAlert('Akses ditolak! Login sebagai admin terlebih dahulu.', 'error');
    return;
  }
  
  const databaseExport = {
    exportDate: new Date().toISOString(),
    summary: {
      totalTransaksi: transactionDatabase.length,
      totalSaldoTerjual: totalSaldoTerjual,
      totalPendapatan: pendapatan,
      modalTersisa: modal
    },
    transactions: transactionDatabase
  };
  
  const dataStr = JSON.stringify(databaseExport, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `database-transaksi-${new Date().toLocaleDateString('id-ID').replace(/\//g, '-')}.json`;
  link.click();
  
  showAlert('Database berhasil diekspor!', 'success');
}

function clearDatabase() {
  if (!isAdminLoggedIn) {
    showAlert('Akses ditolak! Login sebagai admin terlebih dahulu.', 'error');
    return;
  }
  
  if (confirm('Apakah Anda yakin ingin menghapus semua data transaksi? Tindakan ini tidak dapat dibatalkan!')) {
    transactionDatabase = [];
    saveToLocalStorage();
    updateDatabaseView();
    showAlert('Database berhasil dikosongkan!', 'success');
  }
}

function saveToLocalStorage() {
  try {
    const data = {
      transactionDatabase: transactionDatabase,
      modal: modal,
      pendapatan: pendapatan,
      totalSaldoTerjual: totalSaldoTerjual,
      nomorTransaksi: nomorTransaksi
    };
    localStorage.setItem('danaManagerData', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    showAlert('Gagal menyimpan data ke localStorage!', 'error');
  }
}

function loadFromLocalStorage() {
  try {
    const savedData = localStorage.getItem('danaManagerData');
    if (savedData) {
      const data = JSON.parse(savedData);
      transactionDatabase = data.transactionDatabase || [];
      
      // Only load if admin is logged in and wants to restore session
      if (isAdminLoggedIn && confirm('Ditemukan data tersimpan. Apakah ingin memuat data sebelumnya?')) {
        modal = data.modal || 150000;
        pendapatan = data.pendapatan || 0;
        totalSaldoTerjual = data.totalSaldoTerjual || 0;
        nomorTransaksi = data.nomorTransaksi || 0;
        
        updateRingkasan();
        updateDebugVariables();
        restoreTransactionList();
      }
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    showAlert('Gagal memuat data dari localStorage!', 'error');
  }
}

function restoreTransactionList() {
  const list = document.getElementById('daftarTransaksi');
  list.innerHTML = '';
  
  if (transactionDatabase.length === 0) {
    list.innerHTML = '<li style="text-align: center; color: #6c757d; font-style: italic;">Belum ada transaksi</li>';
    return;
  }
  
  transactionDatabase.forEach(transaction => {
    const item = document.createElement('li');
    item.innerHTML = `
      <strong>#${transaction.id}</strong> - ${transaction.waktu}<br>
      Saldo Rp${transaction.saldoDijual.toLocaleString('id-ID')} dijual | 
      Keuntungan: Rp${transaction.biayaAdmin.toLocaleString('id-ID')}
    `;
    list.appendChild(item);
  });
}

// Load data on page load (only for admin)
document.addEventListener('DOMContentLoaded', function() {
  const modalInput = document.getElementById('modalAwal');
  modalInput.addEventListener('input', function() {
    modal = parseInt(this.value) || 0;
    updateRingkasan();
  });
  
  // Auto-save every 30 seconds if there are transactions
  setInterval(() => {
    if (transactionDatabase.length > 0) {
      saveToLocalStorage();
    }
  }, 30000);
});

// Allow Enter key for admin password
document.getElementById('adminPassword').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    loginAdmin();
  }
});
