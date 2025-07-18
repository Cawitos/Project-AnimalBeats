DROP DATABASE IF EXISTS AnimalBeats;
CREATE DATABASE AnimalBeats;
Use AnimalBeats;

CREATE TABLE Rol(
	id INT AUTO_INCREMENT PRIMARY KEY,
	rol VARCHAR(100)
);
CREATE TABLE Documento(
	id INT AUTO_INCREMENT PRIMARY KEY,
	tipo VARCHAR(100)
);
CREATE TABLE Usuarios(
	n_documento VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
	correoelectronico VARCHAR(255) NOT NULL,
	contrasena VARCHAR(255) NOT NULL,
	id_documento INT,
	id_rol INT,
	estado VARCHAR(100),
	FOREIGN KEY (id_documento) REFERENCES Documento(id) ON DELETE CASCADE,
	FOREIGN KEY (id_rol) REFERENCES Rol(id)
);

CREATE TABLE Especie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Especie VARCHAR(50),
    imagen varchar(300)
);

CREATE TABLE Raza (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Raza VARCHAR(50),
    descripcion text,
    id_especie INT,
    imagen varchar(300),
    FOREIGN KEY (id_especie) REFERENCES Especie(id) ON DELETE CASCADE
);
CREATE TABLE Mascota(
	id int auto_increment primary key,
    nombre varchar(45) not null,
    id_Especie int not null,
    id_cliente varchar(10) not null,
    id_Raza int not null,
    estado VARCHAR(100),
    fecha_nacimiento date not null,
    foreign key (id_Raza) references Raza(id) on delete cascade,
    foreign key (id_cliente) references Usuarios(n_documento) on delete cascade,
    foreign key (id_Especie) references Especie(id) on delete cascade
);
create table Enfermedad(
	nombre varchar(60) primary key,
    descripcion text
);
Create table Servicios(
	id int auto_increment primary key,
    servicio varchar(200)
);
Create table Citas(
	id INT auto_increment primary key,
    id_Mascota int not null,
	id_cliente varchar(10) not null,
	id_Servicio int not null,
    fecha datetime not null,
    Descripcion varchar(255),
    foreign key (id_Mascota) references Mascota(id) on delete cascade,
    foreign key (id_cliente) references Usuarios(n_documento) on delete cascade,
    foreign key (id_Servicio) references Servicios(id) on delete cascade
);
Create table Recordatorios(
	id INT AUTO_INCREMENT PRIMARY KEY,
    id_Mascota int not null,
	id_cliente varchar(10) not null,
    fecha datetime not null,
    descripcion TEXT not null,
    foreign key (id_cliente) references Usuarios(n_documento) on delete cascade,
	foreign key (id_Mascota) references Mascota(id) on delete cascade
);	

INSERT INTO Documento (tipo) VALUES ('C.C'), ('T.I'), ('C.E');
INSERT INTO Rol (rol) VALUES ('admin'), ('cliente'), ('veterinario');
insert into Servicios (servicio) values ('Consulta Generla'), ('Urgencias'), ('Baño y peluqueria'), ('Vacunaciones'), ('Cardiologia'), ('Nutricional');
