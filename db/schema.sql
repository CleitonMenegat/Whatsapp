-- Esquema inicial (SQLite compatível)

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS empresas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cnpj TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT,
  papel TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS instancias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  nome TEXT,
  status TEXT,
  qrcode TEXT,
  connected_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contatos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  nome TEXT,
  telefone TEXT,
  dados_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conversas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contato_id INTEGER,
  instancia_id INTEGER,
  ultimo_evento DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contato_id) REFERENCES contatos(id) ON DELETE CASCADE,
  FOREIGN KEY (instancia_id) REFERENCES instancias(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS mensagens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversa_id INTEGER,
  instancia_id INTEGER,
  tipo TEXT,
  conteudo TEXT,
  status TEXT,
  enviado_em DATETIME,
  recebido_em DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversa_id) REFERENCES conversas(id) ON DELETE CASCADE,
  FOREIGN KEY (instancia_id) REFERENCES instancias(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS campanhas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  nome TEXT,
  mensagem_padrao TEXT,
  agendada_para DATETIME,
  status TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS filadeenvio (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campanha_id INTEGER,
  contato_id INTEGER,
  tentativa INTEGER DEFAULT 0,
  status TEXT,
  scheduled_at DATETIME,
  sent_at DATETIME,
  FOREIGN KEY (campanha_id) REFERENCES campanhas(id) ON DELETE CASCADE,
  FOREIGN KEY (contato_id) REFERENCES contatos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nivel TEXT,
  origem TEXT,
  mensagem TEXT,
  dados TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS webhooks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER,
  url TEXT,
  eventos TEXT,
  ativo INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);
