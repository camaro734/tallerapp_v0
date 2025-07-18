-- Índices para optimizar consultas

-- Usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- Clientes
CREATE INDEX idx_clientes_nombre ON clientes(nombre);
CREATE INDEX idx_clientes_cif ON clientes(cif);
CREATE INDEX idx_clientes_activo ON clientes(activo);

-- Vehículos
CREATE INDEX idx_vehiculos_matricula ON vehiculos(matricula);
CREATE INDEX idx_vehiculos_cliente_id ON vehiculos(cliente_id);

-- Materiales
CREATE INDEX idx_materiales_codigo ON materiales(codigo);
CREATE INDEX idx_materiales_categoria ON materiales(categoria);
CREATE INDEX idx_materiales_stock_bajo ON materiales(stock_actual, stock_minimo);

-- Partes de trabajo
CREATE INDEX idx_partes_numero ON partes_trabajo(numero_parte);
CREATE INDEX idx_partes_estado ON partes_trabajo(estado);
CREATE INDEX idx_partes_tecnico ON partes_trabajo(tecnico_id);
CREATE INDEX idx_partes_cliente ON partes_trabajo(cliente_id);
CREATE INDEX idx_partes_fecha_inicio ON partes_trabajo(fecha_inicio);
CREATE INDEX idx_partes_prioridad ON partes_trabajo(prioridad);

-- Fichajes
CREATE INDEX idx_fichajes_usuario ON fichajes(usuario_id);
CREATE INDEX idx_fichajes_parte ON fichajes(parte_trabajo_id);
CREATE INDEX idx_fichajes_fecha ON fichajes(fecha_hora);
CREATE INDEX idx_fichajes_tipo ON fichajes(tipo_fichaje);

-- Presupuestos
CREATE INDEX idx_presupuestos_numero ON presupuestos(numero_presupuesto);
CREATE INDEX idx_presupuestos_estado ON presupuestos(estado);
CREATE INDEX idx_presupuestos_cliente ON presupuestos(cliente_id);

-- Solicitudes de vacaciones
CREATE INDEX idx_vacaciones_usuario ON solicitudes_vacaciones(usuario_id);
CREATE INDEX idx_vacaciones_estado ON solicitudes_vacaciones(estado);
CREATE INDEX idx_vacaciones_fechas ON solicitudes_vacaciones(fecha_inicio, fecha_fin);

-- Citas
CREATE INDEX idx_citas_fecha ON citas(fecha_hora);
CREATE INDEX idx_citas_tecnico ON citas(tecnico_id);
CREATE INDEX idx_citas_estado ON citas(estado);

-- Historial
CREATE INDEX idx_historial_tabla ON historial_acciones(tabla_afectada);
CREATE INDEX idx_historial_registro ON historial_acciones(registro_id);
CREATE INDEX idx_historial_usuario ON historial_acciones(usuario_id);
CREATE INDEX idx_historial_fecha ON historial_acciones(created_at);
