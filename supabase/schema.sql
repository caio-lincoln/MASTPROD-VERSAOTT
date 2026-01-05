-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela Empresas
CREATE TABLE public.empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    razao_social TEXT NOT NULL,
    cnpj TEXT UNIQUE NOT NULL,
    cnae TEXT,
    status TEXT DEFAULT 'ativo',
    atividade_principal TEXT,
    endereco TEXT,
    cidade TEXT,
    estado TEXT,
    telefone TEXT,
    email TEXT,
    responsavel TEXT,
    origem TEXT CHECK (origem IN ('manual', 'esocial')) DEFAULT 'manual',
    importada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela Funcionários
CREATE TABLE public.funcionarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    data_nascimento DATE,
    email TEXT,
    telefone TEXT,
    cargo TEXT,
    departamento TEXT,
    data_admissao DATE,
    endereco TEXT,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela EPIs
CREATE TABLE public.epis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    tipo_protecao TEXT,
    certificado_aprovacao TEXT,
    fabricante TEXT,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    qtd_estoque INTEGER DEFAULT 0,
    qtd_minima INTEGER DEFAULT 0,
    validade DATE,
    descricao TEXT,
    status TEXT DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela Documentos (Biblioteca)
CREATE TABLE public.documentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_arquivo TEXT NOT NULL,
    tipo TEXT,
    categoria TEXT,
    versao TEXT,
    descricao TEXT,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    tamanho INTEGER, -- em bytes
    data_upload TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    enviado_por UUID REFERENCES auth.users(id),
    tags TEXT[],
    caminho_storage TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela Treinamentos
CREATE TABLE public.treinamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    status TEXT CHECK (status IN ('novo', 'iniciado', 'concluido', 'reagendado', 'cancelado')) DEFAULT 'novo',
    data_inicio TIMESTAMP WITH TIME ZONE,
    data_fim TIMESTAMP WITH TIME ZONE,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    funcionario_id UUID REFERENCES public.funcionarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela Riscos Ocupacionais
CREATE TABLE public.riscos_ocupacionais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_risco TEXT NOT NULL,
    severidade TEXT,
    tipo TEXT,
    probabilidade TEXT,
    descricao TEXT,
    fonte_geradora TEXT,
    consequencias TEXT,
    setor TEXT,
    medidas_controle TEXT,
    data_identificacao DATE DEFAULT CURRENT_DATE,
    responsavel TEXT,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'identificado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Vinculação Usuário-Empresa (para RLS)
CREATE TABLE public.user_empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- admin, member, viewer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, empresa_id)
);

