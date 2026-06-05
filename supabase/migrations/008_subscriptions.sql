-- Migration 008: Abonnements (Subscriptions)

-- 1. Add subscription_plan column to schools table
alter table public.schools add column if not exists subscription_plan varchar(50) default 'Standard';

-- Update any existing schools to Standard just in case
update public.schools set subscription_plan = 'Standard' where subscription_plan is null;
