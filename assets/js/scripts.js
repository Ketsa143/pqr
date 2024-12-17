// Obtener tickets
function getTickets() {
    return JSON.parse(localStorage.getItem('pqrList') || '[]');
}

// Guardar tickets
function saveTickets(tickets) {
    localStorage.setItem('pqrList', JSON.stringify(tickets));
}

// Obtener historial
function getHistory() {
    return JSON.parse(localStorage.getItem('ticketHistory') || '[]');
}

// Guardar en historial
function saveToHistory(ticket) {
    const history = getHistory();
    history.push(ticket);
    localStorage.setItem('ticketHistory', JSON.stringify(history));
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('loggedUser');
    window.location.href = "../login.html";
}

// Función para cargar tickets según rol
function loadTicketsForRole(role) {
    const tickets = getTickets();
    const tbody = document.querySelector('#ticketTable tbody');
    tbody.innerHTML = '';

    const filteredTickets = tickets.filter(ticket => {
        if (role === 'asistente') {
            return true; // El asistente ve todos los tickets abiertos
        } else if (role === 'contador') {
            return ticket.asignadoA === 'contador' && ticket.estado === 'Abierto';
        } else if (role === 'administrador') {
            return ticket.asignadoA === 'admin' && ticket.estado === 'Abierto';
        }
    });

    filteredTickets.forEach(ticket => {
        const fileButton = ticket.archivoAdjunto
            ? `<a href="${ticket.archivoAdjunto}" download="Archivo_${ticket.id}" class="btn btn-info btn-sm">Ver Archivo</a>`
            : 'No disponible';

        const row = `
            <tr>
                <td>${ticket.id}</td>
                <td>${ticket.asunto}</td>
                <td>${ticket.estado}</td>
                <td>${ticket.asignadoA || "Sin asignar"}</td>
                <td>${fileButton}</td>
                <td>
                    ${role === 'asistente' ? `<button class="btn btn-warning btn-sm" onclick="assignTicket(${ticket.id})">Asignar</button>` : ''}
                    <button class="btn btn-info btn-sm" onclick="viewTicket(${ticket.id})">Ver</button>
                    <button class="btn btn-danger btn-sm" onclick="resolveTicket(${ticket.id})">Cerrar</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    if (filteredTickets.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay tickets disponibles.</td></tr>';
    }
}

// Función para asignar un ticket
// Función para asignar un ticket a un rol
function assignTicket(id) {
    const tickets = getTickets();
    const ticketIndex = tickets.findIndex(ticket => ticket.id === id);

    if (ticketIndex !== -1) {
        const roles = ['admin', 'contador'];
        const assignedTo = prompt("Asignar a (admin/contador):").toLowerCase();

        if (roles.includes(assignedTo)) {
            const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));

            // Crear una nueva entrada en el historial de asignaciones
            const assignment = {
                asignadoPor: loggedUser.username || 'Desconocido',
                asignadoA: assignedTo,
                fecha: new Date().toLocaleString(),
            };

            // Inicializar el historial si no existe
            if (!tickets[ticketIndex].historialAsignaciones) {
                tickets[ticketIndex].historialAsignaciones = [];
            }

            // Agregar la nueva asignación al historial
            tickets[ticketIndex].historialAsignaciones.push(assignment);
            tickets[ticketIndex].asignadoA = assignedTo; // Actualiza el asignado

            saveTickets(tickets); // Guarda los cambios en localStorage
            alert(`Ticket asignado a ${assignedTo}`);
            location.reload(); // Recargar para reflejar los cambios
        } else {
            alert("Rol no válido.");
        }
    } else {
        alert("No se encontró el ticket especificado.");
    }
}





// Función para cerrar un ticket con comentario
function resolveTicket(id, role) {
    const tickets = getTickets();
    const ticketIndex = tickets.findIndex(ticket => ticket.id === id);

    if (ticketIndex !== -1) {
        const comment = prompt("Agrega un comentario antes de cerrar este ticket:");
        if (!comment) {
            alert("No puedes cerrar un ticket sin agregar un comentario.");
            return;
        }

        const resolvedTicket = {
            ...tickets[ticketIndex],
            estado: "Cerrado",
            resueltoPor: role,
            comentario: comment,
            fechaCierre: new Date().toLocaleString(),
        };

        saveToHistory(resolvedTicket);
        tickets.splice(ticketIndex, 1);
        saveTickets(tickets);
        alert("Ticket cerrado y enviado al historial.");
        location.reload();
    }
}




// Función para ver detalles de un ticket
function viewTicket(ticketId) {
    localStorage.setItem('viewTicketId', ticketId); // Guarda el ID del ticket
    window.location.href = "../details.html"; // Cambia la redirección al nivel correcto
}





/**
 * Verifica si un usuario ha iniciado sesión y redirige al login si no lo ha hecho.
 * @param {string} expectedRole - El rol esperado para la página actual (opcional).
 */
function ensureLoggedIn(expectedRole) {
    const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));

    if (!loggedUser) {
        alert("No has iniciado sesión.");
        window.location.href = "../login.html";
        return;
    }

    if (expectedRole && loggedUser.role !== expectedRole) {
        alert("No tienes acceso a esta página.");
        window.location.href = `/pqr/roles/${loggedUser.role}.html`; // Redirige al panel del usuario correcto
    }
}

function createTicket(ticketData) {
    const tickets = getTickets();

    const newTicket = {
        ...ticketData,
        historialAsignaciones: [], // Inicializa el historial vacío
    };

    tickets.push(newTicket);
    saveTickets(tickets);
}
