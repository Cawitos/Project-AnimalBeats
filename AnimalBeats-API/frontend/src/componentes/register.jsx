import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/register.css'
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();

    const [tiposDocumento, setTiposDocumento] = useState([]);
    const [formData, setFormData] = useState({
        id_documento: '',
        n_documento: '',
        nombre: '',
        correoelectronico: '',
        contrasena: '',
        confirmarContrasena: '' // ✅ Nuevo campo
    });
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        axios.get('https://animalbeats-api.onrender.com/tiposDocumento')
            .then(res => setTiposDocumento(res.data))
            .catch(err => console.error('Error al obtener tipos de documento:', err));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✅ Validar que las contraseñas coincidan
        if (formData.contrasena !== formData.confirmarContrasena) {
            setMensaje('Las contraseñas no coinciden');
            return;
        }

        try {
            const { confirmarContrasena, ...dataToSend } = formData; // Excluir confirmarContrasena
            const res = await axios.post('https://animalbeats-api.onrender.com/registro', dataToSend);
            setMensaje(res.data.mensaje);

            setFormData({
                id_documento: '',
                n_documento: '',
                nombre: '',
                correoelectronico: '',
                contrasena: '',
                confirmarContrasena: ''
            });

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {
            console.error(error);
            setMensaje(error.response?.data?.mensaje || 'Error al registrar');
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h3>Registro de Usuario</h3>
                {mensaje && <div className="text-danger">{mensaje}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="campo">
                        <label className="form-label">Tipo de Documento</label>
                        <select
                            className="form-control select"
                            name="id_documento"
                            value={formData.id_documento}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Selecciona un tipo</option>
                            {tiposDocumento.map(doc => (
                                <option key={doc.id} value={doc.id}>{doc.tipo}</option>
                            ))}
                        </select>
                    </div>

                    <div className="campo">
                        <label className="form-label">Número de Documento</label>
                        <input
                            type="number"
                            className="form-control"
                            name="n_documento"
                            value={formData.n_documento}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="campo">
                        <label className="form-label">Nombre completo</label>
                        <input
                            type="text"
                            className="form-control"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="campo">
                        <label className="form-label">Correo Electrónico</label>
                        <input
                            type="email"
                            className="form-control"
                            name="correoelectronico"
                            value={formData.correoelectronico}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="campo">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            name="contrasena"
                            value={formData.contrasena}
                            onChange={handleChange}
                            required
                        />
                    </div>


                    <div className="campo">
                        <label className="form-label">Confirmar Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            name="confirmarContrasena"
                            value={formData.confirmarContrasena}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-register">Registrar</button>
                </form>
            </div>
        </div>
    );
};

export default Register;
