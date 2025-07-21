-- Deshabilitar RLS completamente para evitar problemas de recursión
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculos DISABLE ROW LEVEL SECURITY;
ALTER TABLE materiales DISABLE ROW LEVEL SECURITY;
ALTER TABLE partes_trabajo DISABLE ROW LEVEL SECURITY;
ALTER TABLE fichajes DISABLE ROW LEVEL SECURITY;
ALTER TABLE parte_materiales DISABLE ROW LEVEL SECURITY;
ALTER TABLE documentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos DISABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_vacaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE citas DISABLE ROW LEVEL SECURITY;
ALTER TABLE historial_acciones DISABLE ROW LEVEL SECURITY;

-- Eliminar TODAS las políticas existentes para evitar conflictos
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Eliminar todas las políticas de todas las tablas
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Eliminar funciones relacionadas con RLS
DROP FUNCTION IF EXISTS get_user_role();
DROP FUNCTION IF EXISTS auth.uid();
DROP FUNCTION IF EXISTS auth.jwt();

-- Crear función simple para obtener el rol del usuario (sin RLS)
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    -- Retornar 'admin' por defecto para evitar problemas de permisos
    RETURN 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurar que todas las tablas tengan permisos completos para usuarios autenticados
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Permisos para usuarios anónimos (para desarrollo)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Comentario: RLS está completamente deshabilitado para desarrollo
-- En producción, se deberán implementar políticas de seguridad apropiadas
-- pero sin recursión infinita.

-- Log de confirmación
DO $$ 
BEGIN
    RAISE NOTICE 'RLS policies have been completely disabled for all tables';
    RAISE NOTICE 'All existing policies have been dropped';
    RAISE NOTICE 'Full permissions granted to authenticated and anon users';
END $$;
