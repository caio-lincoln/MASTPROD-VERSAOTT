import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { 
    status, 
    headers: { ...corsHeaders, "Content-Type": "application/json" } 
  });
}

function bad(msg: string, status = 400) { return json({ error: msg }, status); }

function getBearer(req: Request) {
  const h = req.headers.get("Authorization") || "";
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m ? m[1] : null;
}

async function getRequesterId(userClient: ReturnType<typeof createClient>) {
  const { data, error } = await userClient.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

async function isAdmin(userClient: ReturnType<typeof createClient>, empresaId: string) {
  const { data, error } = await userClient.from("usuarios_empresas").select("role").eq("empresa_id", empresaId).maybeSingle();
  if (error) return false;
  return data?.role === "admin" || data?.role === "owner";
}

function getClients(token: string | null) {
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userClient = createClient(url, anon, { global: { headers: token ? { Authorization: `Bearer ${token}` } : {} }, auth: { persistSession: false, detectSessionInUrl: false } });
  const serviceClient = createClient(url, service, { auth: { persistSession: false, detectSessionInUrl: false } });
  return { userClient, serviceClient };
}

async function linkUser(req: Request) {
  const token = getBearer(req);
  const { userClient, serviceClient } = getClients(token);
  const body = await req.json();
  const { user_id, empresa_id, role } = body;
  if (!user_id || !empresa_id) return bad("user_id e empresa_id são obrigatórios");
  const requesterId = await getRequesterId(userClient);
  if (!requesterId) return bad("Usuário não autenticado", 401);
  const allowed = await isAdmin(userClient, empresa_id);
  if (!allowed) return bad("Permissão insuficiente", 403);
  const { error } = await serviceClient.rpc("link_user_to_company", { p_user_id: user_id, p_empresa_id: empresa_id, p_role: role ?? "user" });
  if (error) return bad(error.message, 500);
  return json({ success: true });
}

async function unlinkUser(req: Request) {
  const token = getBearer(req);
  const { userClient, serviceClient } = getClients(token);
  const body = await req.json();
  const { user_id, empresa_id } = body;
  if (!user_id || !empresa_id) return bad("user_id e empresa_id são obrigatórios");
  const requesterId = await getRequesterId(userClient);
  if (!requesterId) return bad("Usuário não autenticado", 401);
  const allowed = await isAdmin(userClient, empresa_id);
  if (!allowed) return bad("Permissão insuficiente", 403);
  const { error } = await serviceClient.rpc("unlink_user_from_company", { p_user_id: user_id, p_empresa_id: empresa_id });
  if (error) return bad(error.message, 500);
  return json({ success: true });
}

function decodeBase64(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function uploadDocument(req: Request) {
  const token = getBearer(req);
  const { userClient, serviceClient } = getClients(token);
  const body = await req.json();
  const { empresa_id, file_name, content_base64, content_type, tipo, categoria, versao, descricao, tags } = body;
  if (!empresa_id || !file_name || !content_base64) return bad("empresa_id, file_name e content_base64 são obrigatórios");
  const requesterId = await getRequesterId(userClient);
  if (!requesterId) return bad("Usuário não autenticado", 401);
  const { data: membership } = await userClient.from("usuarios_empresas").select("empresa_id").eq("empresa_id", empresa_id).maybeSingle();
  if (!membership) return bad("Usuário sem vínculo com a empresa", 403);
  const { data: pathData, error: pathErr } = await serviceClient.rpc("generate_storage_path", { empresa_id, nome_arquivo: file_name });
  if (pathErr) return bad(pathErr.message, 500);
  const path = pathData as string;
  const bytes = decodeBase64(content_base64);
  const up = await serviceClient.storage.from("documentos").upload(path, bytes, { contentType: content_type || "application/octet-stream" });
  if (up.error) return bad(up.error.message, 500);
  const { data: ins, error: insErr } = await serviceClient.rpc("criar_documento", {
    p_empresa_id: empresa_id,
    p_nome_arquivo: file_name,
    p_tipo: tipo ?? null,
    p_categoria: categoria ?? null,
    p_versao: versao ?? null,
    p_descricao: descricao ?? null,
    p_tamanho: bytes.length,
    p_enviado_por: requesterId,
    p_tags: tags ?? [],
    p_caminho_storage: path
  });
  if (insErr) return bad(insErr.message, 500);
  return json({ success: true, documento_id: ins });
}

async function createCompany(req: Request) {
  const token = getBearer(req);
  const { userClient, serviceClient } = getClients(token);
  const body = await req.json();
  const { razao_social, cnpj, cnae, atividade_principal, endereco, cidade, estado, telefone, email, responsavel, classificacao_tributaria, natureza_juridica, inicio_validade } = body;
  if (!razao_social || !cnpj) return bad("razao_social e cnpj são obrigatórios");
  const requesterId = await getRequesterId(userClient);
  if (!requesterId) return bad("Usuário não autenticado", 401);
  const { error } = await serviceClient.from("empresas").insert({
    razao_social, cnpj, cnae, atividade_principal, endereco, cidade, estado, telefone, email, responsavel,
    classificacao_tributaria, natureza_juridica, inicio_validade,
    origem: "manual", importada: false
  });
  if (error) return bad(error.message, 500);
  return json({ success: true });
}

async function deleteDocument(req: Request) {
  const token = getBearer(req);
  const { userClient, serviceClient } = getClients(token);
  const body = await req.json();
  const { document_id } = body;
  if (!document_id) return bad("document_id é obrigatório");
  const { data: doc, error } = await userClient.from("biblioteca_documentos").select("id, empresa_id, caminho_storage").eq("id", document_id).maybeSingle();
  if (error || !doc) return bad("Documento não encontrado", 404);
  const delObj = await serviceClient.storage.from("documentos").remove([doc.caminho_storage]);
  if (delObj.error) return bad(delObj.error.message, 500);
  const { error: delRow } = await userClient.from("biblioteca_documentos").delete().eq("id", document_id);
  if (delRow) return bad(delRow.message, 500);
  return json({ success: true });
}

async function deleteCompany(req: Request) {
  const token = getBearer(req);
  const { userClient, serviceClient } = getClients(token);
  const body = await req.json();
  const { empresa_id } = body;
  if (!empresa_id) return bad("empresa_id é obrigatório");
  const { data: empresa } = await userClient.from("empresas").select("id, origem, importada").eq("id", empresa_id).maybeSingle();
  if (!empresa || empresa.origem !== "manual" || empresa.importada) return bad("Empresa não elegível para exclusão", 403);
  const { error } = await serviceClient.from("empresas").delete().eq("id", empresa_id);
  if (error) return bad(error.message, 500);
  return json({ success: true });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url);
  // Use endsWith to handle Supabase path prefixing
  if (req.method === "POST" && url.pathname.endsWith("/link-user")) return await linkUser(req);
  if (req.method === "POST" && url.pathname.endsWith("/unlink-user")) return await unlinkUser(req);
  if (req.method === "POST" && url.pathname.endsWith("/upload-document")) return await uploadDocument(req);
  if (req.method === "POST" && url.pathname.endsWith("/delete-document")) return await deleteDocument(req);
  if (req.method === "POST" && url.pathname.endsWith("/create-company")) return await createCompany(req);
  if (req.method === "POST" && url.pathname.endsWith("/delete-company")) return await deleteCompany(req);
  
  return bad("Rota não encontrada: " + url.pathname, 404);
});
