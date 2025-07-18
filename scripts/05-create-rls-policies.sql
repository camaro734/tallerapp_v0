-- Habilitar Row Level Security
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE partes_trabajo ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parte_materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes_vacaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_acciones ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON usuarios
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Los admins pueden ver todos los usuarios" ON usuarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id::text = auth.uid()::text AND rol = 'admin'
        )
    );

CREATE POLICY "Los jefes pueden ver técnicos" ON usuarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id::text = auth.uid()::text AND rol IN ('admin', 'jefe_taller')
        ) OR rol = 'tecnico'
    );

-- Políticas para partes de trabajo
CREATE POLICY "Los técnicos ven sus partes asignados" ON partes_trabajo
    FOR SELECT USING (
        tecnico_id::text = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id::text = auth.uid()::text AND rol IN ('admin', 'jefe_taller')
        )
    );

CREATE POLICY "Los técnicos pueden actualizar sus partes" ON partes_trabajo
    FOR UPDATE USING (
        tecnico_id::text = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id::text = auth.uid()::text AND rol IN ('admin', 'jefe_taller')
        )
    );

-- Políticas para fichajes
CREATE POLICY "Los usuarios ven sus propios fichajes" ON fichajes
    FOR SELECT USING (
        usuario_id::text = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id::text = auth.uid()::text AND rol IN ('admin', 'jefe_taller')
        )
    );

CREATE POLICY "Los usuarios pueden crear sus fichajes" ON fichajes
    FOR INSERT WITH CHECK (usuario_id::text = auth.uid()::text);

-- Políticas para solicitudes de vacaciones
CREATE POLICY "Los usuarios ven sus solicitudes" ON solicitudes_vacaciones
    FOR SELECT USING (
        usuario_id::text = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id::text = auth.uid()::text AND rol IN ('admin', 'jefe_taller')
        )
    );

CREATE POLICY "Los usuarios pueden crear solicitudes" ON solicitudes_vacaciones
    FOR INSERT WITH CHECK (usuario_id::text = auth.uid()::text);

-- Políticas generales para lectura (admin y jefe_taller)
CREATE POLICY "Admins y jefes pueden leer todo" ON clientes FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id::text = auth.uid()::text AND rol IN ('admin', 'jefe_taller')
    )
);

CREATE POLICY "Admins y jefes pueden leer vehiculos" ON vehiculos FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id::text = auth.uid()::text AND rol IN ('admin', 'jefe_taller')
    )
);

CREATE POLICY "Todos pueden leer materiales" ON materiales FOR SELECT USING (true);

CREATE POLICY "Admins y jefes pueden leer presupuestos" ON presupuestos FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id::text = auth.uid()::text AND rol IN ('admin', 'jefe_taller')
    )
);

CREATE POLICY "Admins y jefes pueden leer citas" ON citas FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id::text = auth.uid()::text AND rol IN ('admin', 'jefe_taller')
    )
);
