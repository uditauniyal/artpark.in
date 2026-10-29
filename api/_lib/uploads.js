// Uploaded files arrive as base64 in the JSON body. The type is checked from the file's first bytes.
const MAX = 3 * 1024 * 1024;
const TYPES = {
  doc: [
    { kind: 'PDF', ext: '.pdf', test: (b) => b.subarray(0, 4).toString('latin1') === '%PDF' },
    { kind: 'DOCX', ext: '.docx', test: (b, name) => /\.docx$/i.test(name) && b.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])) },
  ],
  image: [
    { kind: 'JPG', ext: '.jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
    { kind: 'PNG', ext: '.png', test: (b) => b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])) },
    { kind: 'WEBP', ext: '.webp', test: (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP' },
  ],
};
const bad = (message) => Object.assign(new Error(message), { status: 400 });

function decodeUpload(upload, purpose) {
  if (!upload || typeof upload.name !== 'string' || typeof upload.data !== 'string') throw bad('An upload is missing its file.');
  const buffer = Buffer.from(upload.data, 'base64');
  if (buffer.length > MAX) throw bad(`"${upload.name}" is larger than 3 MB. Compress it, or upload it elsewhere and paste a link.`);
  const type = TYPES[purpose].find((t) => t.test(buffer, upload.name));
  if (!type) throw bad(purpose === 'doc' ? `"${upload.name}" is not a PDF or DOCX file.` : `"${upload.name}" is not a JPG, PNG or WebP image.`);
  return { buffer, ext: type.ext, kind: type.kind };
}

function safeName(name) {
  const ext = (String(name).match(/\.([a-z0-9]{1,5})$/i) || [, ''])[1].toLowerCase();
  const base = ext ? String(name).slice(0, -ext.length - 1) : String(name);
  const stem = base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80 - ext.length - 1).replace(/-$/, '') || 'file';
  return ext ? `${stem}.${ext}` : stem;
}

module.exports = { MAX, decodeUpload, safeName };
