-- Add missing columns to partes_trabajo table
-- This script adds all the missing columns that are referenced in the application

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add cliente_nombre column for direct client names
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partes_trabajo' AND column_name = 'cliente_nombre') THEN
        ALTER TABLE partes_trabajo ADD COLUMN cliente_nombre VARCHAR(255);
    END IF;

    -- Add vehiculo columns for direct vehicle info
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partes_trabajo' AND column_name = 'vehiculo_matricula') THEN
        ALTER TABLE partes_trabajo ADD COLUMN vehiculo_matricula VARCHAR(20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partes_trabajo' AND column_name = 'vehiculo_marca') THEN
        ALTER TABLE partes_trabajo ADD COLUMN vehiculo_marca VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partes_trabajo' AND column_name = 'vehiculo_modelo') THEN
        ALTER TABLE partes_trabajo ADD COLUMN vehiculo_modelo VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partes_trabajo' AND column_name = 'vehiculo_serie') THEN
        ALTER TABLE partes_trabajo ADD COLUMN vehiculo_serie VARCHAR(100);
    END IF;

    -- Add numero_parte column for unique part numbers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partes_trabajo' AND column_name = 'numero_parte') THEN
        ALTER TABLE partes_trabajo ADD COLUMN numero_parte VARCHAR(50) UNIQUE;
    END IF;

    -- Add created_by column to track who created the part
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partes_trabajo' AND column_name = 'created_by') THEN
        ALTER TABLE partes_trabajo ADD COLUMN created_by UUID REFERENCES usuarios(id);
    END IF;

    -- Add validation and signature columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partes_trabajo' AND column_name = 'validado') THEN
        ALTER TABLE partes_trabajo ADD COLUMN validado BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partes_trabajo' AND column_name = 'fecha_validacion') THEN
        ALTER TABLE partes_trabajo ADD COLUMN fecha_validacion TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partes_trabajo' AND column_name = 'validado_por') THEN
        ALTER TABLE partes_trabajo ADD COLUMN validado_por UUID REFERENCES usuarios(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partes_trabajo' AND column_name = 'firma_cliente') THEN
        ALTER TABLE partes_trabajo ADD COLUMN firma_cliente TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partes_trabajo' AND column_name = 'fecha_firma') THEN
        ALTER TABLE partes_trabajo ADD COLUMN fecha_firma TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add billing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partes_trabajo' AND column_name = 'horas_facturables') THEN
        ALTER TABLE partes_trabajo ADD COLUMN horas_facturables DECIMAL(5,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partes_trabajo' AND column_name = 'materiales_utilizados') THEN
        ALTER TABLE partes_trabajo ADD COLUMN materiales_utilizados JSONB;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partes_trabajo' AND column_name = 'descripcion_materiales') THEN
        ALTER TABLE partes_trabajo ADD COLUMN descripcion_materiales TEXT;
    END IF;

    -- Add work tracking columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partes_trabajo' AND column_name = 'trabajo_realizado') THEN
        ALTER TABLE partes_trabajo ADD COLUMN trabajo_realizado TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partes_trabajo' AND column_name = 'fecha_fin') THEN
        ALTER TABLE partes_trabajo ADD COLUMN fecha_fin TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'partes_trabajo' AND column_name = 'ubicacion') THEN
        ALTER TABLE partes_trabajo ADD COLUMN ubicacion VARCHAR(100);
    END IF;
END $$;

-- Update existing constraints to handle new enum values
DO $$
BEGIN
    -- Drop existing check constraints if they exist
    IF EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'partes_trabajo_estado_check') THEN
        ALTER TABLE partes_trabajo DROP CONSTRAINT partes_trabajo_estado_check;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'partes_trabajo_prioridad_check') THEN
        ALTER TABLE partes_trabajo DROP CONSTRAINT partes_trabajo_prioridad_check;
    END IF;

    -- Add updated check constraints
    ALTER TABLE partes_trabajo ADD CONSTRAINT partes_trabajo_estado_check 
        CHECK (estado IN ('pendiente', 'en_curso', 'completado', 'cancelado'));

    ALTER TABLE partes_trabajo ADD CONSTRAINT partes_trabajo_prioridad_check 
        CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente'));

    -- Add constraint for tipo_trabajo
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'partes_trabajo_tipo_trabajo_check') THEN
        ALTER TABLE partes_trabajo ADD CONSTRAINT partes_trabajo_tipo_trabajo_check 
            CHECK (tipo_trabajo IN ('mantenimiento', 'reparacion', 'revision', 'instalacion', 'diagnostico', 'emergencia', 'garantia', 'otro'));
    END IF;
