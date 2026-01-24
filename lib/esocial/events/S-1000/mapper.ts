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
  ind_opt_reg_eletron?: string;
}

export function mapToS1000(empresa: EmpresaDB): S1000Props {
  const cleanDoc = empresa.cnpj.replace(/\D/g, '');
  const isCPF = cleanDoc.length === 11;
  const tpInsc = isCPF ? '2' : '1';
  const natJuridClean = empresa.natureza_juridica
    ? empresa.natureza_juridica.replace(/\D/g, '')
    : undefined;

  let nrInsc: string;
  if (isCPF) {
    nrInsc = cleanDoc.substring(0, 11);
  } else {
    const natJuridFullCnpj = ['1015', '1040', '1074', '1163', '1341'];
    if (natJuridClean && natJuridFullCnpj.includes(natJuridClean)) {
      nrInsc = cleanDoc.substring(0, 14);
    } else {
      nrInsc = cleanDoc.substring(0, 8);
    }
  }

  const mapBooleanOrString = (val: string | boolean | undefined) => {
    if (typeof val === 'boolean') return val;
    return val === '1';
  };

  const props: S1000Props = {
    tpInsc,
    nrInsc,
    classTrib: empresa.classificacao_tributaria,
    iniValid: new Date().toISOString().slice(0, 7), // AAAA-MM
    
    // Indicadores
    indCoop: mapBooleanOrString(empresa.ind_coop),
    indConstr: mapBooleanOrString(empresa.ind_constr),
    indDesFolha: mapBooleanOrString(empresa.ind_des_folha),
    indEntEd: !!empresa.ind_ent_ed,
    indEtt: !!empresa.ind_ett,
  };

  if (empresa.ind_opt_reg_eletron === '0' || empresa.ind_opt_reg_eletron === '1') {
    props.indOptRegEletron = empresa.ind_opt_reg_eletron;
  }

  // Lógica condicional
  if (!isCPF && natJuridClean) {
    props.natJurid = natJuridClean;
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
