export interface S1000InfoProdRural {
  indPPS: '0' | '1'; // Indicador de Contribuição Previdenciária: 0 - Não, 1 - Sim
  indCPF: '0' | '1'; // Indicador de aquisição de produção: 0 - Não, 1 - Sim
}

export interface S1000Props {
  // Identificação
  tpInsc: '1' | '2'; // 1 - CNPJ, 2 - CPF
  nrInsc: string;    // 14 ou 11 dígitos
  
  // Informações do Empregador
  classTrib: string; // Classificação Tributária
  natJurid?: string; // Obrigatório se tpInsc = 1
  
  // Indicadores
  indCoop?: boolean;
  indConstr?: boolean;
  indDesFolha?: boolean;
  indEntEd?: boolean;
  indEtt?: boolean;
  
  // Grupos Condicionais
  infoProdRural?: S1000InfoProdRural;
  
  // Validade
  iniValid: string; // AAAA-MM
  fimValid?: string; // AAAA-MM
}
