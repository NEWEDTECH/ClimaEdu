# TypeScript Coding Standards - ClimaEdu

## Regras Fundamentais de Tipagem

### ❌ PROIBIDO: Uso de `any`

**JAMAIS utilize o tipo `any` em qualquer situação no código TypeScript.**

#### Razões:
- Remove completamente a segurança de tipos do TypeScript
- Elimina o IntelliSense e autocomplete
- Impede a detecção de erros em tempo de compilação
- Quebra a arquitetura limpa e tipagem forte do projeto
- Dificulta manutenção e refatoração

#### ✅ Alternativas Corretas:

1. **Use tipos específicos das entidades:**
   ```typescript
   // ❌ ERRADO
   const submissions: any[] = [];
   
   // ✅ CORRETO
   const submissions: QuestionnaireSubmission[] = [];
   ```

2. **Use interfaces ou types customizados:**
   ```typescript
   // ❌ ERRADO
   const data: any = { id: '123', name: 'Test' };
   
   // ✅ CORRETO
   interface UserData {
     id: string;
     name: string;
   }
   const data: UserData = { id: '123', name: 'Test' };
   ```

3. **Use union types quando necessário:**
   ```typescript
   // ❌ ERRADO
   const value: any = getValueFromAPI();
   
   // ✅ CORRETO
   const value: string | number | null = getValueFromAPI();
   ```

4. **Use generics para flexibilidade:**
   ```typescript
   // ❌ ERRADO
   function processData(data: any): any {
     return data;
   }
   
   // ✅ CORRETO
   function processData<T>(data: T): T {
     return data;
   }
   ```

5. **Use `unknown` quando o tipo é realmente desconhecido:**
   ```typescript
   // ❌ ERRADO
   const apiResponse: any = await fetch('/api/data');
   
   // ✅ CORRETO
   const apiResponse: unknown = await fetch('/api/data');
   // Depois faça type guards para verificar o tipo
   ```

### Configuração ESLint

O projeto deve ter a regra ESLint configurada para bloquear `any`:

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-return": "error"
  }
}
```

### Processo de Code Review

- Qualquer PR com uso de `any` deve ser rejeitado imediatamente
- Revisar sempre se os tipos estão corretos e específicos
- Verificar se as entidades estão sendo importadas corretamente
- Garantir que as interfaces estão sendo utilizadas adequadamente

### Exemplos do Projeto ClimaEdu

#### ✅ Exemplo Correto - Relatórios:
```typescript
// Importar a entidade correta
import { QuestionnaireSubmission } from '../../../../content/core/entities/QuestionnaireSubmission';

// Usar o tipo específico
const allSubmissions: QuestionnaireSubmission[] = [];

// Filtrar com tipo correto
let filteredSubmissions = allSubmissions.filter((submission: QuestionnaireSubmission) => 
  studentIds.includes(submission.userId)
);
```

#### ❌ Exemplo Incorreto:
```typescript
// NUNCA fazer isso
const allSubmissions: any[] = [];
let filteredSubmissions = allSubmissions.filter((submission: any) => 
  studentIds.includes(submission.userId)
);
```

## Outras Regras de Tipagem

### Use readonly quando apropriado
```typescript
interface ReadonlyConfig {
  readonly apiUrl: string;
  readonly timeout: number;
}
```

### Prefira const assertions
```typescript
const colors = ['red', 'green', 'blue'] as const;
type Color = typeof colors[number]; // 'red' | 'green' | 'blue'
```

### Use type guards para verificações
```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}
```

## Conclusão

A tipagem forte é um dos pilares fundamentais do projeto ClimaEdu. O uso de `any` quebra completamente essa filosofia e deve ser evitado a todo custo. Sempre busque a tipagem mais específica e correta possível.
