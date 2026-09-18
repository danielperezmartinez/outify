alter table outify.image_cleanup add column process_after timestamptz not null default now(); alter table outify_dev.image_cleanup add column process_after timestamptz not null default now();
