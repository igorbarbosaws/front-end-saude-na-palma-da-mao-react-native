// Configuração central do app. Mesma API do front-end web.
export const API_URL = "https://backend-saude-na-palma-da-mao-express.onrender.com/api/v1";

export const SESSION_KEY = "spm_sessao";

// O back-end no Render (plano gratuito) "dorme" e a primeira chamada pode levar ~1 min.
export const REQUEST_TIMEOUT_MS = 70000;
export const SLOW_NOTICE_MS = 4000;

// data_hora é gravado como "timestamp" sem fuso e tratado como HORÁRIO DE PAREDE (ver core/datetime.js).
// Se um agendamento de teste aparecer deslocado, ajuste aqui (ex.: -180 ou 180 minutos).
export const DATAHORA_OFFSET_MIN = 0;
