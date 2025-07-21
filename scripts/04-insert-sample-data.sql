-- Insertar usuarios de ejemplo
INSERT INTO usuarios (id, email, nombre, apellidos, dni, telefono, rol, activo, created_at, updated_at) VALUES
('1', 'admin@cmgplataformas.com', 'Administrador', 'Sistema', '12345678A', '666123456', 'admin', true, NOW(), NOW()),
('2', 'jefe@cmgplataformas.com', 'Carlos', 'Martínez López', '87654321B', '666234567', 'jefe_taller', true, NOW(), NOW()),
('3', 'juan@cmgplataformas.com', 'Juan', 'Pérez García', '11223344C', '666345678', 'tecnico', true, NOW(), NOW()),
('4', 'maria@cmgplataformas.com', 'María', 'García Ruiz', '55667788D', '666456789', 'tecnico', true, NOW(), NOW()),
('5', 'recepcion@cmgplataformas.com', 'Ana', 'López Silva', '99887766E', '666567890', 'recepcion', true, NOW(), NOW());

-- Insertar clientes de ejemplo
INSERT INTO clientes (id, nombre, cif, telefono, email, direccion, contacto_principal, activo, created_at, updated_at) VALUES
('1', 'Transportes Fernández S.L.', 'B12345678', '987654321', 'info@transportesfernandez.com', 'Polígono Industrial Norte, Nave 15, Madrid', 'José Fernández', true, NOW(), NOW()),
('2', 'Construcciones y Grúas del Sur', 'B87654321', '912345678', 'contacto@gruasdelsur.es', 'Avenida de la Industria 45, Sevilla', 'Ana Ruiz', true, NOW(), NOW()),
('3', 'Logística Mediterránea', 'B11223344', '965123456', 'info@logisticamediterranea.com', 'Puerto Comercial, Muelle 8, Valencia', 'Miguel Torres', true, NOW(), NOW());

-- Insertar vehículos de ejemplo
INSERT INTO vehiculos (id, cliente_id, matricula, marca, modelo, serie, tipo_vehiculo, año, activo, created_at, updated_at) VALUES
('1', '1', '1234ABC', 'Mercedes', 'Actros con HIAB 166', 'MP4', 'Camión con grúa HIAB', 2020, true, NOW(), NOW()),
('2', '2', '5678DEF', 'Iveco', 'Daily con Dhollandia', '35C15', 'Furgón con plataforma Dhollandia', 2019, true, NOW(), NOW()),
('3', '3', '9876GHI', 'Renault', 'Master con Zepro', 'L3H2', 'Furgón con plataforma Zepro', 2021, true, NOW(), NOW());

-- Insertar materiales de ejemplo
INSERT INTO materiales (id, codigo, nombre, descripcion, categoria, stock_actual, stock_minimo, precio_unitario, proveedor, ubicacion, unidad, activo, created_at, updated_at) VALUES
('1', 'HIAB-CIL-001', 'Cilindro hidráulico principal HIAB 166', 'Cilindro hidráulico principal para grúa HIAB serie 166, incluye juntas y retenes', 'Componentes HIAB', 8, 2, 850.00, 'HIAB España S.A.', 'Estantería A-1', 'unidad', true, NOW(), NOW()),
('2', 'DHO-MOT-001', 'Motor hidráulico Dhollandia', 'Motor hidráulico para plataforma elevadora Dhollandia, 12V, 2.2kW', 'Componentes Dhollandia', 5, 1, 1200.00, 'Dhollandia Ibérica', 'Estantería B-2', 'unidad', true, NOW(), NOW()),
('3', 'ZEP-PLA-001', 'Placa base Zepro', 'Placa base de fijación para plataforma Zepro, acero galvanizado', 'Componentes Zepro', 12, 3, 320.00, 'Zepro Components', 'Estantería C-1', 'unidad', true, NOW(), NOW()),
('4', 'HYD-ACE-046', 'Aceite hidráulico ISO 46', 'Aceite hidráulico para sistemas de plataformas y grúas, viscosidad ISO 46', 'Lubricantes', 50, 10, 15.50, 'Lubricantes Industriales', 'Almacén principal', 'litros', true, NOW(), NOW()),
('5', 'JUN-TOR-025', 'Junta tórica 25mm', 'Junta tórica de goma NBR, diámetro 25mm, para cilindros hidráulicos', 'Juntas y Retenes', 100, 20, 2.50, 'Juntas Técnicas S.L.', 'Estantería D-3', 'unidad', true, NOW(), NOW()),
('6', 'MAN-HID-12', 'Manguera hidráulica 12mm', 'Manguera hidráulica de alta presión, diámetro interior 12mm, 350 bar', 'Mangueras', 200, 50, 8.50, 'Hidráulica Norte', 'Almacén principal', 'metros', true, NOW(), NOW()),
('7', 'FIL-HID-35', 'Filtro hidráulico HF-35', 'Filtro hidráulico de retorno, elemento filtrante 10 micras', 'Filtros', 25, 5, 45.00, 'Filtros Industriales', 'Estantería A-2', 'unidad', true, NOW(), NOW()),
('8', 'TOR-M12-50', 'Tornillería M12x50', 'Tornillos hexagonales M12x50, acero inoxidable A2, con tuerca y arandela', 'Tornillería', 500, 100, 1.20, 'Tornillería Industrial', 'Estantería E-1', 'unidad', true, NOW(), NOW());

-- Insertar partes de trabajo de ejemplo
INSERT INTO partes_trabajo (id, numero_parte, cliente_id, vehiculo_id, tecnico_id, tipo_trabajo, descripcion, estado, prioridad, horas_estimadas, ubicacion, created_at, updated_at) VALUES
('1', 'PT-2024-001', '1', '1', '3', 'reparacion', 'Sustitución de cilindro hidráulico principal y revisión del sistema de extensión', 'pendiente', 'alta', 6, 'Taller principal', NOW(), NOW()),
('2', 'PT-2024-002', '2', '2', '4', 'reparacion', 'Reparación del motor hidráulico y ajuste de la plataforma elevadora', 'en_curso', 'media', 4, 'Taller principal', NOW(), NOW()),
('3', 'PT-2024-003', '3', '3', '3', 'revision', 'Revisión completa para ITV: verificación de soldaduras, pruebas de carga y certificación', 'completado', 'media', 3, 'Taller principal', NOW(), NOW()),
('4', 'PT-2024-004', '1', '1', '4', 'mantenimiento', 'Mantenimiento preventivo de sistema hidráulico', 'completado', 'baja', 2, 'Taller principal', NOW(), NOW());

-- Insertar fichajes de ejemplo
INSERT INTO fichajes (id, usuario_id, parte_trabajo_id, tipo, tipo_fichaje, fecha_hora, created_at) VALUES
('1', '3', '2', 'trabajo', 'entrada', '2024-01-16 09:00:00', NOW()),
('2', '4', '1', 'trabajo', 'entrada', '2024-01-16 08:30:00', NOW());

-- Insertar solicitudes de vacaciones de ejemplo
INSERT INTO solicitudes_vacaciones (id, usuario_id, fecha_inicio, fecha_fin, dias_solicitados, motivo, estado, created_at, updated_at) VALUES
('1', '3', '2024-02-15', '2024-02-20', 6, 'Vacaciones familiares', 'pendiente', NOW(), NOW()),
('2', '4', '2024-03-01', '2024-03-05', 5, 'Descanso personal', 'aprobada', NOW(), NOW()),
('3', '3', '2024-01-25', '2024-01-26', 2, 'Asuntos médicos', 'rechazada', NOW(), NOW());
