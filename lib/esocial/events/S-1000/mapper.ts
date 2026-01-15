import { S1000Props } from './schema';

// Interface parcial para o que vem do banco
interface EmpresaDB {
  cnpj: string; // Pode ser CPF
  classificacao_tributaria: string;
  natureza_juridica?: string;
  ind_coop?: string; 
  ind_constr?: string;
  ind_des_folha?: string;
  ind_ent_ed?: boolean; 
  ind_ett?: boolean; 
  ind_prod_rural?: boolean;
  ind_pps?: boolean;
  ind_cpf?: boolean;
}

export function mapToS1000(empresa: EmpresaDB): S1000Props {
  const cleanDoc = empresa.cnpj.replace(/\D/g, '');
  const isCPF = cleanDoc.length === 11;
  const tpInsc = isCPF ? '2' : '1';

  const mapBooleanOrString = (val: string | boolean | undefined) => {
    if (typeof val === 'boolean') return val;
    return val === '1';
  };

  const props: S1000Props = {
    tpInsc,
    nrInsc: isCPF ? cleanDoc.substring(0, 11) : cleanDoc.substring(0, 14),
    classTrib: empresa.classificacao_tributaria,
    iniValid: new Date().toISOString().slice(0, 7), // AAAA-MM
    
    // Indicadores
    indCoop: mapBooleanOrString(empresa.ind_coop),
    indConstr: mapBooleanOrString(empresa.ind_constr),
    indDesFolha: mapBooleanOrString(empresa.ind_des_folha),
    indEntEd: !!empresa.ind_ent_ed,
    indEtt: !!empresa.ind_ett,
  };

  // Lógica condicional
  if (!isCPF && empresa.natureza_juridica) {
    props.natJurid = empresa.natureza_juridica.replace(/\D/g, '');
  }

  // Produtor Rural
  if (empresa.ind_prod_rural) {
    props.infoProdRural = {
      indPPS: empresa.ind_pps ? '1' : '0',
      indCPF: empresa.ind_cpf ? '1' : '0'
    };
  }

  return props;
}
