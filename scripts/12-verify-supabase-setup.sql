-- Script para verificar y completar la configuración de Supabase
-- Este script verifica que todas las tablas estén creadas y configuradas correctamente

-- Verificar que todas las tablas existen
DO $$
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY[
        'usuarios', 'clientes', 'vehiculos', 'materiales', 
        'partes_trabajo', 'fichajes', 'parte_materiales', 
        'documentos', 'presupuestos', 'solicitudes_vacaciones', 
        'citas', 'historial_acciones'
    ];
    table_name TEXT;
BEGIN
    RAISE NOTICE 'Verificando configuración de Supabase...';
    
    -- Contar tablas existentes
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = ANY(expected_tables);
    
    RAISE NOTICE 'Tablas encontradas: % de %', table_count, array_length(expected_tables, 1);
    
    -- Listar tablas faltantes
    FOR table_name IN 
        SELECT unnest(expected_tables)
        EXCEPT
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public'
    LOOP
        RAISE NOTICE 'Tabla faltante: %', table_name;
    END LOOP;
    
    -- Verificar RLS está deshabilitado
    RAISE NOTICE 'Verificando estado de RLS...';
    FOR table_name IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' AND rowsecurity = true
    LOOP
        RAISE NOTICE 'ADVERTENCIA: RLS habilitado en tabla: %', table_name;
    END LOOP;
    
    RAISE NOTICE 'Verificación completada.';
END $$;

-- Asegurar que todas las tablas tienen los permisos correctos
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Verificar datos de ejemplo
SELECT 'usuarios' as tabla, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'vehiculos', COUNT(*) FROM vehiculos
UNION ALL
SELECT 'materiales', COUNT(*) FROM materiales
UNION ALL
SELECT 'partes_trabajo', COUNT(*) FROM partes_trabajo
UNION ALL
SELECT 'fichajes', COUNT(*) FROM fichajes
UNION ALL
SELECT 'citas', COUNT(*) FROM citas
ORDER BY tabla;
