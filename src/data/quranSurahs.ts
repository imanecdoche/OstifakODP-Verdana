export interface QuranSurah {
  number: number;
  name: string;
  arabicName: string;
  totalAyat: number;
  startPage: number;
  endPage: number;
  juz: number;
}

export const QURAN_SURAHS: QuranSurah[] = [
  { number: 1, name: "Al-Fatihah", arabicName: "الفاتحة", totalAyat: 7, startPage: 1, endPage: 1, juz: 1 },
  { number: 2, name: "Al-Baqarah", arabicName: "البقرة", totalAyat: 286, startPage: 2, endPage: 49, juz: 1 },
  { number: 3, name: "Ali 'Imran", arabicName: "آل عمران", totalAyat: 200, startPage: 50, endPage: 76, juz: 3 },
  { number: 4, name: "An-Nisa'", arabicName: "النساء", totalAyat: 176, startPage: 77, endPage: 106, juz: 4 },
  { number: 5, name: "Al-Ma'idah", arabicName: "المائدة", totalAyat: 120, startPage: 106, endPage: 127, juz: 6 },
  { number: 6, name: "Al-An'am", arabicName: "الأنعام", totalAyat: 165, startPage: 128, endPage: 150, juz: 7 },
  { number: 7, name: "Al-A'raf", arabicName: "الأعراف", totalAyat: 206, startPage: 151, endPage: 176, juz: 8 },
  { number: 8, name: "Al-Anfal", arabicName: "الأنفال", totalAyat: 75, startPage: 177, endPage: 186, juz: 9 },
  { number: 9, name: "At-Taubah", arabicName: "التوبة", totalAyat: 129, startPage: 187, endPage: 207, juz: 10 },
  { number: 10, name: "Yunus", arabicName: "يونس", totalAyat: 109, startPage: 208, endPage: 221, juz: 11 },
  { number: 11, name: "Hud", arabicName: "هود", totalAyat: 123, startPage: 221, endPage: 235, juz: 11 },
  { number: 12, name: "Yusuf", arabicName: "يوسف", totalAyat: 111, startPage: 235, endPage: 248, juz: 12 },
  { number: 13, name: "Ar-Ra'd", arabicName: "الرعد", totalAyat: 43, startPage: 249, endPage: 255, juz: 13 },
  { number: 14, name: "Ibrahim", arabicName: "إبراهيم", totalAyat: 52, startPage: 255, endPage: 261, juz: 13 },
  { number: 15, name: "Al-Hijr", arabicName: "الحجر", totalAyat: 99, startPage: 262, endPage: 267, juz: 14 },
  { number: 16, name: "An-Nahl", arabicName: "النحل", totalAyat: 128, startPage: 267, endPage: 281, juz: 14 },
  { number: 17, name: "Al-Isra'", arabicName: "الإسراء", totalAyat: 111, startPage: 282, endPage: 293, juz: 15 },
  { number: 18, name: "Al-Kahf", arabicName: "الكهف", totalAyat: 110, startPage: 293, endPage: 304, juz: 15 },
  { number: 19, name: "Maryam", arabicName: "مريم", totalAyat: 98, startPage: 305, endPage: 312, juz: 16 },
  { number: 20, name: "Ta-Ha", arabicName: "طه", totalAyat: 135, startPage: 312, endPage: 321, juz: 16 },
  { number: 21, name: "Al-Anbiya'", arabicName: "الأنبياء", totalAyat: 112, startPage: 322, endPage: 331, juz: 17 },
  { number: 22, name: "Al-Hajj", arabicName: "الحج", totalAyat: 78, startPage: 332, endPage: 341, juz: 17 },
  { number: 23, name: "Al-Mu'minun", arabicName: "المؤمنون", totalAyat: 118, startPage: 342, endPage: 349, juz: 18 },
  { number: 24, name: "An-Nur", arabicName: "النور", totalAyat: 64, startPage: 350, endPage: 359, juz: 18 },
  { number: 25, name: "Al-Furqan", arabicName: "الفرقان", totalAyat: 77, startPage: 359, endPage: 366, juz: 18 },
  { number: 26, name: "Asy-Syu'ara'", arabicName: "الشعراء", totalAyat: 227, startPage: 367, endPage: 376, juz: 19 },
  { number: 27, name: "An-Naml", arabicName: "النمل", totalAyat: 93, startPage: 377, endPage: 385, juz: 19 },
  { number: 28, name: "Al-Qasas", arabicName: "القصص", totalAyat: 88, startPage: 385, endPage: 396, juz: 20 },
  { number: 29, name: "Al-'Ankabut", arabicName: "العنكبوت", totalAyat: 69, startPage: 396, endPage: 404, juz: 20 },
  { number: 30, name: "Ar-Rum", arabicName: "الروم", totalAyat: 60, startPage: 404, endPage: 410, juz: 21 },
  { number: 31, name: "Luqman", arabicName: "لقمان", totalAyat: 34, startPage: 411, endPage: 414, juz: 21 },
  { number: 32, name: "As-Sajdah", arabicName: "السجدة", totalAyat: 30, startPage: 415, endPage: 417, juz: 21 },
  { number: 33, name: "Al-Ahzab", arabicName: "الأحزاب", totalAyat: 73, startPage: 418, endPage: 427, juz: 21 },
  { number: 34, name: "Saba'", arabicName: "سبأ", totalAyat: 54, startPage: 428, endPage: 434, juz: 22 },
  { number: 35, name: "Fatir", arabicName: "فاطر", totalAyat: 45, startPage: 434, endPage: 440, juz: 22 },
  { number: 36, name: "Ya-Sin", arabicName: "يس", totalAyat: 83, startPage: 440, endPage: 445, juz: 22 },
  { number: 37, name: "As-Saffat", arabicName: "الصافات", totalAyat: 182, startPage: 446, endPage: 452, juz: 23 },
  { number: 38, name: "Sad", arabicName: "ص", totalAyat: 88, startPage: 453, endPage: 458, juz: 23 },
  { number: 39, name: "Az-Zumar", arabicName: "الزمر", totalAyat: 75, startPage: 458, endPage: 467, juz: 23 },
  { number: 40, name: "Ghafir", arabicName: "غافر", totalAyat: 85, startPage: 467, endPage: 476, juz: 24 },
  { number: 41, name: "Fussilat", arabicName: "فصلت", totalAyat: 54, startPage: 477, endPage: 482, juz: 24 },
  { number: 42, name: "Asy-Syura", arabicName: "الشورى", totalAyat: 53, startPage: 483, endPage: 489, juz: 25 },
  { number: 43, name: "Az-Zukhruf", arabicName: "الزخرف", totalAyat: 89, startPage: 489, endPage: 495, juz: 25 },
  { number: 44, name: "Ad-Dukhan", arabicName: "الدخان", totalAyat: 59, startPage: 496, endPage: 498, juz: 25 },
  { number: 45, name: "Al-Jasiyah", arabicName: "الجاثية", totalAyat: 37, startPage: 499, endPage: 502, juz: 25 },
  { number: 46, name: "Al-Ahqaf", arabicName: "الأحقاف", totalAyat: 35, startPage: 502, endPage: 506, juz: 26 },
  { number: 47, name: "Muhammad", arabicName: "محمد", totalAyat: 38, startPage: 507, endPage: 510, juz: 26 },
  { number: 48, name: "Al-Fath", arabicName: "الفتح", totalAyat: 29, startPage: 511, endPage: 515, juz: 26 },
  { number: 49, name: "Al-Hujurat", arabicName: "الحجرات", totalAyat: 18, startPage: 515, endPage: 517, juz: 26 },
  { number: 50, name: "Qaf", arabicName: "ق", totalAyat: 45, startPage: 518, endPage: 520, juz: 26 },
  { number: 51, name: "Az-Zariyat", arabicName: "الذاريات", totalAyat: 60, startPage: 520, endPage: 523, juz: 26 },
  { number: 52, name: "At-Tur", arabicName: "الطور", totalAyat: 49, startPage: 523, endPage: 525, juz: 27 },
  { number: 53, name: "An-Najm", arabicName: "النجم", totalAyat: 62, startPage: 526, endPage: 528, juz: 27 },
  { number: 54, name: "Al-Qamar", arabicName: "القمر", totalAyat: 55, startPage: 528, endPage: 531, juz: 27 },
  { number: 55, name: "Ar-Rahman", arabicName: "الرحمن", totalAyat: 78, startPage: 531, endPage: 534, juz: 27 },
  { number: 56, name: "Al-Waqi'ah", arabicName: "الواقعة", totalAyat: 96, startPage: 534, endPage: 537, juz: 27 },
  { number: 57, name: "Al-Hadid", arabicName: "الحديد", totalAyat: 29, startPage: 537, endPage: 541, juz: 27 },
  { number: 58, name: "Al-Mujadilah", arabicName: "المجادلة", totalAyat: 22, startPage: 542, endPage: 545, juz: 28 },
  { number: 59, name: "Al-Hasyr", arabicName: "الحشر", totalAyat: 24, startPage: 545, endPage: 548, juz: 28 },
  { number: 60, name: "Al-Mumtahanah", arabicName: "الممتحنة", totalAyat: 13, startPage: 549, endPage: 551, juz: 28 },
  { number: 61, name: "As-Saff", arabicName: "الصف", totalAyat: 14, startPage: 551, endPage: 552, juz: 28 },
  { number: 62, name: "Al-Jumu'ah", arabicName: "الجمعة", totalAyat: 11, startPage: 553, endPage: 554, juz: 28 },
  { number: 63, name: "Al-Munafiqun", arabicName: "المنافقون", totalAyat: 11, startPage: 554, endPage: 555, juz: 28 },
  { number: 64, name: "At-Taghabun", arabicName: "التغابن", totalAyat: 18, startPage: 556, endPage: 557, juz: 28 },
  { number: 65, name: "At-Talaq", arabicName: "الطلاق", totalAyat: 12, startPage: 558, endPage: 559, juz: 28 },
  { number: 66, name: "At-Tahrim", arabicName: "التحريم", totalAyat: 12, startPage: 560, endPage: 561, juz: 28 },
  { number: 67, name: "Al-Mulk", arabicName: "الملك", totalAyat: 30, startPage: 562, endPage: 564, juz: 29 },
  { number: 68, name: "Al-Qalam", arabicName: "القلم", totalAyat: 52, startPage: 564, endPage: 566, juz: 29 },
  { number: 69, name: "Al-Haqqah", arabicName: "الحاقة", totalAyat: 52, startPage: 566, endPage: 568, juz: 29 },
  { number: 70, name: "Al-Ma'arij", arabicName: "المعارج", totalAyat: 44, startPage: 568, endPage: 570, juz: 29 },
  { number: 71, name: "Nuh", arabicName: "نوح", totalAyat: 28, startPage: 570, endPage: 571, juz: 29 },
  { number: 72, name: "Al-Jinn", arabicName: "الجن", totalAyat: 28, startPage: 572, endPage: 573, juz: 29 },
  { number: 73, name: "Al-Muzzammil", arabicName: "المزمل", totalAyat: 20, startPage: 574, endPage: 575, juz: 29 },
  { number: 74, name: "Al-Muddassir", arabicName: "المدثر", totalAyat: 56, startPage: 575, endPage: 577, juz: 29 },
  { number: 75, name: "Al-Qiyamah", arabicName: "القيامة", totalAyat: 40, startPage: 577, endPage: 578, juz: 29 },
  { number: 76, name: "Al-Insan", arabicName: "الإنسان", totalAyat: 31, startPage: 578, endPage: 580, juz: 29 },
  { number: 77, name: "Al-Mursalat", arabicName: "المرسلات", totalAyat: 50, startPage: 580, endPage: 581, juz: 29 },
  { number: 78, name: "An-Naba'", arabicName: "النبأ", totalAyat: 40, startPage: 582, endPage: 583, juz: 30 },
  { number: 79, name: "An-Nazi'at", arabicName: "النازعات", totalAyat: 46, startPage: 583, endPage: 584, juz: 30 },
  { number: 80, name: "'Abasa", arabicName: "عبس", totalAyat: 42, startPage: 585, endPage: 586, juz: 30 },
  { number: 81, name: "At-Takwir", arabicName: "التكوير", totalAyat: 29, startPage: 586, endPage: 586, juz: 30 },
  { number: 82, name: "Al-Infitar", arabicName: "الانفطار", totalAyat: 19, startPage: 587, endPage: 587, juz: 30 },
  { number: 83, name: "Al-Mutaffifin", arabicName: "المطففين", totalAyat: 36, startPage: 587, endPage: 589, juz: 30 },
  { number: 84, name: "Al-Insyiqaq", arabicName: "الانشقاق", totalAyat: 25, startPage: 589, endPage: 590, juz: 30 },
  { number: 85, name: "Al-Buruj", arabicName: "البروج", totalAyat: 22, startPage: 590, endPage: 590, juz: 30 },
  { number: 86, name: "At-Tariq", arabicName: "الطارق", totalAyat: 17, startPage: 591, endPage: 591, juz: 30 },
  { number: 87, name: "Al-A'la", arabicName: "الأعلى", totalAyat: 19, startPage: 591, endPage: 592, juz: 30 },
  { number: 88, name: "Al-Ghasyiyah", arabicName: "الغاشية", totalAyat: 26, startPage: 592, endPage: 593, juz: 30 },
  { number: 89, name: "Al-Fajr", arabicName: "الفجر", totalAyat: 30, startPage: 593, endPage: 594, juz: 30 },
  { number: 90, name: "Al-Balad", arabicName: "البلد", totalAyat: 20, startPage: 594, endPage: 595, juz: 30 },
  { number: 91, name: "Asy-Syams", arabicName: "الشمس", totalAyat: 15, startPage: 595, endPage: 595, juz: 30 },
  { number: 92, name: "Al-Lail", arabicName: "الليل", totalAyat: 21, startPage: 595, endPage: 596, juz: 30 },
  { number: 93, name: "Ad-Duha", arabicName: "الضحى", totalAyat: 11, startPage: 596, endPage: 596, juz: 30 },
  { number: 94, name: "Asy-Syarh", arabicName: "الشرح", totalAyat: 8, startPage: 596, endPage: 596, juz: 30 },
  { number: 95, name: "At-Tin", arabicName: "التين", totalAyat: 8, startPage: 597, endPage: 597, juz: 30 },
  { number: 96, name: "Al-'Alaq", arabicName: "العلق", totalAyat: 19, startPage: 597, endPage: 598, juz: 30 },
  { number: 97, name: "Al-Qadr", arabicName: "القدر", totalAyat: 5, startPage: 598, endPage: 598, juz: 30 },
  { number: 98, name: "Al-Bayyinah", arabicName: "البينة", totalAyat: 8, startPage: 598, endPage: 599, juz: 30 },
  { number: 99, name: "Az-Zalzalah", arabicName: "الزلزلة", totalAyat: 8, startPage: 599, endPage: 599, juz: 30 },
  { number: 100, name: "Al-'Adiyat", arabicName: "العاديات", totalAyat: 11, startPage: 599, endPage: 600, juz: 30 },
  { number: 101, name: "Al-Qari'ah", arabicName: "القارعة", totalAyat: 11, startPage: 600, endPage: 600, juz: 30 },
  { number: 102, name: "At-Takasur", arabicName: "التكاثر", totalAyat: 8, startPage: 600, endPage: 600, juz: 30 },
  { number: 103, name: "Al-'Asr", arabicName: "العصر", totalAyat: 3, startPage: 601, endPage: 601, juz: 30 },
  { number: 104, name: "Al-Humazah", arabicName: "الهمزة", totalAyat: 9, startPage: 601, endPage: 601, juz: 30 },
  { number: 105, name: "Al-Fil", arabicName: "الفيل", totalAyat: 5, startPage: 601, endPage: 601, juz: 30 },
  { number: 106, name: "Quraisy", arabicName: "قريش", totalAyat: 4, startPage: 602, endPage: 602, juz: 30 },
  { number: 107, name: "Al-Ma'un", arabicName: "الماعون", totalAyat: 7, startPage: 602, endPage: 602, juz: 30 },
  { number: 108, name: "Al-Kausar", arabicName: "الكوثر", totalAyat: 3, startPage: 602, endPage: 602, juz: 30 },
  { number: 109, name: "Al-Kafirun", arabicName: "الكافرون", totalAyat: 6, startPage: 603, endPage: 603, juz: 30 },
  { number: 110, name: "An-Nasr", arabicName: "النصر", totalAyat: 3, startPage: 603, endPage: 603, juz: 30 },
  { number: 111, name: "Al-Lahab", arabicName: "المسد", totalAyat: 5, startPage: 603, endPage: 603, juz: 30 },
  { number: 112, name: "Al-Ikhlas", arabicName: "الإخلاص", totalAyat: 4, startPage: 604, endPage: 604, juz: 30 },
  { number: 113, name: "Al-Falaq", arabicName: "الفلق", totalAyat: 5, startPage: 604, endPage: 604, juz: 30 },
  { number: 114, name: "An-Nas", arabicName: "الناس", totalAyat: 6, startPage: 604, endPage: 604, juz: 30 },
];

