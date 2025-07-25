-- Crear tablas principales
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('admin', 'jefe_taller', 'tecnico', 'recepcion')) NOT NULL,
    activo BOOLEAN DEFAULT true,
    dni VARCHAR(20),
    telefono VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    cif VARCHAR(20),
    telefono VARCHAR(20),
    email VARCHAR(255),
    direccion TEXT,
    contacto_principal VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehiculos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    matricula VARCHAR(20) NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    serie VARCHAR(100),
    tipo_vehiculo VARCHAR(100),
    año INTEGER,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS materiales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100) NOT NULL,
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 0,
    precio_unitario DECIMAL(10,2) DEFAULT 0,
    unidad VARCHAR(20) DEFAULT 'unidades',
    proveedor VARCHAR(255),
    ubicacion VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partes_trabajo (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_parte VARCHAR(50) UNIQUE,
    cliente_id UUID REFERENCES clientes(id),
    cliente_nombre VARCHAR(255),
    vehiculo_id UUID REFERENCES vehiculos(id),
    vehiculo_matricula VARCHAR(20),
    vehiculo_marca VARCHAR(100),
    vehiculo_modelo VARCHAR(100),
    vehiculo_serie VARCHAR(100),
    tecnico_id UUID REFERENCES usuarios(id),
    tecnico_asignado VARCHAR(255),
    tipo_trabajo VARCHAR(50) CHECK (tipo_trabajo IN ('mantenimiento', 'reparacion', 'revision', 'instalacion', 'diagnostico', 'emergencia', 'garantia', 'otro')),
    descripcion TEXT NOT NULL,
    trabajo_realizado TEXT,
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'en_curso', 'completado', 'cancelado')) DEFAULT 'pendiente',
    prioridad VARCHAR(20) CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')) DEFAULT 'media',
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_fin TIMESTAMP WITH TIME ZONE,
    horas_estimadas DECIMAL(5,2),
    horas_reales DECIMAL(5,2),
    horas_facturables DECIMAL(5,2),
    ubicacion VARCHAR(100),
    materiales_utilizados JSONB,
    descripcion_materiales TEXT,
    validado BOOLEAN DEFAULT FALSE,
    fecha_validacion TIMESTAMP WITH TIME ZONE,
    validado_por UUID REFERENCES usuarios(id),
    created_by UUID REFERENCES usuarios(id),
    firma_cliente TEXT,
    fecha_firma TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fichajes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    parte_trabajo_id UUID REFERENCES partes_trabajo(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL DEFAULT 'presencia' CHECK (tipo IN ('presencia', 'trabajo')),
    tipo_fichaje VARCHAR(10) NOT NULL CHECK (tipo_fichaje IN ('entrada', 'salida')),
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parte_materiales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parte_trabajo_id UUID REFERENCES partes_trabajo(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materiales(id) ON DELETE CASCADE,
    cantidad_utilizada INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parte_trabajo_id UUID REFERENCES partes_trabajo(id) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(50),
    url_archivo TEXT NOT NULL,
    tamaño_archivo INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS presupuestos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_presupuesto VARCHAR(50) UNIQUE NOT NULL,
    cliente_id UUID REFERENCES clientes(id),
    vehiculo_id UUID REFERENCES vehiculos(id),
    descripcion TEXT NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('borrador', 'enviado', 'aprobado', 'rechazado', 'caducado')) DEFAULT 'borrador',
    subtotal DECIMAL(10,2) DEFAULT 0,
    iva DECIMAL(5,2) DEFAULT 21,
    total DECIMAL(10,2) DEFAULT 0,
    fecha_validez DATE,
    created_by UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS solicitudes_vacaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_solicitados INTEGER NOT NULL,
    motivo TEXT,
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')) DEFAULT 'pendiente',
    aprobada_por UUID REFERENCES usuarios(id),
    fecha_aprobacion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS citas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    duracion INTEGER DEFAULT 60,
    cliente_id UUID REFERENCES clientes(id),
    vehiculo_id UUID REFERENCES vehiculos(id),
    tecnico_id UUID REFERENCES usuarios(id),
    tipo_servicio VARCHAR(100),
    estado VARCHAR(20) CHECK (estado IN ('programada', 'confirmada', 'en_curso', 'completada', 'cancelada')) DEFAULT 'programada',
    notas TEXT,
    created_by UUID REFERENCES usuarios(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS historial_acciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id),
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id UUID,
    detalles JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
