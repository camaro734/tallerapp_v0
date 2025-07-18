-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehiculos_updated_at BEFORE UPDATE ON vehiculos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materiales_updated_at BEFORE UPDATE ON materiales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partes_trabajo_updated_at BEFORE UPDATE ON partes_trabajo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_presupuestos_updated_at BEFORE UPDATE ON presupuestos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_solicitudes_vacaciones_updated_at BEFORE UPDATE ON solicitudes_vacaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_citas_updated_at BEFORE UPDATE ON citas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar números de parte automáticamente
CREATE OR REPLACE FUNCTION generar_numero_parte()
RETURNS TRIGGER AS $$
DECLARE
    nuevo_numero VARCHAR(50);
    contador INTEGER;
BEGIN
    -- Obtener el siguiente número secuencial para el año actual
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_parte FROM 9) AS INTEGER)), 0) + 1
    INTO contador
    FROM partes_trabajo
    WHERE numero_parte LIKE 'PT-' || EXTRACT(YEAR FROM NOW()) || '-%';
    
    -- Generar el nuevo número
    nuevo_numero := 'PT-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(contador::TEXT, 3, '0');
    
    NEW.numero_parte := nuevo_numero;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para generar número de parte automáticamente
CREATE TRIGGER trigger_generar_numero_parte
    BEFORE INSERT ON partes_trabajo
    FOR EACH ROW
    WHEN (NEW.numero_parte IS NULL)
    EXECUTE FUNCTION generar_numero_parte();

-- Función para actualizar stock de materiales
CREATE OR REPLACE FUNCTION actualizar_stock_material()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Reducir stock cuando se añade material a un parte
        UPDATE materiales 
        SET stock_actual = stock_actual - NEW.cantidad_utilizada
        WHERE id = NEW.material_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Ajustar stock cuando se modifica la cantidad
        UPDATE materiales 
        SET stock_actual = stock_actual + OLD.cantidad_utilizada - NEW.cantidad_utilizada
        WHERE id = NEW.material_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Restaurar stock cuando se elimina material del parte
        UPDATE materiales 
        SET stock_actual = stock_actual + OLD.cantidad_utilizada
        WHERE id = OLD.material_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger para actualizar stock automáticamente
CREATE TRIGGER trigger_actualizar_stock
    AFTER INSERT OR UPDATE OR DELETE ON parte_materiales
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_stock_material();

-- Función para calcular horas trabajadas
CREATE OR REPLACE FUNCTION calcular_horas_trabajadas(parte_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_horas DECIMAL := 0;
    entrada_time TIMESTAMP;
    salida_time TIMESTAMP;
    rec RECORD;
BEGIN
    -- Obtener todos los fichajes de entrada y salida para el parte
    FOR rec IN 
        SELECT fecha_hora, tipo_fichaje 
        FROM fichajes 
        WHERE parte_trabajo_id = parte_id 
        ORDER BY fecha_hora
    LOOP
        IF rec.tipo_fichaje = 'entrada' THEN
            entrada_time := rec.fecha_hora;
        ELSIF rec.tipo_fichaje = 'salida' AND entrada_time IS NOT NULL THEN
            total_horas := total_horas + EXTRACT(EPOCH FROM (rec.fecha_hora - entrada_time)) / 3600;
            entrada_time := NULL;
        END IF;
    END LOOP;
    
    RETURN total_horas;
END;
$$ language 'plpgsql';
