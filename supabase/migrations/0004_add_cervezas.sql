alter table registros_diarios
  add column if not exists cervezas integer not null default 0;
