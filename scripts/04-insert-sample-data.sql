-- Insertar usuarios de ejemplo
INSERT INTO usuarios (email, password_hash, nombre, rol, telefono) VALUES
('admin@cmghidraulica.com', '$2b$10$example_hash_admin', 'Administrador CMG', 'admin', '666 000 001'),
('jefe@cmghidraulica.com', '$2b$10$example_hash_jefe', 'Jefe de Taller', 'jefe_taller', '666 000 002'),
('juan@cmghidraulica.com', '$2b$10$example_hash_juan', 'Juan Pérez', 'tecnico', '666 123 456'),
('maria@cmghidraulica.com', '$2b$10$example_hash_maria', 'María González', 'tecnico', '677 234 567'),
('carlos@cmghidraulica.com', '$2b$10$example_hash_carlos', 'Carlos Ruiz', 'tecnico', '688 345 678');

-- Insertar clientes de ejemplo
INSERT INTO clientes (nombre, cif, telefono, email, direccion, contacto_principal) VALUES
('Transportes García S.L.', 'B12345678', '91 123 45 67', 'info@transportesgarcia.com', 'Polígono Industrial Norte, Nave 15, 28850 Torrejón de Ardoz', 'José García'),
('Construcciones López', 'B23456789', '91 234 56 78', 'contacto@construccioneslopez.com', 'Calle Mayor 45, 28801 Alcalá de Henares', 'Ana López'),
('Logística Madrid', 'B34567890', '91 345 67 89', 'admin@logisticamadrid.com', 'Nave 12, Sector B, 28850 Torrejón de Ardoz', 'Carlos Martín'),
('Excavaciones Norte', 'B45678901', '91 456 78 90', 'info@excavacionesnorte.com', 'Polígono Industrial, 28840 Mejorada del Campo', 'Luis Fernández'),
('Alquiler Maquinaria Pro', 'B56789012', '91 567 89 01', 'contacto@alquilerpro.com', 'Avenida de la Industria 123, 28850 Torrejón de Ardoz', 'Carmen Ruiz');

-- Insertar vehículos de ejemplo
INSERT INTO vehiculos (cliente_id, matricula, marca, modelo, serie, tipo_vehiculo, año) VALUES
((SELECT id FROM clientes WHERE nombre = 'Transportes García S.L.'), '1234-ABC', 'Mercedes', 'Actros', 'WDB9634321L123456', 'Grúa móvil', 2020),
((SELECT id FROM clientes WHERE nombre = 'Construcciones López'), '5678-DEF', 'Iveco', 'Daily', 'ZCFC3500005123456', 'Plataforma elevadora', 2019),
((SELECT id FROM clientes WHERE nombre = 'Logística Madrid'), '9012-GHI', 'Volvo', 'FH16', 'YV2R0D00005123456', 'Camión con grúa', 2021),
((SELECT id FROM clientes WHERE nombre = 'Excavaciones Norte'), '3456-JKL', 'Caterpillar', '320D', 'CAT0320DXXX123456', 'Excavadora', 2018),
((SELECT id FROM clientes WHERE nombre = 'Alquiler Maquinaria Pro'), '7890-MNO', 'JCB', '3CX', 'JCB3CX0005123456', 'Retroexcavadora', 2022);

-- Insertar materiales de ejemplo
INSERT INTO materiales (codigo, nombre, descripcion, categoria, stock_actual, stock_minimo, precio_unitario, proveedor, ubicacion) VALUES
('FH-001', 'Filtro hidráulico HF-35', 'Filtro hidráulico de alta presión', 'Filtros', 15, 5, 45.50, 'Hidráulica Industrial', 'Estante A-12'),
('AC-001', 'Aceite hidráulico ISO 46', 'Aceite hidráulico sintético 20L', 'Aceites', 8, 10, 85.00, 'Lubricantes Pro', 'Almacén B-05'),
('JT-001', 'Junta tórica 50x3mm', 'Junta tórica NBR 50x3mm', 'Juntas', 50, 20, 2.30, 'Juntas y Retenes', 'Cajón C-08'),
('CL-001', 'Cilindro hidráulico 80/40', 'Cilindro hidráulico doble efecto', 'Cilindros', 3, 3, 320.00, 'Hidráulica Industrial', 'Estante D-15'),
('MG-001', 'Manguera hidráulica 1/2"', 'Manguera alta presión 1/2" por metro', 'Mangueras', 25, 15, 12.50, 'Hidráulica Industrial', 'Rollo E-20'),
('VL-001', 'Válvula de alivio 210 bar', 'Válvula de seguridad 210 bar', 'Válvulas', 5, 3, 125.00, 'Componentes Hidráulicos', 'Estante F-08'),
('BM-001', 'Bomba hidráulica 25cc', 'Bomba de pistones 25cc/rev', 'Bombas', 2, 2, 850.00, 'Hidráulica Industrial', 'Almacén G-01'),
('RP-001', 'Racor rápido 1/2"', 'Racor de conexión rápida', 'Racores', 30, 10, 8.75, 'Conexiones Pro', 'Cajón H-15');