/**
 * Calculates Mushaf Kemenag standard pages based on surah and verse range.
 */
export function calculateQuranPages(
  surahNumber: number,
  fromAyat: number,
  toAyat: number
): { fromPage: number; toPage: number } {
  const surah = QURAN_SURAHS.find((s) => s.number === surahNumber);
  if (!surah) return { fromPage: 1, toPage: 1 };

  if (surah.startPage === surah.endPage) {
    return { fromPage: surah.startPage, toPage: surah.endPage };
  }

  const totalPagesInSurah = surah.endPage - surah.startPage + 1;
  const clampedFrom = Math.max(1, Math.min(fromAyat, surah.totalAyat));
  const clampedTo = Math.max(clampedFrom, Math.min(toAyat, surah.totalAyat));

  // Estimate proportional page offset
  const fromOffset = Math.floor(((clampedFrom - 1) / surah.totalAyat) * totalPagesInSurah);
  const toOffset = Math.floor(((clampedTo - 1) / surah.totalAyat) * totalPagesInSurah);

  const fromPage = Math.min(surah.endPage, surah.startPage + fromOffset);
  const toPage = Math.max(fromPage, Math.min(surah.endPage, surah.startPage + toOffset));

  return { fromPage, toPage };
}

/**
 * Returns the exact Quran Juz (1-30) for a given standard Mushaf page.
 */
export function getJuzFromPage(page: number): number {
  if (page <= 1) return 1;
  if (page >= 582) return 30;
  return Math.min(30, Math.max(1, Math.floor((page - 2) / 20) + 1));
}

/**
 * Returns formatted Juz string. If cross-juz (e.g. 1 and 2), returns '1-2'. If same, returns '1'.
 */
export function calculateJuzRange(fromPage: number, toPage: number): string {
  const startJuz = getJuzFromPage(fromPage);
  const endJuz = getJuzFromPage(toPage);
  if (startJuz === endJuz) {
    return `${startJuz}`;
  }
  return `${startJuz}-${endJuz}`;
}

