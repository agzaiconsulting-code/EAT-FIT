-- =============================================
-- Eat&Fit — Schema inicial
-- =============================================

-- Config global (singleton)
create table if not exists app_config (
  id int primary key default 1,
  registro_cerrado boolean not null default false,
  constraint singleton check (id = 1)
);
insert into app_config (id, registro_cerrado) values (1, false)
  on conflict (id) do nothing;

-- Usuarios (extiende auth.users)
create table if not exists usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  nombre text not null,
  pin_hash text,                       -- null hasta completar setup-pin
  avatar_url text,
  push_subscription jsonb,             -- Web Push subscription object
  created_at timestamptz not null default now()
);

-- Trigger: cierra registro cuando 2 usuarios tienen PIN
create or replace function close_registration() returns trigger as $$
begin
  if (select count(*) from usuarios where pin_hash is not null) >= 2 then
    update app_config set registro_cerrado = true where id = 1;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_close_reg on usuarios;
create trigger trg_close_reg
  after insert or update of pin_hash on usuarios
  for each row execute function close_registration();

-- Registro diario
create table if not exists registros_diarios (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  fecha date not null,
  comida text check (comida in ('fit', 'fat')),   -- null = sin marcar
  gimnasio boolean not null default false,
  objetivo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (usuario_id, fecha)
);

-- Trigger: actualiza updated_at
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_registros_updated_at on registros_diarios;
create trigger trg_registros_updated_at
  before update on registros_diarios
  for each row execute function set_updated_at();

-- Deportes por día
create table if not exists deportes_dia (
  id uuid primary key default gen_random_uuid(),
  registro_id uuid not null references registros_diarios(id) on delete cascade,
  tipo text not null check (tipo in ('BodyPump', 'Spinning', 'Correr', 'Padel', 'Gym')),
  kms numeric check (tipo = 'Correr' or kms is null)
);

-- =============================================
-- Row Level Security
-- =============================================

alter table usuarios enable row level security;
alter table registros_diarios enable row level security;
alter table deportes_dia enable row level security;

-- Ambos usuarios pueden leer a ambos (para ver el calendario de la pareja)
create policy "usuarios: lectura para autenticados"
  on usuarios for select
  using (auth.uid() is not null);

create policy "registros: lectura para autenticados"
  on registros_diarios for select
  using (auth.uid() is not null);

create policy "registros: insertar propios"
  on registros_diarios for insert
  with check (usuario_id = auth.uid());

create policy "registros: actualizar propios"
  on registros_diarios for update
  using (usuario_id = auth.uid());

create policy "deportes: lectura para autenticados"
  on deportes_dia for select
  using (auth.uid() is not null);

create policy "deportes: mutación en registros propios"
  on deportes_dia for all
  using (
    exists (
      select 1 from registros_diarios r
      where r.id = registro_id and r.usuario_id = auth.uid()
    )
  );

-- Nota: las APIs del servidor usan service_role (bypass RLS) para simplicidad.
-- Las políticas anteriores sirven como defensa en profundidad si alguien
-- accede directamente con el anon key.
