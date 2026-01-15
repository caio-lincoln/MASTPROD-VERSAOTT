# Evento S-1000 - Informações do Empregador

## Arquitetura
Este módulo implementa o evento S-1000 de forma isolada, seguindo o padrão modular do projeto.

### Estrutura
- `schema.ts`: Definição dos tipos e interfaces.
- `rules.ts`: Regras de negócio e constantes (MOS).
- `validator.ts`: Validações pré-envio (regras estritas).
- `mapper.ts`: Mapeamento DB -> Schema S-1000.
- `builder.ts`: Geração do XML.
- `index.ts`: Orquestração do fluxo.

## Origem dos Dados
Os dados são obtidos exclusivamente da tabela `empresas` do banco de dados. Nenhuma informação cadastral é solicitada manualmente durante a geração do evento, garantindo consistência.

### Mapeamento
- **tpInsc**: Derivado do CNPJ/CPF (14 chars = 1, 11 chars = 2).
- **natJurid**: Obrigatório para CNPJ, omitido para CPF.
- **Indicadores**: Booleanos no DB convertidos para tag presente (Sim) ou ausente (Não).
- **Produtor Rural**: Grupo `infoProdRural` gerado apenas se `ind_prod_rural` for verdadeiro.

## Regras de Validação
1. **Coerência de Inscrição**: CPF não pode ter Natureza Jurídica.
2. **Classificação Tributária**: Bloqueio padrão para código '99' (configurável em `rules.ts`).
3. **Campos Obrigatórios**: Validação rigorosa de nrInsc, classTrib, iniValid.

## Como Usar
```typescript
import { createS1000Event } from '@/lib/esocial/events/S-1000';

const result = await createS1000Event('uuid-da-empresa');

if (result.success) {
  console.log('XML Gerado:', result.xml);
} else {
  console.error('Erros:', result.errors);
}
```
