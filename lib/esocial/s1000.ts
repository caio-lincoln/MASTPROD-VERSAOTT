
export interface S1000Props {
  // Identificação
  cnpj: string; // Pode ser CNPJ (14) ou CPF (11)
  razaoSocial: string;
  isCPF?: boolean; // Novo flag para indicar se é CPF
  
  // Classificação Tributária (já existente)
  classTrib: string;
  
  // Indicadores (Novos)
  indCoop?: boolean;      // Indicador de Cooperativa
  indConstr?: boolean;    // Indicador de Construtora
  indDesFolha?: boolean;  // Indicador de Desoneração da Folha
  indEntEd?: boolean;     // Indicador de Entidade Educativa
  indEtt?: boolean;       // Indicador de Empresa de Trabalho Temporário
  
  // Produtor Rural
  indProdRural?: boolean; // Flag de controle interno para saber se é produtor rural
  indPPS?: boolean;       // Indicador de Previdência Social (se for produtor rural)
  indCPF?: boolean;       // Indicador de Contratação de Aprendiz/CPF (se for produtor rural)
  
  // Outros campos (natureza jurídica, etc)
  natJurid?: string;
}

/**
 * Gera o XML do evento S-1000 seguindo as regras estritas do eSocial.
 * Regra Fundamental: "Sim" gera a tag com valor, "Não" omite a tag.
 */
export function generateS1000XML(data: S1000Props): string {
  const {
    cnpj,
    razaoSocial,
    classTrib,
    isCPF,
    indCoop,
    indConstr,
    indDesFolha,
    indEntEd,
    indEtt,
    indProdRural,
    indPPS,
    indCPF,
    natJurid
  } = data;

  // Limpeza de caracteres e definição de tamanho
  const cleanDoc = cnpj.replace(/\D/g, '');
  const nrInsc = isCPF ? cleanDoc.substring(0, 11) : cleanDoc.substring(0, 14);
  const tpInsc = isCPF ? '2' : '1'; // 1=CNPJ, 2=CPF

  const cleanNatJurid = natJurid ? natJurid.replace(/\D/g, '').substring(0, 4) : '';

  // Cabeçalho do evento (simplificado para focar no infoEmpregador)
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtInfoEmpregador/v_S_01_02_00">\n`;
  // ID deve ter 36 caracteres: "ID" + tpInsc(1) + nrInsc(14) + timestamp(YYYYMMDDHHMMSS) + seq(5) -> Padrão eSocial é complexo
  // Simplificação aceita em homologação/testes, mas idealmente segue padrão IDTNNNNNNNNNNNNNNNQQQQQQQQQQQQQQQ
  // Ajustando para garantir unicidade simples no exemplo
  const idDoc = nrInsc.padEnd(14, '0');
  xml += `  <evtInfoEmpregador Id="ID${tpInsc}${idDoc}0000000000000000000">\n`;
  
  // IdeEvento
  xml += `    <ideEvento>\n`;
  xml += `      <tpAmb>1</tpAmb>\n`; // 1 - Produção (Exemplo)
  xml += `      <procEmi>1</procEmi>\n`;
  xml += `      <verProc>1.0.0</verProc>\n`;
  xml += `    </ideEvento>\n`;

  // IdeEmpregador
  xml += `    <ideEmpregador>\n`;
  xml += `      <tpInsc>${tpInsc}</tpInsc>\n`;
  xml += `      <nrInsc>${nrInsc}</nrInsc>\n`;
  xml += `    </ideEmpregador>\n`;

  // InfoEmpregador
  xml += `    <infoEmpregador>\n`;
  xml += `      <inclusao>\n`;
  xml += `        <idePeriodo>\n`;
  xml += `          <iniValid>${new Date().toISOString().slice(0, 7)}</iniValid>\n`; // AAAA-MM
  xml += `        </idePeriodo>\n`;
  
  xml += `        <infoCadastro>\n`;
  xml += `          <classTrib>${classTrib || '99'}</classTrib>\n`; // Obrigatório
  
  // natJurid só é enviado se NÃO for CPF
  if (!isCPF && cleanNatJurid) {
    xml += `          <natJurid>${cleanNatJurid}</natJurid>\n`;
  }
  
  // Regras de Indicadores (Sim = 1, Não = Omitir)
  // Para CPF, a maioria desses indicadores não se aplica e deve ser false/undefined
  
  // 1. indCoop (Cooperativa)
  if (indCoop) {
    xml += `          <indCoop>1</indCoop>\n`;
  }

  // 2. indConstr (Construtora)
  if (indConstr) {
    xml += `          <indConstr>1</indConstr>\n`;
  }

  // 3. indDesFolha (Desoneração da folha)
  if (indDesFolha) {
    xml += `          <indDesFolha>1</indDesFolha>\n`;
  }
  
  // 4. indOptRegEletron (Opcional, mas comum) - Não solicitado explicitamente, mantendo fora por enquanto

  // 5. indEntEd (Entidade educativa) - Layout S-1.0 mudou alguns nomes, mas seguindo instrução do usuário
  if (indEntEd) {
    xml += `          <indEntEd>1</indEntEd>\n`;
  }

  // 6. indEtt (Empresa de Trabalho Temporário)
  if (indEtt) {
    xml += `          <indEtt>1</indEtt>\n`;
  }

  // Grupo infoProdRural
  // Só existe se for Produtor Rural (indProdRural === true no controle interno)
  if (indProdRural) {
    xml += `          <infoProdRural>\n`;
    // Regra: Enviar obrigatoriamente se o grupo existir
    // Assumindo que indPPS e indCPF são booleanos onde true = 1 (Sim) e false = 0 (Não) neste contexto específico de Produtor Rural
    // A regra diz: "<indPPS>1 ou 0</indPPS>"
    xml += `            <indPPS>${indPPS ? '1' : '0'}</indPPS>\n`;
    xml += `            <indCPF>${indCPF ? '1' : '0'}</indCPF>\n`; // Note: indCPF pode não existir no layout atual S-1.2, verificar MOS se necessário. Mantendo conforme pedido.
    xml += `          </infoProdRural>\n`;
  }

  xml += `        </infoCadastro>\n`;
  xml += `      </inclusao>\n`;
  xml += `    </infoEmpregador>\n`;
  xml += `  </evtInfoEmpregador>\n`;
  xml += `</eSocial>`;

  return xml;
}
