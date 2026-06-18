
# CI Status

[![CI](https://github.com/CleitonMenegat/Whatsapp/actions/workflows/ci.yml/badge.svg)](https://github.com/CleitonMenegat/Whatsapp/actions/workflows/ci.yml)
[![Latest workflow run](https://img.shields.io/github/actions/workflow/status/CleitonMenegat/Whatsapp/ci.yml?branch=main&label=workflow&logo=github&style=flat-square)](https://github.com/CleitonMenegat/Whatsapp/actions/workflows/ci.yml)
[![Coverage Status](https://codecov.io/gh/CleitonMenegat/Whatsapp/branch/main/graph/badge.svg)](https://codecov.io/gh/CleitonMenegat/Whatsapp)


# Revitalize / Whatsapp (Projeto)

Resumo

Este repositório contém uma base para a plataforma SaaS "Revitalize": front-end React + TypeScript (Vite) e um backend Node.js/Express simples. Foram adicionados scripts e artefatos para facilitar a preparação do ambiente, orquestração com Docker e documentação técnica.

Arquivos importantes adicionados sem necessidade de executar installs:

- REVITALIZE.md — resumo do produto e módulos
- setup.ps1 — script PowerShell para preparação do ambiente no Windows
- docker/ — Dockerfiles para frontend e backend
- docker-compose.yml — orquestração local
- .github/workflows/ci.yml — pipeline CI básico
- .env.example — variáveis de ambiente de exemplo
- openapi.yaml — especificação básica da API (OpenAPI 3.0)
- db/schema.sql — esquema inicial do banco de dados
- api_examples.md — exemplos curl para testar endpoints

Como rodar (duas opções)

1) Ambiente local (Node.js)
- Instale Node.js LTS: https://nodejs.org/
- No PowerShell (na raiz do projeto):
  - powershell -ExecutionPolicy Bypass -File .\setup.ps1
  - npm run server   # inicia backend
  - npm run dev      # inicia frontend (Vite)

2) Usando Docker
- Instale Docker Desktop
- docker-compose up --build

Banco de dados

O projeto inclui db/schema.sql com um modelo inicial. Ajuste conforme o banco escolhido (SQLite / Postgres / MySQL).

API

openapi.yaml contém a especificação mínima para os endpoints principais (auth, instances, messages, campaigns, contacts). Use ferramentas como Swagger UI ou Postman para importar.

Próximos passos que posso executar (sem precisar de ferramentas no seu PC):

- Gerar stubs de rotas Express (TS) com validação e controladores (arquivos prontos para instalar dependências)
- Gerar migrations/seeders SQL mais detalhados
- Criar README detalhado ou documentação de deployment

Deseja que eu gere stubs de API em Express (TypeScript) prontos para instalar dependências no outro computador? Responda Sim ou Não.

