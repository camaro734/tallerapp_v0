-- Índices para optimizar consultas

-- Usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

-- Clientes
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);
CREATE INDEX IF NOT EXISTS idx_clientes_cif ON clientes(cif);
CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes(activo);

-- Vehículos
CREATE INDEX IF NOT EXISTS idx_vehiculos_matricula ON vehiculos(matricula);
CREATE INDEX IF NOT EXISTS idx_vehiculos_cliente_id ON vehiculos(cliente_id);

-- Materiales
CREATE INDEX IF NOT EXISTS idx_materiales_codigo ON materiales(codigo);
CREATE INDEX IF NOT EXISTS idx_materiales_categoria ON materiales(categoria);
CREATE INDEX IF NOT EXISTS idx_materiales_stock_bajo ON materiales(stock_actual, stock_minimo);

-- Partes de trabajo
CREATE INDEX IF NOT EXISTS idx_partes_numero ON partes_trabajo(numero_parte);
CREATE INDEX IF NOT EXISTS idx_partes_estado ON partes_trabajo(estado);
CREATE INDEX IF NOT EXISTS idx_partes_tecnico ON partes_trabajo(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_partes_cliente ON partes_trabajo(cliente_id);
CREATE INDEX IF NOT EXISTS idx_partes_fecha_inicio ON partes_trabajo(fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_partes_prioridad ON partes_trabajo(prioridad);

-- Fichajes
CREATE INDEX IF NOT EXISTS idx_fichajes_usuario ON fichajes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_fichajes_parte ON fichajes(parte_trabajo_id);
CREATE INDEX IF NOT EXISTS idx_fichajes_fecha ON fichajes(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_fichajes_tipo ON fichajes(tipo_fichaje);

-- Presupuestos
CREATE INDEX IF NOT EXISTS idx_presupuestos_numero ON presupuestos(numero_presupuesto);
CREATE INDEX IF NOT EXISTS idx_presupuestos_estado ON presupuestos(estado);
CREATE INDEX IF NOT EXISTS idx_presupuestos_cliente ON presupuestos(cliente_id);

-- Solicitudes de vacaciones
CREATE INDEX IF NOT EXISTS idx_vacaciones_usuario ON solicitudes_vacaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_vacaciones_estado ON solicitudes_vacaciones(estado);
CREATE INDEX IF NOT EXISTS idx_vacaciones_fechas ON solicitudes_vacaciones(fecha_inicio, fecha_fin);

-- Citas
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_citas_tecnico ON citas(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);

-- Historial
CREATE INDEX IF NOT EXISTS idx_historial_tabla ON historial_acciones(tabla_afectada);
CREATE INDEX IF NOT EXISTS idx_historial_registro ON historial_acciones(registro_id);
CREATE INDEX IF NOT EXISTS idx_historial_usuario ON historial_acciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_fecha ON historial_acciones(created_at);
