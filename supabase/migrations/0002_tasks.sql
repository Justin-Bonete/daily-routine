-- Phase 1 / Tasks: adds reminders and validates recurrence values.
alter table public.tasks add column reminder_at timestamptz;
alter table public.tasks add constraint tasks_recurrence_check
  check (recurrence in ('daily', 'weekly', 'monthly'));
