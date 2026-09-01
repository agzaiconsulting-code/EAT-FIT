-- =============================================
-- Eat&Fit — Eliminar OAuth, usuarios fijos con PIN
-- =============================================

-- Eliminar FK a auth.users (ya no usamos Supabase Auth)
alter table usuarios drop constraint if exists usuarios_id_fkey;

-- El id ahora es UUID autogenerado
alter table usuarios alter column id set default gen_random_uuid();

-- Email pasa a ser nullable (no se usa para login)
alter table usuarios alter column email drop not null;

-- Eliminar trigger de cierre de registro (ya no aplica)
drop trigger if exists trg_close_reg on usuarios;

-- Insertar usuarios fijos
insert into usuarios (id, email, nombre, pin_hash)
values
  (
    gen_random_uuid(),
    'adriangomez@eatfit.local',
    'adriangomez',
    '$2b$12$0hnr3tyqWP0RxhLludqgNOc3G5J4GL80l5ELHzTVBiutmzqWnkk0y'
  ),
  (
    gen_random_uuid(),
    'mariamartinez@eatfit.local',
    'mariamartinez',
    '$2b$12$Cii/hzb.8fb0mK7Cz8mVB.B4foAtPl3G8TgKpOg3ywoJnMpV8d1ua'
  )
on conflict (email) do nothing;

-- Cerrar registro permanentemente
update app_config set registro_cerrado = true where id = 1;
