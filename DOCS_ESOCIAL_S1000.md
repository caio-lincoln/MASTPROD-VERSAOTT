# Engenharia do Fluxo eSocial: Evento S-1000

Este documento técnico descreve a arquitetura, o ciclo de vida e as regras de implementação do evento S-1000 (Informações do Empregador/Contribuinte) no sistema MASTPROD.

---

## 1. Visão Geral da Arquitetura

O sistema adota uma arquitetura em camadas estritas para garantir conformidade com o Manual de Orientação do eSocial (MOS) e robustez na transmissão.

### Diagrama de Fluxo de Dados

```mermaid
graph LR
    DB[(Supabase)] -->|1. Raw Data| Mapper
    Mapper -->|2. Typed Props| Validator
    Validator -->|3. Valid Props| Builder
    Builder -->|4. XML (Unsigned)| Storage
    Storage -->|5. Transmission| Gateway
    Gateway -->|6. Signing| Signer
    Signer -->|7. SOAP Envelope| eSocial_Gov
```

---

## 2. Componentes e Responsabilidades

### A. Mapper (`lib/esocial/events/S-1000/mapper.ts`)
Responsável por converter o modelo relacional do banco de dados para o modelo de objeto do eSocial (`S1000Props`).

*   **Regra de Inscrição (CNPJ/CPF):**
    *   Detecta automaticamente se é CPF (11 dígitos) ou CNPJ.
    *   **Regra de Ouro (CNPJ):** Por padrão, utiliza os **8 primeiros dígitos** (CNPJ Raiz) para o campo `nrInsc`.
    *   **Exceção:** Para Naturezas Jurídicas específicas (101-5, 104-0, 107-4, 116-3, 134-1), utiliza o **CNPJ Completo (14 dígitos)**.

### B. Validator (`lib/esocial/events/S-1000/validator.ts`)
Implementa o padrão *Fail-Fast*. Antes de gerar qualquer XML, valida as regras de negócio:
*   Obrigatoriedade de campos (ex: `classTrib`).
*   Coerência (ex: CPF não pode ter Natureza Jurídica).
*   Formato de datas (`AAAA-MM`).

### C. Builder (`lib/esocial/events/S-1000/builder.ts`)
Motor de geração do XML. Implementa a construção do ID e da estrutura hierárquica.

#### Padrão de Geração do ID (Corrigido)
O ID do evento segue estritamente a concatenação dos dados reais do evento, sem padding artificial, garantindo unicidade e rastreabilidade:

**Formato:** `ID + tpInsc + nrInsc + Timestamp + Sequencial`

| Componente | Tamanho | Descrição |
|:--- |:--- |:--- |
| **ID** | 2 chars | Literal fixo "ID" |
| **tpInsc** | 1 char | `1` (CNPJ) ou `2` (CPF) |
| **nrInsc** | **8, 11 ou 14** | Valor exato usado na tag `<nrInsc>` (Raiz, CPF ou Completo) |
| **Timestamp** | 14 chars | `AAAAMMDDHHMMSS` (UTC) |
| **Seq** | 5 chars | Sequencial numérico aleatório/incremental |

> **Nota:** Diferente do padrão genérico de 36 caracteres fixos, este ID se adapta ao tamanho real da inscrição (CNPJ Raiz vs Completo), conforme requisitos do projeto.

### D. Gateway de Transmissão (`lib/esocial/transmission/gateway.ts`)
Atua como um *Smart Proxy* para o envio:
1.  **Seleção de Rota:** Decide entre Edge Functions ou API Node.js.
2.  **Normalização de URL:** Garante chamadas absolutas para evitar erros de *fetch* (SSR/CSR).
3.  **Fallback:** Gerencia retentativas em caso de falha de rede.

---

## 3. Pipeline de Transmissão (Backend)

O processo de envio (`app/api/esocial/transmit/route.ts`) é transacional e atômico:

1.  **Autenticação do Certificado:**
    *   O certificado A1 (.pfx) é recuperado do banco e decriptado em memória (RAM) apenas no momento do uso.
    *   Nunca é salvo em disco temporário.

2.  **Assinatura Digital (XMLDSig):**
    *   O XML gerado pelo *Builder* é assinado digitalmente.
    *   Algoritmo: `RSA-SHA256`.
    *   Transformação: `Enveloped Signature` + Canonicalização (`C14N`).

3.  **Envelopamento SOAP:**
    *   O evento assinado é inserido em um lote (`envioLoteEventos`).
    *   Este lote é inserido no corpo SOAP 1.1.
    *   **Segurança:** A conexão com o governo usa mTLS (Mutual TLS), apresentando o certificado do cliente.

4.  **Tratamento de Retorno:**
    *   O sistema faz o parse da resposta SOAP.
    *   Identifica `protocolo` (sucesso) ou `erros` (ocorrências).
    *   Atualiza o status no banco de dados (`enviado`, `erro`, `rejeitado`).

---

## 4. Checklist de Engenharia

Para manutenção ou evolução deste módulo, siga este checklist:

- [ ] **Sempre** validar regras no `Validator` antes de mexer no `Builder`.
- [ ] **Nunca** alterar a lógica de 8 vs 14 dígitos do CNPJ sem consultar as Notas Técnicas (Tabela de Naturezas Jurídicas).
- [ ] **Monitorar** logs do Gateway para erros de conexão (`Failed to fetch`), que geralmente indicam problemas de rota/DNS no ambiente servidor.
- [ ] **Testar** a geração do ID para garantir que o `nrInsc` do ID bate com o `nrInsc` da tag XML.
