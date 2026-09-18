-- Conserva todos los esquemas expuestos comprobados antes del despliegue.
-- Solo añade la superficie pública de Outify; nunca sus esquemas privados.
alter role authenticator set pgrst.db_schemas = 'public,graphql_public,gift_card,nocendland,outify,outify_dev';
notify pgrst, 'reload config';
notify pgrst, 'reload schema';
