create or replace function public.get_all_admins()
returns table (
  user_id uuid,
  email varchar,
  school_id uuid,
  school_name varchar,
  subscription_plan varchar,
  created_at timestamptz
)
security definer
language sql
as $$
  select 
    u.id as user_id,
    u.email::varchar,
    s.id as school_id,
    s.name::varchar as school_name,
    s.subscription_plan::varchar as subscription_plan,
    u.created_at
  from auth.users u
  left join public.school_admins sa on sa.user_id = u.id
  left join public.schools s on s.id = sa.school_id;
$$;
