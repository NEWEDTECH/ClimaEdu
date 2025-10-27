# API de Seed de Conquistas Padrão

Endpoint protegido para criar as conquistas padrão no Firestore em produção.

## Endpoint

```
POST /api/admin/seed-achievements
```

## Autenticação

O endpoint requer autenticação via Bearer Token no header `Authorization`.

```bash
Authorization: Bearer <ADMIN_SECRET_TOKEN>
```

## Variável de Ambiente Necessária

Adicione no painel da Vercel (Settings > Environment Variables):

```
ADMIN_SECRET_TOKEN=<seu-token-secreto-forte>
```

**⚠️ IMPORTANTE:** Gere um token forte e único para produção. Você pode gerar um usando:

```bash
openssl rand -base64 32
```

ou

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Uso

### 1. Criar conquistas (primeira vez)

```bash
curl -X POST https://sua-app.vercel.app/api/admin/seed-achievements \
  -H "Authorization: Bearer seu-token-secreto-aqui"
```

### 2. Forçar recriação de conquistas existentes

Se as conquistas já existem e você quer sobrescrevê-las:

```bash
curl -X POST "https://sua-app.vercel.app/api/admin/seed-achievements?force=true" \
  -H "Authorization: Bearer seu-token-secreto-aqui"
```

## Resposta de Sucesso (200)

```json
{
  "success": true,
  "message": "42 conquistas criadas com sucesso",
  "totalCreated": 42,
  "categories": [
    {
      "name": "Primeiros Passos",
      "count": 4
    },
    {
      "name": "Progresso",
      "count": 8
    },
    {
      "name": "Engajamento",
      "count": 7
    },
    {
      "name": "Excelência",
      "count": 8
    }
  ],
  "logs": [
    "--- Iniciando o seed de Conquistas Padrão ---",
    "Criando 42 conquistas padrão...",
    "- Conquista criada: \"Primeiro Passo\" (Primeiros Passos)",
    "..."
  ]
}
```

## Resposta quando conquistas já existem (200)

```json
{
  "success": false,
  "message": "Conquistas já existem",
  "logs": [
    "--- Iniciando o seed de Conquistas Padrão ---",
    "⚠️  Conquistas padrão já existem no banco de dados.",
    "Execução interrompida. Nenhuma alteração foi feita.",
    "Para sobrescrever, adicione ?force=true à URL."
  ]
}
```

## Resposta de Erro (401)

```json
{
  "error": "Não autorizado: token inválido ou ausente"
}
```

## Resposta de Erro (500)

```json
{
  "success": false,
  "error": "Erro ao criar conquistas",
  "message": "Detalhes do erro..."
}
```

## Fluxo de Uso em Produção

### Primeira vez (setup inicial)

1. **Configure a variável de ambiente na Vercel:**
   - Acesse o dashboard da Vercel
   - Vá em Settings > Environment Variables
   - Adicione `ADMIN_SECRET_TOKEN` com um valor seguro
   - Faça redeploy da aplicação

2. **Execute o seed:**
   ```bash
   curl -X POST https://sua-app.vercel.app/api/admin/seed-achievements \
     -H "Authorization: Bearer seu-token-secreto"
   ```

3. **Verifique os logs** da resposta para confirmar que as 42 conquistas foram criadas.

### Atualizar conquistas existentes

Se você modificar o código e quiser atualizar as conquistas em produção:

```bash
curl -X POST "https://sua-app.vercel.app/api/admin/seed-achievements?force=true" \
  -H "Authorization: Bearer seu-token-secreto"
```

## Conquistas Criadas

O endpoint cria **42 conquistas padrão** divididas em 4 categorias:

### Primeiros Passos (4)
- Primeiro Passo
- Primeiro Teste
- Bem-vindo(a)!
- Perfil Completo

### Progresso (8)
- Aprendiz
- Estudante Dedicado
- Leitor Assíduo
- Mestre do Conhecimento
- Graduado
- Especialista
- Expert Multidisciplinar
- Certificado de Mérito

### Engajamento (7)
- Estudante Consistente
- Maratonista do Saber
- Ritmo de Estudo
- Hábito Formado
- Explorador do Conhecimento
- Estudioso Dedicado
- Acadêmico Incansável

### Excelência (8)
- Nota Mil
- Perfeccionista
- Mestre da Precisão
- Respondedor Experiente
- Mestre dos Testes
- Colecionador de Certificados
- Profissional Certificado
- Explorador de Trilhas

## Segurança

- ✅ Endpoint protegido por token secreto
- ✅ Token deve ser configurado nas variáveis de ambiente da Vercel
- ✅ Nunca commite o token no código
- ✅ Use um token forte e único para produção
- ⚠️ Guarde o token em um local seguro (gerenciador de senhas)

## Desenvolvimento Local

Para testar localmente antes de usar em produção:

1. Configure `.env.local` com um token de teste:
   ```
   ADMIN_SECRET_TOKEN=test-token-for-local-dev
   ```

2. Inicie o servidor:
   ```bash
   yarn dev
   ```

3. Teste o endpoint:
   ```bash
   curl -X POST http://localhost:3000/api/admin/seed-achievements \
     -H "Authorization: Bearer test-token-for-local-dev"
   ```

## Logs na Vercel

Para visualizar os logs de execução na Vercel:
1. Acesse o dashboard da Vercel
2. Vá em "Logs" ou "Functions"
3. Procure pela execução da função `/api/admin/seed-achievements`
