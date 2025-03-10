# NestJS User Management CRUD API

Uma API REST completa para gerenciamento de usuários construída com NestJS, Prisma, MySQL, Redis e RabbitMQ.

## Tecnologias

- **Backend**: NestJS
- **ORM**: Prisma
- **Banco de Dados**: MySQL
- **Cache**: Redis
- **Message Broker**: RabbitMQ
- **Containerização**: Docker e Docker Compose
- **Cloud**: Google Cloud Platform (GCP)
- **IaC**: Terraform

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

## Configuração Local

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

## Deploy na Google Cloud Platform (GCP)

### Pré-requisitos

1. Conta GCP com billing ativado
2. [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) instalado
3. [Terraform](https://www.terraform.io/downloads.html) instalado

### Configuração do Ambiente GCP

1. Autentique-se no Google Cloud:
   ```bash
   gcloud auth login
   gcloud auth application-default login
   ```

2. Configure o projeto GCP:
   ```bash
   gcloud config set project SEU_PROJECT_ID
   ```

3. Habilite as APIs necessárias:
   ```bash
   gcloud services enable cloudrun.googleapis.com \
                         cloudbuild.googleapis.com \
                         sqladmin.googleapis.com \
                         redis.googleapis.com
   ```

### Deploy com Terraform

1. Inicialize o Terraform:
   ```bash
   terraform init
   ```

2. Configure as variáveis:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```
   Edite `terraform.tfvars` com seu Project ID:
   ```hcl
   project_id = "seu-project-id"
   region     = "us-central1"
   zone       = "us-central1-a"
   ```

3. Planeje e aplique a infraestrutura:
   ```bash
   terraform plan
   terraform apply
   ```

### Deploy da Aplicação

1. Construa a imagem Docker:
   ```bash
   docker build -t gcr.io/SEU_PROJECT_ID/nest-prisma-crud .
   ```

2. Faça push para o Google Container Registry:
   ```bash
   docker push gcr.io/SEU_PROJECT_ID/nest-prisma-crud
   ```

3. A aplicação será automaticamente implantada no Cloud Run através do Terraform.

### Recursos Criados na GCP

- **Cloud Run**: Serviço serverless para a API
- **Cloud SQL**: Instância MySQL para banco de dados
- **Memorystore**: Instância Redis para cache
- **IAM**: Permissões e roles necessários

### Variáveis de Ambiente na GCP

Configure as seguintes variáveis no Cloud Run:
- `DATABASE_URL`: Fornecido pelo Cloud SQL
- `REDIS_HOST`: Fornecido pelo Memorystore
- Outras variáveis conforme necessário

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