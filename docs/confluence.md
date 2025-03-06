# API de Usuários - Documentação Técnica

## Visão Geral
Este documento descreve a implementação de uma API RESTful para gerenciamento de usuários utilizando NestJS, Prisma ORM e SQLite. A API fornece endpoints para operações CRUD (Create, Read, Update, Delete) de usuários, com validação de dados e tratamento de erros.

## Tecnologias Utilizadas
- **Framework**: NestJS
- **ORM**: Prisma
- **Banco de Dados**: SQLite
- **Validação**: class-validator
- **Documentação**: Swagger/OpenAPI
- **Linguagem**: TypeScript

## Estrutura do Projeto
```
src/
├── common/                 # Componentes compartilhados
│   ├── constants/         # Constantes e mensagens
│   ├── decorators/       # Decoradores personalizados
│   └── services/         # Serviços comuns
├── prisma/               # Configuração do Prisma
├── users/                # Módulo de usuários
│   ├── dto/             # Objetos de transferência de dados
│   ├── interfaces/      # Interfaces
│   └── repositories/    # Repositórios
└── main.ts              # Ponto de entrada da aplicação
```

## Modelo de Dados
### Usuário (User)
| Campo           | Tipo     | Descrição                    | Obrigatório |
|----------------|----------|------------------------------|-------------|
| id             | number   | Identificador único          | Sim         |
| full_name      | string   | Nome completo                | Sim         |
| birth_date     | string   | Data de nascimento           | Sim         |
| email          | string   | Email (único)                | Sim         |
| phone_number   | string   | Número de telefone           | Sim         |
| address1       | string   | Endereço linha 1             | Sim         |
| address2       | string   | Endereço linha 2             | Não         |
| address3       | string   | Endereço linha 3             | Não         |
| address4       | string   | Endereço linha 4             | Não         |
| cpf            | string   | CPF (único)                  | Sim         |
| status         | string   | Status do usuário            | Sim         |
| user_type      | string   | Tipo do usuário             | Sim         |
| brand          | string   | Marca                        | Sim         |

## Endpoints da API

### 1. Criar Usuário
- **Método**: POST
- **Endpoint**: `/users`
- **Payload**:
```json
{
    "full_name": "João Silva",
    "birth_date": "2010-05-15T00:00:00Z",
    "email": "joao.silva@example.com",
    "phone_number": "+55 11 91234-5678",
    "address1": "Rua Ibirajá",
    "address2": "N90",
    "address3": "São Paulo",
    "address4": "SP",
    "cpf": "529.982.247-25",
    "user_type": "primary",
    "brand": "marca-x"
}
```

### 2. Buscar Todos os Usuários
- **Método**: GET
- **Endpoint**: `/users`

### 3. Buscar Usuário por ID
- **Método**: GET
- **Endpoint**: `/users/{id}`

### 4. Atualizar Usuário
- **Método**: PATCH
- **Endpoint**: `/users/{id}`
- **Payload**: Similar ao criar usuário, mas todos os campos são opcionais

### 5. Remover Usuário
- **Método**: DELETE
- **Endpoint**: `/users/{id}`

## Validações

### CPF
- Formato válido (XXX.XXX.XXX-XX)
- Validação de dígitos verificadores
- Não permite números repetidos

### Telefone
- Formato: +55 XX XXXXX-XXXX
- Validação via regex

### Email
- Formato válido de email
- Único no sistema

### Endereço
- address1 é obrigatório (mínimo 2 caracteres)
- address2, address3 e address4 são opcionais

## Tratamento de Erros
A API implementa um tratamento de erros centralizado que retorna respostas padronizadas:

```json
{
    "statusCode": 400,
    "message": ["mensagem de erro detalhada"],
    "error": "Bad Request"
}
```

## Configuração do Ambiente

### Pré-requisitos
- Node.js (v14 ou superior)
- npm ou yarn

### Instalação
1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```
3. Configure o arquivo .env:
```env
DATABASE_URL="file:./dev.db"
```
4. Execute as migrações do Prisma:
```bash
npx prisma migrate dev
```
5. Inicie o servidor:
```bash
npm run start:dev
```

## Testes
A aplicação inclui testes unitários e de integração:
```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

## Documentação da API
A documentação completa da API está disponível via Swagger UI em:
```
http://localhost:3000/api
```

## Boas Práticas Implementadas
1. **Validação de Dados**: Uso extensivo de decoradores do class-validator
2. **Tratamento de Erros**: Sistema centralizado de tratamento de erros
3. **Tipagem**: TypeScript com tipos estritos
4. **Documentação**: Swagger com descrições detalhadas
5. **Arquitetura**: Padrão Repository para acesso a dados
6. **Clean Code**: Código limpo e bem organizado
7. **SOLID**: Princípios SOLID aplicados na estrutura do projeto

## Considerações de Segurança
1. Validação rigorosa de entrada de dados
2. Sanitização de dados
3. Proteção contra injeção de SQL via Prisma
4. Campos sensíveis com validação específica (CPF, email)

## Monitoramento e Logs
- Logs de erro detalhados
- Rastreamento de requisições
- Métricas de performance via NestJS

## Manutenção
Para manter o projeto:
1. Atualize as dependências regularmente
2. Execute os testes antes de deploy
3. Mantenha o schema do Prisma sincronizado
4. Verifique os logs de erro periodicamente

## Contato e Suporte
Para questões técnicas ou suporte:
- Email: [seu-email@exemplo.com]
- GitHub: [link-do-repositório]
