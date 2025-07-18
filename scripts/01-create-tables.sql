-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE usuarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(50) CHECK (rol IN ('admin', 'jefe_taller', 'tecnico')) NOT NULL,
  telefono VARCHAR(20),
  activo BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE clientes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Tabla de vehículos
CREATE TABLE vehiculos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  matricula VARCHAR(20) UNIQUE NOT NULL,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  serie VARCHAR(100),
  tipo_vehiculo VARCHAR(100),
  año INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de materiales
CREATE TABLE materiales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  categoria VARCHAR(100),
  stock_actual INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 0,
  precio_unitario DECIMAL(10,2),
  proveedor VARCHAR(255),
  ubicacion VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de partes de trabajo
CREATE TABLE partes_trabajo (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  numero_parte VARCHAR(50) UNIQUE NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  vehiculo_id UUID REFERENCES vehiculos(id),
  tecnico_id UUID REFERENCES usuarios(id),
  tipo_trabajo VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  estado VARCHAR(50) CHECK (estado IN ('pendiente', 'en_curso', 'completado', 'cancelado')) DEFAULT 'pendiente',
  prioridad VARCHAR(20) CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')) DEFAULT 'media',
  fecha_inicio DATE,
  fecha_fin DATE,
  horas_estimadas DECIMAL(5,2),
  horas_reales DECIMAL(5,2) DEFAULT 0,
  ubicacion TEXT,
  observaciones TEXT,
  firma_cliente TEXT, -- Base64 de la firma
  dni_cliente VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de fichajes
CREATE TABLE fichajes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  parte_trabajo_id UUID REFERENCES partes_trabajo(id) ON DELETE CASCADE,
  tipo_fichaje VARCHAR(20) CHECK (tipo_fichaje IN ('entrada', 'salida', 'pausa_inicio', 'pausa_fin')) NOT NULL,
  fecha_hora TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ubicacion_gps POINT,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de materiales utilizados en partes
CREATE TABLE parte_materiales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parte_trabajo_id UUID REFERENCES partes_trabajo(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materiales(id) ON DELETE CASCADE,
  cantidad_utilizada INTEGER NOT NULL,
  precio_unitario DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de documentos/fotos
CREATE TABLE documentos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parte_trabajo_id UUID REFERENCES partes_trabajo(id) ON DELETE CASCADE,
  nombre_archivo VARCHAR(255) NOT NULL,
  tipo_archivo VARCHAR(50),
  url_archivo TEXT NOT NULL,
  descripcion TEXT,
  subido_por UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de presupuestos
CREATE TABLE presupuestos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  numero_presupuesto VARCHAR(50) UNIQUE NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  vehiculo_id UUID REFERENCES vehiculos(id),
  descripcion TEXT NOT NULL,
  importe_total DECIMAL(10,2) NOT NULL,
  estado VARCHAR(50) CHECK (estado IN ('borrador', 'enviado', 'aceptado', 'rechazado', 'expirado')) DEFAULT 'borrador',
  fecha_validez DATE,
  observaciones TEXT,
  created_by UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de solicitudes de vacaciones
CREATE TABLE solicitudes_vacaciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  dias_solicitados INTEGER NOT NULL,
  motivo TEXT,
  estado VARCHAR(50) CHECK (estado IN ('pendiente', 'aprobada', 'rechazada')) DEFAULT 'pendiente',
  comentario_admin TEXT,
  aprobado_por UUID REFERENCES usuarios(id),
  fecha_aprobacion TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de citas/agenda
CREATE TABLE citas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id),
  vehiculo_id UUID REFERENCES vehiculos(id),
  tecnico_id UUID REFERENCES usuarios(id),
  fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  duracion_estimada INTEGER, -- en minutos
  tipo_trabajo VARCHAR(100),
  descripcion TEXT,
  estado VARCHAR(50) CHECK (estado IN ('programada', 'confirmada', 'completada', 'cancelada')) DEFAULT 'programada',
  observaciones TEXT,
  created_by UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de historial de acciones
CREATE TABLE historial_acciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tabla_afectada VARCHAR(100) NOT NULL,
  registro_id UUID NOT NULL,
  accion VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete'
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  usuario_id UUID REFERENCES usuarios(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
