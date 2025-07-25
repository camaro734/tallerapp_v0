-- Insertar usuarios de ejemplo
INSERT INTO usuarios (id, email, nombre, apellidos, dni, telefono, rol, activo, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@cmgplataformas.com', 'Administrador', 'Sistema', '12345678A', '666123456', 'admin', true, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'jefe@cmgplataformas.com', 'Carlos', 'Martínez López', '87654321B', '666234567', 'jefe_taller', true, NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'juan@cmgplataformas.com', 'Juan', 'Pérez García', '11223344C', '666345678', 'tecnico', true, NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'maria@cmgplataformas.com', 'María', 'García Ruiz', '55667788D', '666456789', 'tecnico', true, NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'recepcion@cmgplataformas.com', 'Ana', 'López Silva', '99887766E', '666567890', 'recepcion', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insertar clientes de ejemplo
INSERT INTO clientes (id, nombre, cif, telefono, email, direccion, contacto_principal, activo, created_at, updated_at) VALUES
('c1111111-1111-1111-1111-111111111111', 'Transportes Fernández S.L.', 'B12345678', '987654321', 'info@transportesfernandez.com', 'Polígono Industrial Norte, Nave 15, Madrid', 'José Fernández', true, NOW(), NOW()),
('c2222222-2222-2222-2222-222222222222', 'Construcciones y Grúas del Sur', 'B87654321', '912345678', 'contacto@gruasdelsur.es', 'Avenida de la Industria 45, Sevilla', 'Ana Ruiz', true, NOW(), NOW()),
('c3333333-3333-3333-3333-333333333333', 'Logística Mediterránea', 'B11223344', '965123456', 'info@logisticamediterranea.com', 'Puerto Comercial, Muelle 8, Valencia', 'Miguel Torres', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insertar vehículos de ejemplo
INSERT INTO vehiculos (id, cliente_id, matricula, marca, modelo, serie, tipo_vehiculo, año, activo, created_at, updated_at) VALUES
('v1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '1234ABC', 'Mercedes', 'Actros con HIAB 166', 'MP4', 'Camión con grúa HIAB', 2020, true, NOW(), NOW()),
('v2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', '5678DEF', 'Iveco', 'Daily con Dhollandia', '35C15', 'Furgón con plataforma Dhollandia', 2019, true, NOW(), NOW()),
('v3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', '9876GHI', 'Renault', 'Master con Zepro', 'L3H2', 'Furgón con plataforma Zepro', 2021, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insertar materiales de ejemplo
INSERT INTO materiales (id, codigo, nombre, descripcion, categoria, stock_actual, stock_minimo, precio_unitario, proveedor, ubicacion, unidad, activo, created_at, updated_at) VALUES
('m1111111-1111-1111-1111-111111111111', 'HIAB-CIL-001', 'Cilindro hidráulico principal HIAB 166', 'Cilindro hidráulico principal para grúa HIAB serie 166, incluye juntas y retenes', 'Componentes HIAB', 8, 2, 850.00, 'HIAB España S.A.', 'Estantería A-1', 'unidad', true, NOW(), NOW()),
('m2222222-2222-2222-2222-222222222222', 'DHO-MOT-001', 'Motor hidráulico Dhollandia', 'Motor hidráulico para plataforma elevadora Dhollandia, 12V, 2.2kW', 'Componentes Dhollandia', 5, 1, 1200.00, 'Dhollandia Ibérica', 'Estantería B-2', 'unidad', true, NOW(), NOW()),
('m3333333-3333-3333-3333-333333333333', 'ZEP-PLA-001', 'Placa base Zepro', 'Placa base de fijación para plataforma Zepro, acero galvanizado', 'Componentes Zepro', 12, 3, 320.00, 'Zepro Components', 'Estantería C-1', 'unidad', true, NOW(), NOW()),
('m4444444-4444-4444-4444-444444444444', 'HYD-ACE-046', 'Aceite hidráulico ISO 46', 'Aceite hidráulico para sistemas de plataformas y grúas, viscosidad ISO 46', 'Lubricantes', 50, 10, 15.50, 'Lubricantes Industriales', 'Almacén principal', 'litros', true, NOW(), NOW()),
('m5555555-5555-5555-5555-555555555555', 'JUN-TOR-025', 'Junta tórica 25mm', 'Junta tórica de goma NBR, diámetro 25mm, para cilindros hidráulicos', 'Juntas y Retenes', 100, 20, 2.50, 'Juntas Técnicas S.L.', 'Estantería D-3', 'unidad', true, NOW(), NOW()),
('m6666666-6666-6666-6666-666666666666', 'MAN-HID-12', 'Manguera hidráulica 12mm', 'Manguera hidráulica de alta presión, diámetro interior 12mm, 350 bar', 'Mangueras', 200, 50, 8.50, 'Hidráulica Norte', 'Almacén principal', 'metros', true, NOW(), NOW()),
('m7777777-7777-7777-7777-777777777777', 'FIL-HID-35', 'Filtro hidráulico HF-35', 'Filtro hidráulico de retorno, elemento filtrante 10 micras', 'Filtros', 25, 5, 45.00, 'Filtros Industriales', 'Estantería A-2', 'unidad', true, NOW(), NOW()),
('m8888888-8888-8888-8888-888888888888', 'TOR-M12-50', 'Tornillería M12x50', 'Tornillos hexagonales M12x50, acero inoxidable A2, con tuerca y arandela', 'Tornillería', 500, 100, 1.20, 'Tornillería Industrial', 'Estantería E-1', 'unidad', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insertar partes de trabajo de ejemplo
INSERT INTO partes_trabajo (id, numero_parte, cliente_id, vehiculo_id, tecnico_id, tipo_trabajo, descripcion, estado, prioridad, horas_estimadas, ubicacion, created_by, created_at, updated_at) VALUES
('p1111111-1111-1111-1111-111111111111', 'PT-2024-001', 'c1111111-1111-1111-1111-111111111111', 'v1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'reparacion', 'Sustitución de cilindro hidráulico principal y revisión del sistema de extensión', 'pendiente', 'alta', 6, 'Taller principal', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
('p2222222-2222-2222-2222-222222222222', 'PT-2024-002', 'c2222222-2222-2222-2222-222222222222', 'v2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'reparacion', 'Reparación del motor hidráulico y ajuste de la plataforma elevadora', 'en_curso', 'media', 4, 'Taller principal', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
('p3333333-3333-3333-3333-333333333333', 'PT-2024-003', 'c3333333-3333-3333-3333-333333333333', 'v3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'revision', 'Revisión completa para ITV: verificación de soldaduras, pruebas de carga y certificación', 'completado', 'media', 3, 'Taller principal', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
('p4444444-4444-4444-4444-444444444444', 'PT-2024-004', 'c1111111-1111-1111-1111-111111111111', 'v1111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'mantenimiento', 'Mantenimiento preventivo de sistema hidráulico', 'completado', 'baja', 2, 'Taller principal', '11111111-1111-1111-1111-111111111111', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insertar fichajes de ejemplo
INSERT INTO fichajes (id, usuario_id, parte_trabajo_id, tipo, tipo_fichaje, fecha_hora, created_at) VALUES
('f1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'p2222222-2222-2222-2222-222222222222', 'trabajo', 'entrada', '2024-01-16 09:00:00', NOW()),
('f2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'p1111111-1111-1111-1111-111111111111', 'trabajo', 'entrada', '2024-01-16 08:30:00', NOW()),
('f3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', NULL, 'presencia', 'entrada', '2024-01-19 08:00:00', 'Entrada al trabajo'),
('f4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', NULL, 'presencia', 'salida', '2024-01-19 17:00:00', 'Salida del trabajo')
ON CONFLICT (id) DO NOTHING;

-- Insertar solicitudes de vacaciones de ejemplo
INSERT INTO solicitudes_vacaciones (id, usuario_id, fecha_inicio, fecha_fin, dias_solicitados, motivo, estado, created_at, updated_at) VALUES
('s1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '2024-02-15', '2024-02-20', 6, 'Vacaciones familiares', 'pendiente', NOW(), NOW()),
('s2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', '2024-03-01', '2024-03-05', 5, 'Descanso personal', 'aprobada', NOW(), NOW()),
('s3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '2024-01-25', '2024-01-26', 2, 'Asuntos médicos', 'rechazada', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insertar citas de ejemplo
INSERT INTO citas (id, titulo, descripcion, fecha_hora, duracion, cliente_id, vehiculo_id, tecnico_id, tipo_servicio, estado, created_by, created_at, updated_at) VALUES
('a1111111-1111-1111-1111-111111111111', 'Revisión sistema hidráulico', 'Revisión completa del sistema hidráulico de la grúa HIAB', '2024-01-25 10:00:00', 120, 'c1111111-1111-1111-1111-111111111111', 'v1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'revision', 'programada', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
('a2222222-2222-2222-2222-222222222222', 'Mantenimiento plataforma Dhollandia', 'Mantenimiento preventivo de la plataforma elevadora', '2024-01-26 14:00:00', 90, 'c2222222-2222-2222-2222-222222222222', 'v2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'mantenimiento', 'confirmada', '11111111-1111-1111-1111-111111111111', NOW(), NOW()),
('a3333333-3333-3333-3333-333333333333', 'Diagnóstico avería Zepro', 'Diagnóstico de avería en sistema de elevación', '2024-01-27 09:30:00', 60, 'c3333333-3333-3333-3333-333333333333', 'v3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'diagnostico', 'programada', '11111111-1111-1111-1111-111111111111', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
