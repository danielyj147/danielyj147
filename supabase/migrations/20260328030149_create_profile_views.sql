create table profile_views (
  id bigint generated always as identity primary key,
  viewed_at timestamptz not null default now(),
  visitor_hash text,
  user_agent text,
  referer text
);

create index idx_profile_views_viewed_at on profile_views (viewed_at);
