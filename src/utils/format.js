export const formatSize = bytes => {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes/1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb/1024;
  return `${mb.toFixed(2)} MB`;
};

export const isAllowedType = (type, name) => {
  const ext = (name.split(".").pop() || "").toLowerCase();
  const okExt = ["pdf","doc","docx","txt"];
  if (!okExt.includes(ext)) return false;
  // Some browsers report generic mime for doc/docx; allow by ext
  const okMime = ["application/pdf","text/plain","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  return okMime.includes(type) || okExt.includes(ext);
};