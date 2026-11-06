// ─────────────────────────────────────────────────────────────
//  drive.js – a képek betöltése Google Drive mappákból
//  Az ügyfélnek csak a Drive mappákba kell képet tennie.
//  Beállítás: lásd beallitas-fejlesztonek.md
// ─────────────────────────────────────────────────────────────
const DRIVE = {
  apiKey: '',            // ← Google API kulcs (csak Drive API, domainre korlátozva)
  folders: {
    slides:    '1UlEHgZuQWMddQflxryRuQRAVAjp3cpUy',       // ← "Főoldal háttér" mappa ID-ja
    about:     '1fxDw686bphvlG52KjePc2mvZAqswO6TY',       // ← "Rólam" mappa ID-ja (az első képet használja)
    portfolio: ''        // ← "Portfólió" főmappa ID-ja (az almappák a kategóriák)
  }
};

const FOLDER_TYPE = 'application/vnd.google-apps.folder';
const isImage  = f => f.mimeType.startsWith('image/');
const isFolder = f => f.mimeType === FOLDER_TYPE;

// Egy mappa tartalmának lekérése (név szerint rendezve)
async function driveList(folderId) {
  const url = 'https://www.googleapis.com/drive/v3/files?' + new URLSearchParams({
    q: `'${folderId}' in parents and trashed = false`,
    key: DRIVE.apiKey,
    fields: 'files(id,name,mimeType)',
    orderBy: 'name',
    pageSize: 200
  });
  const res = await fetch(url);
  if (!res.ok) throw new Error('Drive hiba: ' + res.status);
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
