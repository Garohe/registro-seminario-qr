let scannerActivo = true;
let contadorScan = 0;
let ultimoCodigo = '';

const html5QrCode = new Html5Qrcode("reader");

const config = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0
};

html5QrCode.start(
    { facingMode: "environment" },
    config,
    onScanSuccess,
    () => {}
).catch(() => {
    document.getElementById('reader').innerHTML =
        '<div style="padding:2.5rem;text-align:center;color:var(--gray-600);">' +
        '<div style="font-size:2.5rem;margin-bottom:0.5rem;">📷</div>' +
        '<p style="font-weight:600;margin-bottom:0.25rem;">No se pudo acceder a la camara</p>' +
        '<p style="font-size:0.85rem;color:var(--gray-400);">Use la entrada manual o verifique los permisos del navegador</p>' +
        '</div>';
    setStatus('Use la entrada manual para registrar', 'warn');
});

function setStatus(text, type) {
    const el = document.getElementById('scanner-status');
    el.textContent = text;
    el.className = 'scanner-status';
    if (type) el.classList.add('status-' + type);
}

function onScanSuccess(codigo) {
    if (!scannerActivo) return;
    if (codigo === ultimoCodigo) return;

    scannerActivo = false;
    ultimoCodigo = codigo;
    setStatus('Procesando...', 'busy');
    registrarAsistencia(codigo);

    setTimeout(() => {
        scannerActivo = true;
        ultimoCodigo = '';
    }, 3000);
}

function registrarManual(e) {
    e.preventDefault();
    const input = document.getElementById('codigo-manual');
    const codigo = input.value.trim().toUpperCase();
    if (codigo) {
        registrarAsistencia(codigo);
        input.value = '';
    }
}

function registrarAsistencia(codigo) {
    setStatus('Registrando ' + codigo + '...', 'busy');

    fetch('/api/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigo })
    })
    .then(r => r.json())
    .then(data => {
        data._codigo = codigo;
        mostrarResultado(data);
        if (data.status === 'ok') {
            contadorScan++;
            document.getElementById('scan-counter').textContent = contadorScan + ' escaneados';
            agregarHistorial(data.nombre, data.hora);
            setStatus('Listo - Escanee el siguiente codigo', 'ok');
        } else if (data.status === 'duplicado') {
            setStatus('Credencial ya escaneada - Escanee otro codigo', 'warn');
        } else {
            setStatus('Codigo no valido - Intente de nuevo', 'error');
        }
    })
    .catch(() => {
        mostrarResultado({
            status: 'error',
            message: 'Sin conexion al servidor. Verifique la red.',
            _codigo: codigo
        });
        setStatus('Error de conexion', 'error');
    });
}

function reintentar(codigo) {
    registrarAsistencia(codigo);
}

function mostrarResultado(data) {
    const div = document.getElementById('resultado');
    const icono = document.getElementById('resultado-icono');
    const nombre = document.getElementById('resultado-nombre');
    const mensaje = document.getElementById('resultado-mensaje');
    const detalle = document.getElementById('resultado-detalle');
    const acciones = document.getElementById('resultado-acciones');

    div.style.display = 'block';
    div.className = 'card resultado-card';
    acciones.innerHTML = '';
    detalle.innerHTML = '';

    if (data.status === 'ok') {
        div.classList.add('resultado-ok');
        icono.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#27ae60" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
        nombre.textContent = data.nombre;
        mensaje.textContent = 'Asistencia registrada correctamente';
        detalle.innerHTML = '<span class="resultado-hora">' + data.hora + '</span>';
        playSound(true);

    } else if (data.status === 'duplicado') {
        div.classList.add('resultado-duplicado');
        icono.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f39c12" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
        nombre.textContent = data.nombre;
        mensaje.textContent = 'Esta credencial ya fue escaneada';
        detalle.innerHTML = '<span class="resultado-hora">Registrado a las ' + data.hora + '</span>';
        playSound(false);

    } else {
        div.classList.add('resultado-error');
        icono.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
        nombre.textContent = data.message || 'Error desconocido';
        mensaje.textContent = 'No se pudo registrar la asistencia';
        detalle.innerHTML = '';

        const codigoRetry = data._codigo || '';
        if (codigoRetry) {
            acciones.innerHTML =
                '<button class="btn btn-primary btn-retry" onclick="reintentar(\'' + codigoRetry + '\')">' +
                'Reintentar' +
                '</button>';
        }
        playSound(false);
    }

    div.style.animation = 'none';
    div.offsetHeight;
    div.style.animation = 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
}

function agregarHistorial(nombre, horaStr) {
    const ul = document.getElementById('historial');
    if (ul.querySelector('.text-muted')) {
        ul.innerHTML = '';
    }
    const li = document.createElement('li');
    li.className = 'historial-item historial-new';
    const h = horaStr ? horaStr.split(' ')[1] : '';
    li.innerHTML =
        '<span class="historial-nombre">' + nombre + '</span>' +
        '<span class="historial-meta">' + h + '</span>';
    ul.insertBefore(li, ul.firstChild);
    if (ul.children.length > 20) ul.removeChild(ul.lastChild);
}

function playSound(success) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.value = 0.25;

        if (success) {
            osc.frequency.value = 880;
            osc.type = 'sine';
            osc.start();
            osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.25, ctx.currentTime + 0.15);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
            osc.stop(ctx.currentTime + 0.25);
        } else {
            osc.frequency.value = 280;
            osc.type = 'sine';
            osc.start();
            osc.frequency.setValueAtTime(220, ctx.currentTime + 0.15);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35);
            osc.stop(ctx.currentTime + 0.35);
        }
    } catch (e) {}
}
