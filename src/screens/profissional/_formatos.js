// Pequenos formatadores do módulo do profissional.
// "2026-10-25" -> "25/10/2026"
export const dataBR = (iso) => String(iso ?? "").split("-").reverse().join("/");

export const maiuscula = (t) => t.charAt(0).toUpperCase() + t.slice(1);

// "0830" -> "08:30" (máscara de digitação do campo de hora)
export function formatarHoraDigitada(v) {
  const d = String(v ?? "").replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d;
}

// "08:30" válido? (hora 00-23, minuto 00-59)
export const horaValida = (t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

export const emMinutos = (t) => {
  const [hh, mm] = t.split(":").map(Number);
  return hh * 60 + mm;
};

// "2026-10-25" a partir de um Date local
export const isoLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