-- Insertar partes de trabajo de ejemplo
INSERT INTO partes_trabajo (cliente_id, vehiculo_id, tecnico_id, tipo_trabajo, descripcion, estado, prioridad, fecha_inicio, horas_estimadas, ubicacion) VALUES
((SELECT id FROM clientes WHERE nombre = 'Transportes García S.L.'), 
 (SELECT id FROM vehiculos WHERE matricula = '1234-ABC'), 
 (SELECT id FROM usuarios WHERE nombre = 'Juan Pérez'), 
 'Reparación', 'Reparación sistema hidráulico principal - pérdida de presión', 'en_curso', 'alta', CURRENT_DATE, 4.0, 'Polígono Industrial Norte'),

((SELECT id FROM clientes WHERE nombre = 'Construcciones López'), 
 (SELECT id FROM vehiculos WHERE matricula = '5678-DEF'), 
 (SELECT id FROM usuarios WHERE nombre = 'María González'), 
 'Mantenimiento', 'Mantenimiento preventivo anual completo', 'pendiente', 'media', CURRENT_DATE + 1, 2.0, 'Calle Mayor 45'),

((SELECT id FROM clientes WHERE nombre = 'Logística Madrid'), 
 (SELECT id FROM vehiculos WHERE matricula = '9012-GHI'), 
 (SELECT id FROM usuarios WHERE nombre = 'Carlos Ruiz'), 
 'Reparación', 'Sustitución cilindro principal dañado', 'completado', 'baja', CURRENT_DATE - 1, 3.0, 'Nave 12, Sector B');

-- Insertar materiales utilizados en partes
INSERT INTO parte_materiales (parte_trabajo_id, material_id, cantidad_utilizada, precio_unitario) VALUES
((SELECT id FROM partes_trabajo WHERE numero_parte LIKE 'PT-%' LIMIT 1), 
 (SELECT id FROM materiales WHERE codigo = 'FH-001'), 2, 45.50),
((SELECT id FROM partes_trabajo WHERE numero_parte LIKE 'PT-%' LIMIT 1), 
 (SELECT id FROM materiales WHERE codigo = 'AC-001'), 1, 85.00);

-- Insertar presupuestos de ejemplo
INSERT INTO presupuestos (numero_presupuesto, cliente_id, vehiculo_id, descripcion, importe_total, estado, fecha_validez, created_by) VALUES
('PRES-2024-001', 
 (SELECT id FROM clientes WHERE nombre = 'Transportes García S.L.'), 
 (SELECT id FROM vehiculos WHERE matricula = '1234-ABC'), 
 'Reparación completa sistema hidráulico', 1250.00, 'enviado', CURRENT_DATE + 30,
 (SELECT id FROM usuarios WHERE rol = 'admin' LIMIT 1)),

('PRES-2024-002', 
 (SELECT id FROM clientes WHERE nombre = 'Construcciones López'), 
 (SELECT id FROM vehiculos WHERE matricula = '5678-DEF'), 
 'Mantenimiento preventivo anual', 850.00, 'aceptado', CURRENT_DATE + 30,
 (SELECT id FROM usuarios WHERE rol = 'admin' LIMIT 1));

-- Insertar solicitudes de vacaciones de ejemplo
INSERT INTO solicitudes_vacaciones (usuario_id, fecha_inicio, fecha_fin, dias_solicitados, motivo, estado) VALUES
((SELECT id FROM usuarios WHERE nombre = 'Juan Pérez'), '2024-02-15', '2024-02-22', 6, 'Vacaciones familiares', 'pendiente'),
((SELECT id FROM usuarios WHERE nombre = 'María González'), '2024-03-01', '2024-03-08', 6, 'Descanso personal', 'aprobada'),
((SELECT id FROM usuarios WHERE nombre = 'Carlos Ruiz'), '2024-01-18', '2024-01-20', 3, 'Asuntos personales', 'aprobada');

-- Insertar citas de ejemplo
INSERT INTO citas (cliente_id, vehiculo_id, tecnico_id, fecha_hora, duracion_estimada, tipo_trabajo, descripcion, estado, created_by) VALUES
((SELECT id FROM clientes WHERE nombre = 'Excavaciones Norte'), 
 (SELECT id FROM vehiculos WHERE matricula = '3456-JKL'), 
 (SELECT id FROM usuarios WHERE nombre = 'Juan Pérez'), 
 CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '9 hours', 120, 'Revisión', 'Revisión grúa móvil', 'programada',
 (SELECT id FROM usuarios WHERE rol = 'admin' LIMIT 1)),

((SELECT id FROM clientes WHERE nombre = 'Alquiler Maquinaria Pro'), 
 (SELECT id FROM vehiculos WHERE matricula = '7890-MNO'), 
 (SELECT id FROM usuarios WHERE nombre = 'María González'), 
 CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '11 hours 30 minutes', 90, 'Reparación', 'Reparación plataforma elevadora', 'confirmada',
 (SELECT id FROM usuarios WHERE rol = 'admin' LIMIT 1));
