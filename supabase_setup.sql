-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Table
create table if not exists users (
  id uuid default uuid_generate_v4() primary key,
  wallet_address text unique not null,
  level int default 1,
  xp int default 0,
  streak int default 0,
  voting_power int default 0,
  votes_count int default 0,
  global_rank int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Proposals Table
create table if not exists proposals (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  status text check (status in ('active', 'closed', 'pending')) default 'active',
  participants int default 0,
  end_date timestamp with time zone not null,
  created_by uuid references users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Proposal Options Table
create table if not exists proposal_options (
  id uuid default uuid_generate_v4() primary key,
  proposal_id uuid references proposals(id) on delete cascade not null,
  option_number int not null,
  title text not null,
  description text,
  allocation text,
  percentage text,
  votes int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Votes Table
create table if not exists votes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) not null,
  proposal_id uuid references proposals(id) not null,
  option_id uuid references proposal_options(id) not null,
  tx_hash text,
  voted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, proposal_id)
);

-- RPC Functions

-- increment_option_votes
create or replace function increment_option_votes(option_id uuid)
returns void as $$
begin
  update proposal_options
  set votes = votes + 1
  where id = option_id;
end;
$$ language plpgsql;

-- increment_proposal_participants
create or replace function increment_proposal_participants(proposal_id uuid)
returns void as $$
begin
  update proposals
  set participants = participants + 1
  where id = proposal_id;
end;
$$ language plpgsql;

-- increment_user_votes
create or replace function increment_user_votes(user_id uuid)
returns void as $$
begin
  update users
  set votes_count = votes_count + 1
  where id = user_id;
end;
$$ language plpgsql;

-- Enable Row Level Security (RLS)
alter table users enable row level security;
alter table proposals enable row level security;
alter table proposal_options enable row level security;
alter table votes enable row level security;

-- Create Policies (For development/demo purposes, allowing public access)
-- WARNING: In a real production app, you would want stricter policies based on authentication.
-- Since we are using a "simulated" wallet auth, we'll allow public access for now.

drop policy if exists "Allow public select on users" on users;
create policy "Allow public select on users" on users for select using (true);

drop policy if exists "Allow public insert on users" on users;
create policy "Allow public insert on users" on users for insert with check (true);

drop policy if exists "Allow public update on users" on users;
create policy "Allow public update on users" on users for update using (true);

drop policy if exists "Allow public select on proposals" on proposals;
create policy "Allow public select on proposals" on proposals for select using (true);

drop policy if exists "Allow public insert on proposals" on proposals;
create policy "Allow public insert on proposals" on proposals for insert with check (true);

drop policy if exists "Allow public select on proposal_options" on proposal_options;
create policy "Allow public select on proposal_options" on proposal_options for select using (true);

drop policy if exists "Allow public insert on proposal_options" on proposal_options;
create policy "Allow public insert on proposal_options" on proposal_options for insert with check (true);

drop policy if exists "Allow public update on proposal_options" on proposal_options;
create policy "Allow public update on proposal_options" on proposal_options for update using (true);

drop policy if exists "Allow public select on votes" on votes;
create policy "Allow public select on votes" on votes for select using (true);

drop policy if exists "Allow public insert on votes" on votes;
create policy "Allow public insert on votes" on votes for insert with check (true);

-- Insert some dummy data for proposals if table is empty
insert into proposals (title, description, status, participants, end_date, created_at, updated_at)
select 
  'Treasury Allocation Q4 2024', 
  'Vote on the distribution of the community treasury for the upcoming quarter. This proposal aims to balance development funding with community rewards.', 
  'active', 
  1542, 
  now() + interval '3 days',
  now(),
  now()
where not exists (select 1 from proposals limit 1);

-- Insert options for the dummy proposal (assuming the ID we just inserted, but we can't easily get it in a simple script without PL/pgSQL block. 
-- Users might need to add options manually or we can use a more complex script. 
-- For now, let's skip auto-inserting options to avoid complexity and errors.)
