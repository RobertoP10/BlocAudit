-- Companies table
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  subscription_plan text not null default 'basic',
  request_counter bigint default 0,
  created_at timestamptz default now()
);

-- Associations table
create table associations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  monthly_request_limit int default 100,
  monthly_user_limit int default 100,
  created_at timestamptz default now()
);

-- Extended users table
create table app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  association_id uuid references associations(id) on delete set null,
  role text check (role in ('superadmin','admin','technical','service','client')) not null,
  full_name text,
  created_at timestamptz default now()
);

-- Requests table
create table requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  association_id uuid references associations(id) on delete cascade,
  created_by uuid references app_users(id) on delete set null,
  assigned_to uuid references app_users(id) on delete set null,
  status text check (status in ('pending','in_progress','completed')) default 'pending',
  description text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Signatures
create table signatures (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references requests(id) on delete cascade,
  user_id uuid references app_users(id) on delete cascade,
  role text,
  justification text,
  signature_image text,
  created_at timestamptz default now()
);

-- Exports
create table exports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  user_id uuid references app_users(id),
  format text check (format in ('csv','excel','pdf')),
  file_url text,
  created_at timestamptz default now()
);

-- Notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  user_id uuid references app_users(id),
  request_id uuid references requests(id),
  type text check (type in ('email','push','sms')),
  message text,
  created_at timestamptz default now()
);
