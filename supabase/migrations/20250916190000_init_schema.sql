-- Initial schema for BlocAudit (second dump)

create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  association_id uuid references associations(id) on delete cascade,
  user_id uuid references app_users(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  association_id uuid references associations(id) on delete cascade,
  message text not null,
  severity text check (severity in ('info','warning','critical')),
  created_at timestamptz default now()
);

create table if not exists exports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  association_id uuid references associations(id) on delete cascade,
  format text not null check (format in ('csv','excel','pdf')),
  created_at timestamptz default now()
);
