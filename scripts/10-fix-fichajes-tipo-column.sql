-- Fix fichajes table structure and add missing tipo column
-- Drop and recreate the table to ensure proper structure

-- Drop existing table and recreate with proper structure
DROP TABLE IF EXISTS fichajes CASCADE;

-- Create fichajes table with all required columns
CREATE TABLE fichajes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    parte_trabajo_id UUID REFERENCES partes_trabajo(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL DEFAULT 'presencia' CHECK (tipo IN ('presencia', 'trabajo')),
    tipo_fichaje VARCHAR(10) NOT NULL CHECK (tipo_fichaje IN ('entrada', 'salida')),
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_fichajes_usuario_id ON fichajes(usuario_id);
CREATE INDEX idx_fichajes_parte_trabajo_id ON fichajes(parte_trabajo_id);
CREATE INDEX idx_fichajes_fecha_hora ON fichajes(fecha_hora);
CREATE INDEX idx_fichajes_tipo ON fichajes(tipo);
CREATE INDEX idx_fichajes_tipo_fichaje ON fichajes(tipo_fichaje);
CREATE INDEX idx_fichajes_usuario_fecha ON fichajes(usuario_id, fecha_hora);
CREATE INDEX idx_fichajes_parte_fecha ON fichajes(parte_trabajo_id, fecha_hora);

-- Disable RLS on fichajes table
ALTER TABLE fichajes DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON fichajes TO postgres, anon, authenticated, service_role;

-- Insert sample data
INSERT INTO fichajes (id, usuario_id, parte_trabajo_id, tipo, tipo_fichaje, fecha_hora, observaciones) VALUES
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'trabajo', 'entrada', '2024-01-15T08:00:00Z', 'Inicio reparación sistema hidráulico'),
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', NULL, 'presencia', 'entrada', '2024-01-19T08:00:00Z', 'Entrada al trabajo'),
('f3', '4', '2', 'trabajo', 'entrada', '2024-01-10T09:00:00Z', 'Inicio mantenimiento preventivo'),
('f4', '4', '2', 'trabajo', 'salida', '2024-01-10T10:30:00Z', 'Fin mantenimiento preventivo'),
('f5', '4', NULL, 'presencia', 'entrada', '2024-01-19T08:30:00Z', 'Entrada al trabajo'),
('f6', '3', NULL, 'presencia', 'salida', '2024-01-19T17:00:00Z', 'Salida del trabajo');

-- Verify table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'fichajes' 
ORDER BY ordinal_position;

-- Add comment
COMMENT ON TABLE fichajes IS 'Tabla para registrar fichajes de presencia y trabajo de los usuarios';
COMMENT ON COLUMN fichajes.tipo IS 'Tipo de fichaje: presencia (entrada/salida general) o trabajo (entrada/salida específica a un parte)';
COMMENT ON COLUMN fichajes.tipo_fichaje IS 'Entrada o salida del fichaje';
