# MASTPROD - Gestão de SST e eSocial

Next.js 16 + PostgreSQL. Login próprio (sessão em cookie), certificados A1 cifrados no banco e
transmissão de eventos eSocial (leiaute S-1.3) assinados no servidor.

## Rodar localmente

Pré-requisito: PostgreSQL instalado (os binários são procurados em `C:\Program Files\PostgreSQL\18\bin`
ou na variável `PG_BIN`).

```bash
cp .env.example .env.local   # preencha AUTH_SECRET, ESOCIAL_CERT_ENCRYPTION_KEY e o admin inicial
npm install
npm run db:init              # cria o cluster em .localdb/ (porta 5433) e o banco "mastprod"
npm run db:migrate           # aplica db/migrations/*.sql
npm run db:create-user       # cria o admin com SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
npm run dev
```

Depois de reiniciar o computador: `npm run db:start`.
Outros usuários: `npm run db:create-user -- email@dominio senha "Nome" user`
(`admin` vê todas as empresas; `user` só as vinculadas a ele).

## Deploy no Railway

1. Crie um projeto com um serviço **PostgreSQL** e um serviço apontando para este repositório.
2. No serviço do app, cadastre as variáveis do `.env.example`, com `DATABASE_URL=${{Postgres.DATABASE_URL}}`.
   Use a **mesma** `ESOCIAL_CERT_ENCRYPTION_KEY` do ambiente onde os certificados foram cadastrados.
3. O `railway.json` roda `npm run db:migrate` antes de cada deploy.
4. Crie o primeiro usuário uma vez: `railway run npm run db:create-user -- email senha "Nome" admin`.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `db/migrations/` | Schema do banco (SQL versionado) |
| `lib/server/` | Conexão, sessão, controle de acesso por empresa e API de dados |
| `lib/esocial/events/` | Builders/validadores de eventos (S-1000, S-2240) e regras comuns (Id, leiaute) |
| `lib/esocial/server/` | Geração do S-2240 a partir do banco, assinatura, envio e consulta |
| `app/api/` | Rotas: auth, dados, certificados, documentos e eSocial |
| `biblioteca/` | XSDs e WSDLs oficiais do eSocial |

## eSocial: o que o S-2240 exige

O S-2240 é rejeitado se o eSocial ainda não tiver o **S-1000** do empregador e o vínculo do trabalhador
(**S-2200**/S-2300), normalmente enviados pela folha/contabilidade. A **matrícula** informada no
cadastro do funcionário precisa ser idêntica à do S-2200. O ambiente (produção ou produção restrita) é
definido só pela variável `ESOCIAL_AMBIENTE` no servidor.
