DROP DATABASE IF EXISTS AnimalBeats;
CREATE DATABASE AnimalBeats;
Use AnimalBeats;

CREATE TABLE Rol(
	id INT AUTO_INCREMENT PRIMARY KEY,
	rol ENUM('admin', 'cliente','veterinario')
);
CREATE TABLE Documento(
	id INT AUTO_INCREMENT PRIMARY KEY,
	tipo ENUM('T.I', 'C.C', 'C.E')
);
CREATE TABLE Usuarios(
	n_documento VARCHAR(10) primary key,
	correoelectronico VARCHAR(255)NOT NULL,
	contrasena VARCHAR(255)NOT NULL,
	id_documento INT NOT NULL,
	FOREIGN KEY (id_documento) REFERENCES Documento(id) on delete cascade
);
CREATE TABLE Administrador(
	id INT AUTO_INCREMENT PRIMARY KEY,
    id_Usuario varchar(10) not null,
    id_rol int not null,
    Nombre varchar(100) not null,
    FOREIGN KEY (id_rol) REFERENCES Rol(id) on delete cascade,
    foreign key (id_Usuario) references Usuarios(n_documento) on delete cascade
);
CREATE TABLE Veterinario(
	id INT AUTO_INCREMENT PRIMARY KEY,
    id_Usuario varchar(10) not null,
    id_rol int not null,
    Nombre varchar(100) not null,
    FOREIGN KEY (id_rol) REFERENCES Rol(id) on delete cascade,
    foreign key (id_Usuario) references Usuarios(n_documento) on delete cascade
);
CREATE TABLE Cliente(
	id INT AUTO_INCREMENT PRIMARY KEY,
    id_Usuario varchar(10) not null,
    id_rol int not null,
    Nombre varchar(100) NOT NULL,
    FOREIGN KEY (id_rol) REFERENCES Rol(id) on delete cascade,
    foreign key (id_Usuario) references Usuarios(n_documento) on delete cascade
);
Create table Especie(
	id int auto_increment primary key,
    Especie enum ('Perro', 'Gato', 'Hamster', 'Aves')
);
Create table Raza(
	id int auto_increment primary key,
    Raza enum ('Huskie', 'Persa', 'Bullterrier', 'Atigrado')
);
CREATE TABLE Mascota(
	id int auto_increment primary key,
    id_Cliente int not null,
    Nombre varchar(45) not null,
    id_Especie int not null,
    id_Raza int not null,
    edad int not null,
    foreign key (id_Raza) references Raza(id) on delete cascade,
    foreign key (id_Cliente) references Cliente(id) on delete cascade,
    foreign key (id_Especie) references Especie(id) on delete cascade
);
create table Enfermedad(
	nombre varchar(60) primary key,
    descripcion text
);
Create table Servicios(
	id int auto_increment primary key,
    servicio enum ('1','2','3','4','5')
);
Create table Citas(
	id_Cliente int not null,
    id_Veterinario int not null,
    id_Mascota int not null,
	id_Servicio int not null,
    Fecha date not null,
    Descripcion varchar(255),
    foreign key (id_Veterinario) references Veterinario(id) on delete cascade,
    foreign key (id_Cliente) references Cliente(id) on delete cascade,
    foreign key (id_Mascota) references Mascota(id) on delete cascade,
    foreign key (id_Servicio) references Servicios(id) on delete cascade
);
Create table Alertas(
	id INT AUTO_INCREMENT PRIMARY KEY,
    id_Veterinario int not null, 
    id_Cliente int not null,
    id_Mascota int not null,
    Fecha date not null,
    descripcion TEXT not null,
    foreign key (id_Veterinario) references Veterinario(id) on delete cascade,
	foreign key (id_Mascota) references Mascota(id) on delete cascade,
    foreign key (id_Cliente) references Cliente(id) on delete cascade
);