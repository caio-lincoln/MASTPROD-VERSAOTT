import { supabase } from '@/lib/supabaseClient';
import { mapToS1000 } from './mapper';
import { validateS1000 } from './validator';
import { buildS1000XML } from './builder';

export async function createS1000Event(companyId: string) {
  const { data: empresa, error } = await supabase
    .from('empresas')
    .select('*')
    .eq('id', companyId)
    .single();

  if (error || !empresa) {
    throw new Error('Empresa não encontrada ou erro ao buscar dados.');
  }

  const s1000Props = mapToS1000(empresa);

  const validationErrors = validateS1000(s1000Props);
  if (validationErrors.length > 0) {
    return {
      success: false,
      errors: validationErrors
    };
  }

  const xml = buildS1000XML(s1000Props);

  const { data: eventData, error: eventError } = await supabase
    .from('esocial_eventos')
    .insert({
      empresa_id: companyId,
      tipo_evento: 'S-1000',
      xml_envio: xml,
      status: 'pendente',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (eventError) {
    throw new Error(`Erro ao salvar evento: ${eventError.message}`);
  }

  return {
    success: true,
    xml,
    data: s1000Props,
    eventId: eventData.id
  };
}

export async function regenerateS1000XML(eventId: string) {
  const { data: eventRow, error: eventError } = await supabase
    .from('esocial_eventos')
    .select('id, empresa_id')
    .eq('id', eventId)
    .single();

  if (eventError || !eventRow || !eventRow.empresa_id) {
    throw new Error('Evento S-1000 não encontrado ou sem empresa vinculada.');
  }

  const { data: empresa, error } = await supabase
    .from('empresas')
    .select('*')
    .eq('id', eventRow.empresa_id)
    .single();

  if (error || !empresa) {
    throw new Error('Empresa não encontrada ou erro ao buscar dados.');
  }

  const s1000Props = mapToS1000(empresa);

  const validationErrors = validateS1000(s1000Props);
  if (validationErrors.length > 0) {
    return {
      success: false,
      errors: validationErrors
    };
  }

  const xml = buildS1000XML(s1000Props);

  const { error: updateError } = await supabase
    .from('esocial_eventos')
    .update({
      xml_envio: xml,
      status: 'pendente'
    })
    .eq('id', eventId);

  if (updateError) {
    throw new Error(`Erro ao atualizar evento S-1000: ${updateError.message}`);
  }

  return {
    success: true,
    xml,
    data: s1000Props
  };
}
