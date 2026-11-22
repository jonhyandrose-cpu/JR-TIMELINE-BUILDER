-- JR Timeline Builder · experiencia del cliente
-- Agrega campos para la nota del estudio y las respuestas de la pareja.
-- Solo agrega; no borra ni modifica datos existentes.

alter table public.wedding_timelines
  add column if not exists studio_note text,
  add column if not exists light_note text,
  add column if not exists client_status text,
  add column if not exists client_comment text,
  add column if not exists client_responded_at timestamptz,
  add column if not exists show_light_message boolean not null default true,
  add column if not exists client_view jsonb not null default '{}'::jsonb;

-- La pareja responde solo a través de esta función (no puede editar nada más).
create or replace function public.respond_timeline(p_slug text, p_status text, p_comment text default null)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare r public.wedding_timelines;
begin
  if p_status not in ('accepted','changes_requested','light_accepted','light_discuss') then
    raise exception 'invalid status';
  end if;
  update public.wedding_timelines
     set client_status = p_status,
         client_comment = left(nullif(trim(coalesce(p_comment,'')),''), 2000),
         client_responded_at = now()
   where public_slug = p_slug
   returning * into r;
  if r.id is null then raise exception 'not found'; end if;
  return json_build_object('status', r.client_status, 'at', r.client_responded_at);
end;
$$;
revoke all on function public.respond_timeline(text,text,text) from public;
grant execute on function public.respond_timeline(text,text,text) to anon, authenticated;

-- "Last updated" solo cambia cuando el estudio edita, no cuando la pareja responde.
create or replace function public.touch_wedding_timeline_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (to_jsonb(new) - array['client_status','client_comment','client_responded_at','updated_at'])
     is distinct from
     (to_jsonb(old) - array['client_status','client_comment','client_responded_at','updated_at']) then
    new.updated_at = now();
  else
    new.updated_at = old.updated_at;
  end if;
  return new;
end;
$$;
