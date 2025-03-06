# NestJS User Management CRUD API

Uma API REST completa para gerenciamento de usuários construída com NestJS, Prisma, MySQL, Redis e RabbitMQ.

## Tecnologias

- **Backend**: NestJS
- **ORM**: Prisma
- **Banco de Dados**: MySQL
- **Cache**: Redis
- **Message Broker**: RabbitMQ
- **Containerização**: Docker e Docker Compose

## Funcionalidades

- CRUD completo de usuários
- Busca case-insensitive por nome, email e CPF
- Cache de resultados com Redis
- Validação de dados
- Tratamento de erros global
- Documentação Swagger

## Estrutura do Projeto

```
src/
├── users/                 # Módulo de usuários
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── dto/
├── cache/                 # Módulo de cache
│   └── cache.service.ts
├── common/               # Código compartilhado
│   └── filters/
├── prisma/              # Configuração Prisma
│   └── schema.prisma
└── main.ts
```

## Configuração

1. Clone o repositório
2. Copie o arquivo de exemplo de ambiente:
   ```bash
   cp .env.example .env
   ```

3. Inicie os containers com Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. A API estará disponível em: `http://localhost:3001`
   - Swagger UI: `http://localhost:3001/api`

## Endpoints

### Usuários

- `POST /users` - Criar usuário
- `GET /users` - Listar todos usuários
- `GET /users/:id` - Buscar usuário por ID
- `GET /users/search?q=termo` - Buscar usuários
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário
- `DELETE /users/cache` - Limpar cache

### Modelo de Usuário

```typescript
{
  id: number
  fullName: string
  birthDate: Date
  email: string
  phoneNumber: string
  address1: string
  address2?: string
  address3?: string
  address4?: string
  cpf: string
  userType: string
  brand: string
  createdAt: Date
  updatedAt: Date
}
```

## Busca de Usuários

A funcionalidade de busca:
- É case-insensitive
- Procura em múltiplos campos (nome, email, CPF)
- Resultados são cacheados por 30 minutos
- Cache é invalidado automaticamente quando há alterações

## Validações

- Email único
- CPF único e válido
- Campos obrigatórios
- Formatos específicos (email, telefone, etc)

## Tratamento de Erros

- Erros de validação detalhados
- Tratamento de conflitos (registros duplicados)
- Respostas de erro padronizadas

## Cache

- Implementado com Redis
- Cache de buscas por 30 minutos
- Cache de usuários individuais por 1 hora
- Invalidação automática em atualizações

## Dependências Principais

```json
{
  "@nestjs/core": "latest",
  "@prisma/client": "latest",
  "class-validator": "latest",
  "ioredis": "latest",
  "@nestjs/event-emitter": "latest"
}
```

## Serviços Docker

- **API**: NestJS (porta 3001)
- **MySQL**: Banco de dados (porta 3306)
- **Redis**: Cache (porta 6379)
- **RabbitMQ**: Message Broker (portas 5672, 15672)

## Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.
#   n e s t - p r i s m a - c r u d  
 #   n e s t - p r i s m a - c r u d  
 