// ─────────────────────────────────────────────────────────────
//  drive.js – a képek betöltése Google Drive mappákból
//  Az ügyfélnek csak a Drive mappákba kell képet tennie.
//  Beállítás: lásd beallitas-fejlesztonek.md
// ─────────────────────────────────────────────────────────────
const DRIVE = {
  apiKey: 'AIzaSyDHZmF7ZVsMYQvRmcuRpWagzhaDePYptPw',            // 
  folders: {
    slides:    '1UlEHgZuQWMddQflxryRuQRAVAjp3cpUy',       // ← "Főoldal háttér" mappa ID-ja
    about:     '1fxDw686bphvlG52KjePc2mvZAqswO6TY',       // ← "Rólam" mappa ID-ja (az első képet használja)
    portfolio: ''        // ← "Portfólió" főmappa ID-ja (az almappák a kategóriák)
  }
};

const FOLDER_TYPE = 'application/vnd.google-apps.folder';
const isImage  = f => f.mimeType.startsWith('image/');
const isFolder = f => f.mimeType === FOLDER_TYPE;
const isVideo  = f => f.mimeType.startsWith('video/');
const isMedia  = f => isImage(f) || isVideo(f);

// Egy mappa tartalmának lekérése (név szerint rendezve)
async function driveList(folderId) {
  const url = 'https://www.googleapis.com/drive/v3/files?' + new URLSearchParams({
    q: `'${folderId}' in parents and trashed = false`,
    key: DRIVE.apiKey,
    fields: 'files(id,name,mimeType,size)',
    orderBy: 'name',
    pageSize: 200
  });
  const res = await fetch(url);
  if (!res.ok) {
    // Részletes hiba (a drive-teszt.html ezt jeleníti meg érthetően)
    let reason = '', message = '';
    try {
      const j = await res.json();
      reason = (j.error.errors && j.error.errors[0] && j.error.errors[0].reason) || j.error.status || '';
      message = j.error.message || '';
    } catch (e) {}
    const err = new Error(`Drive hiba ${res.status}: ${reason} ${message}`);
    err.status = res.status; err.reason = reason; err.apiMessage = message;
    throw err;
  }
  return (await res.json()).files;
}

// Csak a képek egy mappából
async function driveImages(folderId) {
  return (await driveList(folderId)).filter(isImage);
}

// Kép URL-je a kívánt szélességben (a Drive méretezi, nem kell előre kicsinyíteni)
function driveImg(id, width = 1600) {
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`;
}

// Képek ÉS videók (mp4) egy mappából
async function driveMedia(folderId) {
  return (await driveList(folderId)).filter(isMedia);
}

// Videó URL-je (a Drive API közvetlenül streameli a fájlt)
function driveVideo(id) {
  return `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${DRIVE.apiKey}`;
}
