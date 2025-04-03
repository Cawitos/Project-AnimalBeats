document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalForm = document.getElementById('modal-form');
    const closeModal = document.querySelector('.close');

    const formTemplates = {
        general: `
            <label for="mascota">Nombre de la mascota:</label>
            <input type="text" id="mascota" name="mascota" required>
            
            <label for="fecha">Fecha de la cita:</label>
            <input type="date" id="fecha" name="fecha" required>
            
            <label for="idUsuario">Asignar por código de usuario</label>
            <input type="text" id="idUsuario" name="idUsuario" required>

            <label for="descripcion">Descripción:</label>
            <textarea id="descripcion" name="descripcion" rows="4" required></textarea>
            
            <button type="submit" class="subir">Programar Cita</button>
        `,
        urgencias: `
            <label for="mascota">Nombre de la mascota:</label>
            <input type="text" id="mascota" name="mascota" required>
            
            <label for="sintomas">Síntomas:</label>
            <textarea id="sintomas" name="sintomas" rows="4" required></textarea>
            
            <label for="fecha">Fecha de la urgencia:</label>
            <input type="datetime-local" id="fecha" name="fecha" required>

            <label for="idUsuario">Asignar por código de usuario</label>
            <input type="text" id="idUsuario" name="idUsuario" required>
            
            <button type="submit" class="subir">Registrar Urgencia</button>
        `,
        "bano-peluqueria": `
            <label for="mascota">Nombre de la mascota:</label>
            <input type="text" id="mascota" name="mascota" required>
            
            <label for="servicio">Tipo de servicio:</label>
            <select id="servicio" name="servicio" required>
                <option value="bano">Baño</option>
                <option value="peluqueria">Peluquería</option>
            </select>
            
            <label for="fecha">Fecha del servicio:</label>
            <input type="date" id="fecha" name="fecha" required>
                        
            <label for="idUsuario">Asignar por código de usuario</label>
            <input type="text" id="idUsuario" name="idUsuario" required>
            
            <button type="submit" class="subir">Agendar Servicio</button>
        `,
        vacunaciones: `
            <label for="mascota">Nombre de la mascota:</label>
            <input type="text" id="mascota" name="mascota" required>
            
            <label for="vacuna">Vacuna a aplicar:</label>
            <input type="text" id="vacuna" name="vacuna" required>
            
            <label for="fecha">Fecha de la cita:</label>
            <input type="date" id="fecha" name="fecha" required>
                        
            <label for="idUsuario">Asignar por código de usuario</label>
            <input type="text" id="idUsuario" name="idUsuario" required>
            
            <button type="submit" class="subir">Programar Vacunación</button>
        `,
        cardiologia: `
            <label for="mascota">Nombre de la mascota:</label>
            <input type="text" id="mascota" name="mascota" required>
            
            <label for="observaciones">Observaciones:</label>
            <textarea id="observaciones" name="observaciones" rows="4" required></textarea>
            
            <label for="fecha">Fecha de la cita:</label>
            <input type="date" id="fecha" name="fecha" required>
                        
            <label for="idUsuario">Asignar por código de usuario</label>
            <input type="text" id="idUsuario" name="idUsuario" required>
            
            <button type="submit" class="subir">Agendar Cita</button>
        `,
        nutricional: `
            <label for="mascota">Nombre de la mascota:</label>
            <input type="text" id="mascota" name="mascota" required>
            
            <label for="objetivo">Objetivo nutricional:</label>
            <textarea id="objetivo" name="objetivo" rows="4" required></textarea>
            
            <label for="fecha">Fecha de la consulta:</label>
            <input type="date" id="fecha" name="fecha" required>
                        
            <label for="idUsuario">Asignar por código de usuario</label>
            <input type="text" id="idUsuario" name="idUsuario" required>
            
            <button type="submit" class="subir">Programar Consulta</button>
        `
    };

    document.querySelectorAll('.modal-trigger').forEach(button => {
        button.addEventListener('click', () => {
            const title = button.getAttribute('data-title');
            const type = button.getAttribute('data-type');
            modalTitle.textContent = title;
            modalForm.innerHTML = formTemplates[type];
            modal.style.display = 'flex';
        });
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});
