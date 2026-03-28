alter table profile_views
  add column accept_language text,
  add column country text,
  add column region text,
  add column city text,
  add column raw_ip text,
  add column headers jsonb;
