# Inventory Control API

API backend para controle de estoque B2B, criada para demonstrar domínio de autenticação, regras de negócio, persistência relacional, Docker, testes e documentação técnica em um contexto próximo de sistemas internos usados por empresas.

## Problema Resolvido

Empresas que controlam produtos manualmente perdem rastreabilidade sobre entradas, saídas, ajustes e níveis mínimos de estoque. Esta API centraliza o cadastro de produtos, fornecedores, categorias e movimentações, garantindo histórico das alterações e bloqueando operações inválidas, como saída maior que o saldo disponível.

## Resultado Entregue

O projeto entrega uma API REST com autenticação JWT, controle de acesso por perfil, CRUDs operacionais, movimentação de estoque, dashboard de indicadores e documentação Swagger. O ambiente é reproduzível com Docker Compose e PostgreSQL, com seed de demonstração para facilitar avaliação técnica.

## Como Foi Construído

- **NestJS + TypeScript** para arquitetura modular, controllers, services, guards e DTOs.
- **Prisma ORM** para modelagem relacional, migrations, seed e acesso tipado ao PostgreSQL.
- **PostgreSQL via Docker** para banco reproduzível em ambiente local.
- **JWT + bcrypt** para autenticação e proteção de senha.
- **Swagger** para documentação interativa dos endpoints.
- **Jest** para testes unitários e e2e.
- **GitHub Actions** para validação automática de build e testes.

## Funcionalidades

- Registro e login de usuários.
- Perfis de acesso: `ADMIN`, `MANAGER`, `OPERATOR`.
- Cadastro de categorias, fornecedores e produtos.
- Entrada, saída e ajuste manual de estoque.
- Histórico de movimentações por produto e usuário.
- Bloqueio de saída quando o estoque é insuficiente.
- Dashboard com total de produtos, fornecedores, estoque baixo, quantidade e valor em estoque.
- Health check com validação de conexão com banco.

## Regras de Negócio

- Toda alteração de estoque gera uma movimentação registrada.
- Saídas de estoque não podem exceder o saldo atual.
- Ajustes manuais registram estoque anterior e estoque resultante.
- Produtos com `currentStock <= minStock` são marcados como baixo estoque.
- Senhas são armazenadas apenas como hash.
- O campo `passwordHash` nunca é retornado pela API.

## Como Rodar

```bash
npm install
docker compose up -d db
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

Também é possível subir API e banco com Docker:

```bash
docker compose up -d api
```

## Acesso Demo

```text
Admin:
email: admin@demo.com
senha: Admin123!

Operador:
email: operador@demo.com
senha: Operador123!
```

## Endpoints Principais

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /users`
- `POST /categories`
- `GET /categories`
- `POST /suppliers`
- `GET /suppliers`
- `POST /products`
- `GET /products`
- `POST /stock-movements/in`
- `POST /stock-movements/out`
- `POST /stock-movements/adjust`
- `GET /stock-movements`
- `GET /dashboard/summary`
- `GET /health`

Swagger:

```text
http://localhost:3000/api/docs
```

## Testes

```bash
npm run build
npm test
npm run test:e2e
```

## Validação Realizada

- Build NestJS concluído com sucesso.
- Testes unitários passando.
- Teste e2e de health check passando.
- PostgreSQL subindo via Docker Compose.
- Migration inicial aplicada.
- Seed de dados demo executado.
- `GET /health` retornando API e banco como `ok`.
- Swagger disponível em `/api/docs`.
- Login demo validado com usuário `ADMIN`.
