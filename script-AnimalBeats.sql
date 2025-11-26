-- ===========================
-- Tablas principales
-- ===========================

CREATE TABLE Rol(
    id SERIAL PRIMARY KEY,
    rol VARCHAR(100)
);

CREATE TABLE Documento(
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(100)
);

CREATE TABLE Usuarios(
    n_documento VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    correoelectronico VARCHAR(255) NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    id_documento INT REFERENCES Documento(id) ON DELETE CASCADE,
    id_rol INT REFERENCES Rol(id),
    estado VARCHAR(100)
);

CREATE TABLE Veterinarios (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    estudios_especialidad VARCHAR(255),
    edad INT CHECK (edad > 0),
    altura NUMERIC(4,2), 
    anios_experiencia INT CHECK (anios_experiencia >= 0),
    imagen_url TEXT, 
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE Especie (
    id SERIAL PRIMARY KEY,
    especie VARCHAR(50),
    imagen VARCHAR(300)
);

CREATE TABLE Raza (
    id SERIAL PRIMARY KEY,
    raza VARCHAR(50),
    descripcion TEXT,
    id_especie INT REFERENCES Especie(id) ON DELETE CASCADE,
    imagen VARCHAR(300)
);

CREATE TABLE Mascota(
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(45) NOT NULL,
    id_especie INT NOT NULL REFERENCES Especie(id) ON DELETE CASCADE,
    id_cliente VARCHAR(10) NOT NULL REFERENCES Usuarios(n_documento) ON DELETE CASCADE,
    id_raza INT NOT NULL REFERENCES Raza(id) ON DELETE CASCADE,
    estado VARCHAR(100),
    fecha_nacimiento DATE NOT NULL
);

-- ===========================
-- Enfermedad con id
-- ===========================
CREATE TABLE Enfermedad(
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(60) UNIQUE NOT NULL,
    descripcion TEXT
);

CREATE TABLE Servicios(
    id SERIAL PRIMARY KEY,
    servicio VARCHAR(200)
);

CREATE TABLE Citas(
    id SERIAL PRIMARY KEY,
    id_mascota INT NOT NULL REFERENCES Mascota(id) ON DELETE CASCADE,
    id_cliente VARCHAR(10) NOT NULL REFERENCES Usuarios(n_documento) ON DELETE CASCADE,
    id_servicio INT NOT NULL REFERENCES Servicios(id) ON DELETE CASCADE,
    id_veterinario INT NOT NULL REFERENCES Veterinarios(id) ON DELETE CASCADE,
    fecha TIMESTAMP NOT NULL,
    descripcion VARCHAR(255),
    estado VARCHAR(100) NOT NULL
);

CREATE TABLE Recordatorios(
    id SERIAL PRIMARY KEY,
    id_mascota INT NOT NULL REFERENCES Mascota(id) ON DELETE CASCADE,
    id_cliente VARCHAR(10) NOT NULL REFERENCES Usuarios(n_documento) ON DELETE CASCADE,
    fecha TIMESTAMP NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(100) NOT NULL
);

-- ===========================
-- Datos iniciales
-- ===========================
INSERT INTO Documento (tipo) VALUES ('C.C'), ('T.I'), ('C.E');
INSERT INTO Rol (rol) VALUES ('admin'), ('tutor'), ('veterinario');
INSERT INTO Servicios (servicio) VALUES 
    ('Consulta General'), 
    ('Urgencias'), 
    ('Baño y peluqueria'), 
    ('Vacunaciones'), 
    ('Cardiologia'), 
    ('Nutricional');