END $$;

-- Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_partes_trabajo_numero_parte ON partes_trabajo(numero_parte);
CREATE INDEX IF NOT EXISTS idx_partes_trabajo_cliente_nombre ON partes_trabajo(cliente_nombre);
CREATE INDEX IF NOT EXISTS idx_partes_trabajo_vehiculo_matricula ON partes_trabajo(vehiculo_matricula);
CREATE INDEX IF NOT EXISTS idx_partes_trabajo_created_by ON partes_trabajo(created_by);
CREATE INDEX IF NOT EXISTS idx_partes_trabajo_validado ON partes_trabajo(validado);
CREATE INDEX IF NOT EXISTS idx_partes_trabajo_estado_fecha ON partes_trabajo(estado, created_at);
CREATE INDEX IF NOT EXISTS idx_partes_trabajo_prioridad ON partes_trabajo(prioridad);

-- Disable RLS on partes_trabajo table
ALTER TABLE partes_trabajo DISABLE ROW LEVEL SECURITY;

-- Update existing records with numero_parte if they don't have one
UPDATE partes_trabajo 
SET numero_parte = 'PT-2024-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 3, '0')
WHERE numero_parte IS NULL;

-- Update existing records with vehiculo info from vehiculos table if available
UPDATE partes_trabajo pt
SET 
    vehiculo_matricula = COALESCE(pt.vehiculo_matricula, v.matricula),
    vehiculo_marca = COALESCE(pt.vehiculo_marca, v.marca),
    vehiculo_modelo = COALESCE(pt.vehiculo_modelo, v.modelo),
    vehiculo_serie = COALESCE(pt.vehiculo_serie, v.serie)
FROM vehiculos v
WHERE pt.vehiculo_id = v.id AND pt.vehiculo_matricula IS NULL;

-- Update existing records with cliente_nombre from clientes table if available
UPDATE partes_trabajo pt
SET cliente_nombre = COALESCE(pt.cliente_nombre, c.nombre)
FROM clientes c
WHERE pt.cliente_id = c.id AND pt.cliente_nombre IS NULL;

-- Grant permissions
GRANT ALL ON partes_trabajo TO authenticated;
GRANT ALL ON partes_trabajo TO anon;

-- Add comments
COMMENT ON COLUMN partes_trabajo.cliente_nombre IS 'Nombre directo del cliente (para clientes no registrados)';
COMMENT ON COLUMN partes_trabajo.vehiculo_matricula IS 'Matrícula del vehículo (almacenada directamente)';
COMMENT ON COLUMN partes_trabajo.vehiculo_marca IS 'Marca del vehículo (almacenada directamente)';
COMMENT ON COLUMN partes_trabajo.vehiculo_modelo IS 'Modelo del vehículo (almacenado directamente)';
COMMENT ON COLUMN partes_trabajo.vehiculo_serie IS 'Número de serie del vehículo (almacenado directamente)';
COMMENT ON COLUMN partes_trabajo.numero_parte IS 'Número único del parte de trabajo';
COMMENT ON COLUMN partes_trabajo.created_by IS 'Usuario que creó el parte de trabajo';
COMMENT ON COLUMN partes_trabajo.validado IS 'Indica si el parte ha sido validado';
COMMENT ON COLUMN partes_trabajo.firma_cliente IS 'Firma digital del cliente en base64';
COMMENT ON COLUMN partes_trabajo.horas_facturables IS 'Horas que se facturarán al cliente';
COMMENT ON COLUMN partes_trabajo.materiales_utilizados IS 'Lista de materiales utilizados en formato JSON';
