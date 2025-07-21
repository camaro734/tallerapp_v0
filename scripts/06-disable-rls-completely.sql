-- Script para deshabilitar completamente RLS y otorgar permisos totales
-- Versión 6: Eliminación agresiva de todas las políticas RLS

DO $$
DECLARE
    table_name text;
    policy_name text;
    policy_record record;
BEGIN
    -- Deshabilitar RLS en todas las tablas del esquema public
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', table_name);
            RAISE NOTICE 'RLS deshabilitado en tabla: %', table_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error deshabilitando RLS en tabla %: %', table_name, SQLERRM;
        END;
    END LOOP;

    -- Eliminar todas las políticas existentes
    FOR policy_record IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                policy_record.policyname, 
                policy_record.schemaname, 
                policy_record.tablename);
            RAISE NOTICE 'Política eliminada: % en tabla %', policy_record.policyname, policy_record.tablename;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error eliminando política % en tabla %: %', 
                policy_record.policyname, 
                policy_record.tablename, 
                SQLERRM;
        END;
    END LOOP;

    -- Otorgar permisos completos a todos los usuarios autenticados
    FOR table_name IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        BEGIN
            EXECUTE format('GRANT ALL ON %I TO authenticated', table_name);
            EXECUTE format('GRANT ALL ON %I TO anon', table_name);
            EXECUTE format('GRANT ALL ON %I TO service_role', table_name);
            RAISE NOTICE 'Permisos otorgados en tabla: %', table_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error otorgando permisos en tabla %: %', table_name, SQLERRM;
        END;
    END LOOP;

    -- Otorgar permisos en secuencias
    FOR table_name IN 
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public'
    LOOP
        BEGIN
            EXECUTE format('GRANT ALL ON SEQUENCE %I TO authenticated', table_name);
            EXECUTE format('GRANT ALL ON SEQUENCE %I TO anon', table_name);
            EXECUTE format('GRANT ALL ON SEQUENCE %I TO service_role', table_name);
            RAISE NOTICE 'Permisos de secuencia otorgados: %', table_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error otorgando permisos de secuencia %: %', table_name, SQLERRM;
        END;
    END LOOP;

    RAISE NOTICE 'Script completado: RLS completamente deshabilitado y permisos otorgados';
END $$;

-- Verificar el estado final
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT count(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) as policy_count
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
