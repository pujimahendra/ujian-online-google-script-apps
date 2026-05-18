function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Ujian Online Pilihan Ganda')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Fungsi untuk memverifikasi login siswa
function verifikasiLogin(email) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetSiswa = ss.getSheetByName("data_siswa");
  var sheetNilai = ss.getSheetByName("nilai_siswa");
  
  email = email.toString().trim().toLowerCase();
  
  // 1. Cek apakah email sudah ada di sheet nilai_siswa (Sudah pernah ujian)
  var dataNilai = sheetNilai.getDataRange().getValues();
  for (var i = 1; i < dataNilai.length; i++) {
    if (dataNilai[i][2].toString().trim().toLowerCase() === email) {
      return { status: 'sudah_ujian', pesan: 'Anda telah selesai mengerjakan ujian ini. Tidak dapat mengulang.' };
    }
  }
  
  // 2. Cek apakah email terdaftar di sheet data_siswa
  var dataSiswa = sheetSiswa.getDataRange().getValues();
  for (var j = 1; j < dataSiswa.length; j++) {
    // Indeks 3 adalah kolom email berdasarkan struktur tabel
    if (dataSiswa[j][3].toString().trim().toLowerCase() === email) {
      return { 
        status: 'sukses', 
        data: {
          id: dataSiswa[j][0],
          nama: dataSiswa[j][1],
          email: dataSiswa[j][3]
        } 
      };
    }
  }
  
  return { status: 'tidak_terdaftar', pesan: 'Email tidak ditemukan dalam sistem.' };
}

// Fungsi untuk mengambil dan mengacak soal serta mendeteksi gambar (URL & CellImage)
function ambilSoal() {
  var sheetSoal = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("soal");
  var rangeSoal = sheetSoal.getDataRange();
  var data = rangeSoal.getValues();
  
  var soalList = [];
  // Loop dari baris kedua (indeks 1)
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] !== "") { 
      var gambarUrl = "";
      var cellValue = data[i][1];
      
      // Deteksi Tipe Gambar: URL String biasa atau CellImage Object (Gambar yang dimasukkan langsung ke sel)
      if (cellValue) {
        if (typeof cellValue === 'string' && (cellValue.indexOf('http') === 0 || cellValue.indexOf('data:image') === 0)) {
          // Jika berupa tautan URL biasa atau base64 string
          gambarUrl = cellValue;
        } else {
          // Jika gambar dimasukkan lewat menu "Insert > Image in cell" (Modern CellImage API)
          try {
            var cellRange = sheetSoal.getRange(i + 1, 2); // Kolom B adalah kolom ke-2 (gambar)
            var cellImg = cellRange.getValue();
            if (cellImg && typeof cellImg === 'object' && typeof cellImg.getContentUrl === 'function') {
              // Dapatkan URL sementara yang di-host oleh Google
              gambarUrl = cellImg.getContentUrl();
            }
          } catch(err) {
            Logger.log("Gagal membaca CellImage di baris " + (i+1) + ": " + err.toString());
            gambarUrl = "";
          }
        }
      }
      
      soalList.push({
        id: data[i][0],
        gambar: gambarUrl,
        pertanyaan: data[i][2],
        pilihan: {
          A: data[i][3],
          B: data[i][4],
          C: data[i][5],
          D: data[i][6],
          E: data[i][7] // Kolom pilihan_e (indeks ke-7)
        }
      });
    }
  }
  
  // Acak urutan soal
  soalList.sort(function() { return 0.5 - Math.random() });
  
  return soalList;
}

// Fungsi untuk memproses jawaban, menghitung nilai, dan menyimpan riwayat jawaban
function prosesSubmitUjian(email, nama, jawabanSiswa, waktuHabisDetik) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetSoal = ss.getSheetByName("soal");
  var sheetNilai = ss.getSheetByName("nilai_siswa");
  
  // Ambil kunci jawaban
  var dataSoal = sheetSoal.getDataRange().getValues();
  var kunciJawaban = {};
  var totalSoal = 0;
  
  for (var i = 1; i < dataSoal.length; i++) {
    if(dataSoal[i][0] !== "") {
      // Indeks 8 adalah Kunci Jawaban setelah digeser oleh kolom pilihan_e
      kunciJawaban[dataSoal[i][0]] = dataSoal[i][8]; 
      totalSoal++;
    }
  }
  
  // Persiapan Variabel Nilai & Array Jawaban
  var jawabanBenarCount = 0;
  var arrayBenar = [];
  var arraySalah = [];
  
  // Evaluasi satu per satu berdasarkan seluruh soal yang ada (mencegah ada soal yang terlewat)
  for (var idSoal in kunciJawaban) {
    // Jika siswa tidak menjawab, beri label "Tidak Dijawab"
    var jawabanUser = jawabanSiswa[idSoal] ? jawabanSiswa[idSoal] : "Tidak Dijawab"; 
    var kunci = kunciJawaban[idSoal];
    
    // Format yang diminta: ["id_soal", "jawaban_siswa"]
    if (jawabanUser === kunci) {
      jawabanBenarCount++;
      arrayBenar.push([idSoal, jawabanUser]);
    } else {
      arraySalah.push([idSoal, jawabanUser]);
    }
  }
  
  // Hitung Nilai = (Benar / Total) * 100
  var nilaiAkhir = (jawabanBenarCount / totalSoal) * 100;
  
  // Format Waktu Pengerjaan
  var menit = Math.floor(waktuHabisDetik / 60);
  var detik = waktuHabisDetik % 60;
  var formatWaktu = menit + " menit " + detik + " detik";
  
  // Generate ID Unik dan Timestamp
  var idUnik = Utilities.getUuid();
  var timestamp = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
  
  // Cek sekali lagi untuk mencegah double submit
  var isSudahSubmit = false;
  var cekData = sheetNilai.getDataRange().getValues();
  for(var k=1; k<cekData.length; k++){
    if(cekData[k][2] == email) isSudahSubmit = true;
  }
  
  if(!isSudahSubmit) {
    // Simpan ke sheet: id, nama, email, nilai, tanggal_submit, waktu_pengerjaan, jawaban_benar, jawaban_salah
    // Kita gunakan JSON.stringify agar array tersimpan rapi sebagai teks di dalam cell Google Sheet
    sheetNilai.appendRow([
      idUnik, 
      nama, 
      email, 
      Math.round(nilaiAkhir), 
      timestamp, 
      formatWaktu,
      JSON.stringify(arrayBenar), // Contoh output: [["1","C"], ["3","A"]]
      JSON.stringify(arraySalah)  // Contoh output: [["2","B"], ["4","Tidak Dijawab"]]
    ]);
  }
  
  return Math.round(nilaiAkhir);
}
