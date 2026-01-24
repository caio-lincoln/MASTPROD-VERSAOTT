export interface S1000InfoProdRural {
  indPPS: '0' | '1'; // Indicador de Contribuição Previdenciária: 0 - Não, 1 - Sim
  indCPF: '0' | '1'; // Indicador de aquisição de produção: 0 - Não, 1 - Sim
}

export interface S1000Props {
  // Identificação
  tpInsc: '1' | '2'; // 1 - CNPJ, 2 - CPF
  nrInsc: string;    // CNPJ base (8) ou completo (14) ou CPF (11)
  
  // Informações do Empregador
  classTrib: string; // Classificação Tributária
  natJurid?: string; // Uso Interno (Validação). NÃO vai para o XML S-1.2
  indOptRegEletron?: '0' | '1'; // Obrigatório no XSD: 0 ou 1
  
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
