-- Add matricule and password for teachers

alter table public.teachers add column if not exists matricule varchar(50) unique;
alter table public.teachers add column if not exists password varchar(255) default 'passer123';

-- Update existing teachers to have a matricule
do $$
declare
    t record;
    counter integer := 1;
begin
    for t in select id from public.teachers where matricule is null loop
        update public.teachers 
        set matricule = 'PRF-2026-' || lpad(counter::text, 3, '0')
        where id = t.id;
        counter := counter + 1;
    end loop;
end;
$$;