-- Enable RLS
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treinamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riscos_ocupacionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_empresas ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Helper function to check if user has access to company
CREATE OR REPLACE FUNCTION public.has_company_access(company_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_empresas
    WHERE user_id = auth.uid() AND empresa_id = company_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Empresas Policies
CREATE POLICY "Users can view companies they belong to" ON public.empresas
    FOR SELECT USING (id IN (SELECT empresa_id FROM public.user_empresas WHERE user_id = auth.uid()));

-- Funcionarios Policies
CREATE POLICY "Users can view employees of their companies" ON public.funcionarios
    FOR SELECT USING (public.has_company_access(empresa_id));
CREATE POLICY "Users can insert employees to their companies" ON public.funcionarios
    FOR INSERT WITH CHECK (public.has_company_access(empresa_id));
CREATE POLICY "Users can update employees of their companies" ON public.funcionarios
    FOR UPDATE USING (public.has_company_access(empresa_id));
CREATE POLICY "Users can delete employees of their companies" ON public.funcionarios
    FOR DELETE USING (public.has_company_access(empresa_id));

-- EPIs Policies
CREATE POLICY "Users can view epis of their companies" ON public.epis
    FOR SELECT USING (public.has_company_access(empresa_id));
CREATE POLICY "Users can insert epis to their companies" ON public.epis
    FOR INSERT WITH CHECK (public.has_company_access(empresa_id));
CREATE POLICY "Users can update epis of their companies" ON public.epis
    FOR UPDATE USING (public.has_company_access(empresa_id));
CREATE POLICY "Users can delete epis of their companies" ON public.epis
    FOR DELETE USING (public.has_company_access(empresa_id));

-- Documentos Policies
CREATE POLICY "Users can view documents of their companies" ON public.documentos
    FOR SELECT USING (public.has_company_access(empresa_id));
CREATE POLICY "Users can insert documents to their companies" ON public.documentos
    FOR INSERT WITH CHECK (public.has_company_access(empresa_id));
CREATE POLICY "Users can update documents of their companies" ON public.documentos
    FOR UPDATE USING (public.has_company_access(empresa_id));
CREATE POLICY "Users can delete documents of their companies" ON public.documentos
    FOR DELETE USING (public.has_company_access(empresa_id));

-- Treinamentos Policies
CREATE POLICY "Users can view trainings of their companies" ON public.treinamentos
    FOR SELECT USING (public.has_company_access(empresa_id));
CREATE POLICY "Users can insert trainings to their companies" ON public.treinamentos
    FOR INSERT WITH CHECK (public.has_company_access(empresa_id));
CREATE POLICY "Users can update trainings of their companies" ON public.treinamentos
    FOR UPDATE USING (public.has_company_access(empresa_id));
CREATE POLICY "Users can delete trainings of their companies" ON public.treinamentos
    FOR DELETE USING (public.has_company_access(empresa_id));

-- Riscos Policies
CREATE POLICY "Users can view risks of their companies" ON public.riscos_ocupacionais
    FOR SELECT USING (public.has_company_access(empresa_id));
CREATE POLICY "Users can insert risks to their companies" ON public.riscos_ocupacionais
    FOR INSERT WITH CHECK (public.has_company_access(empresa_id));
CREATE POLICY "Users can update risks of their companies" ON public.riscos_ocupacionais
    FOR UPDATE USING (public.has_company_access(empresa_id));
CREATE POLICY "Users can delete risks of their companies" ON public.riscos_ocupacionais
    FOR DELETE USING (public.has_company_access(empresa_id));

-- User Empresas Policies (Allow users to see their own associations)
CREATE POLICY "Users can view their own company associations" ON public.user_empresas
    FOR SELECT USING (user_id = auth.uid());

-- Dashboard View
CREATE OR REPLACE VIEW public.dashboard_metricas_por_empresa AS
SELECT 
    e.id AS empresa_id,
    e.razao_social,
    COALESCE(count(DISTINCT f.id), 0) AS total_funcionarios,
    COALESCE(count(DISTINCT t.id) FILTER (WHERE t.status IN ('novo', 'iniciado', 'agendado')), 0) AS total_treinamentos_ativos,
    COALESCE(count(DISTINCT epi.id), 0) AS total_epis_cadastrados,
    COALESCE(count(DISTINCT r.id), 0) AS total_riscos_identificados
FROM 
    public.empresas e
LEFT JOIN 
    public.funcionarios f ON e.id = f.empresa_id AND f.status = 'ativo'
LEFT JOIN 
    public.treinamentos t ON e.id = t.empresa_id
LEFT JOIN 
    public.epis epi ON e.id = epi.empresa_id AND epi.status = 'ativo'
LEFT JOIN 
    public.riscos_ocupacionais r ON e.id = r.empresa_id
GROUP BY 
    e.id, e.razao_social;

-- Trigger to prevent editing imported companies
CREATE OR REPLACE FUNCTION check_company_import_status()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.importada = TRUE AND OLD.origem = 'esocial' THEN
        RAISE EXCEPTION 'Não é permitido editar ou excluir empresas importadas do eSocial.';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_imported_company_modification
BEFORE UPDATE OR DELETE ON public.empresas
FOR EACH ROW
EXECUTE FUNCTION check_company_import_status();

-- Storage Bucket Setup (This needs to be done via dashboard or API, but SQL can define RLS for storage.objects if bucket exists)
-- Assuming bucket 'library' exists:
-- insert into storage.buckets (id, name) values ('library', 'library');
-- POLICY for storage.objects
-- CREATE POLICY "Users can upload to library bucket" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'library' AND auth.role() = 'authenticated' );
-- CREATE POLICY "Users can view library bucket" ON storage.objects FOR SELECT USING ( bucket_id = 'library' AND auth.role() = 'authenticated' );
