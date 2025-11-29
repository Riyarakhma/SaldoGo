 -- Schema untuk SaldoGo (Supabase Postgres)
create table if not exists accounts (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  balance numeric default 0,
  created_at timestamptz default now()
);

create table if not exists transactions (
  id uuid default gen_random_uuid() primary key,
  account_id uuid references accounts(id) on delete set null,
  title text not null,
  amount numeric not null,
  type text not null check (type in ('income', 'expense')),
  category text,
  note text,
  created_at timestamptz default now()
);