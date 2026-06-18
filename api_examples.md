# Exemplos de uso da API (curl)

Autenticação

curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"senha"}'

Criar instância

curl -X POST http://localhost:3001/api/v1/instances \
  -H "Content-Type: application/json" \
  -d '{"name":"Instancia 1"}'

Obter QR code da instância (base64)

curl http://localhost:3001/api/v1/instances/1/qrcode

Enviar mensagem

curl -X POST http://localhost:3001/api/v1/messages/send \
  -H "Content-Type: application/json" \
  -d '{"instanceId":"1","to":"5511999999999","message":"Olá, {{nome}}"}'

Criar campanha

curl -X POST http://localhost:3001/api/v1/campaigns \
  -H "Content-Type: application/json" \
  -d '{"name":"Promoção","schedule":"2026-07-01T10:00:00Z"}'

Criar contato

curl -X POST http://localhost:3001/api/v1/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"João","phone":"5511999999999"}'
