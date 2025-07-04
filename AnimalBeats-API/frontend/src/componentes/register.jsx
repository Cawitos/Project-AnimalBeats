import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Register = () => {
    const navigate = useNavigate();

    const [tiposDocumento, setTiposDocumento] = useState([]);
    const [formData, setFormData] = useState({
        id_documento: '',
        n_documento: '',
        nombre: '',
        correoelectronico: '',
        contrasena: ''
    });
    const [mensaje, setMensaje] = useState('');

    // Obtener tipos de documento desde la ruta correcta
    useEffect(() => {
        axios.get('http://localhost:3000/tiposDocumento')
            .then(res => setTiposDocumento(res.data))
            .catch(err => console.error('Error al obtener tipos de documento:', err));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:3000/registro', formData);
            setMensaje(res.data.mensaje);

            // Limpiar el formulario
            setFormData({
                id_documento: '',
                n_documento: '',
                nombre: '',
                correoelectronico: '',
                contrasena: ''
            });

            // Redirigir según el rol
            setTimeout(() => {
                if (res.data.rol === 'admin') {
                    navigate('/admin');
                } else if (res.data.rol === 'veterinario') {
                    navigate('/veterinario');
                } else {
                    navigate('/cliente');
                }
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
                {mensaje && <div className="mensaje">{mensaje}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="campo">
                        <label>Tipo de Documento</label>
                        <select name="id_documento" value={formData.id_documento} onChange={handleChange} required>
                            <option value="">Selecciona un tipo</option>
                            {tiposDocumento.map(doc => (
                                <option key={doc.id} value={doc.id}>{doc.tipo}</option>
                            ))}
                        </select>
                    </div>

                    <div className="campo">
                        <label>Número de Documento</label>
                        <input type="number" name="n_documento" value={formData.n_documento} onChange={handleChange} required />
                    </div>

                    <div className="campo">
                        <label>Nombre completo</label>
                        <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                    </div>

                    <div className="campo">
                        <label>Correo Electrónico</label>
                        <input type="email" name="correoelectronico" value={formData.correoelectronico} onChange={handleChange} required />
                    </div>

                    <div className="campo">
                        <label>Contraseña</label>
                        <input type="password" name="contrasena" value={formData.contrasena} onChange={handleChange} required />
                    </div>

                    <button type="submit">Registrar</button>
                </form>
            </div>
        </div>
    );
};

export default Register;
