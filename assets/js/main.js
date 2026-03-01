// --- DATOS Y ESTADO ---
const TASA_CAMBIO_POR_DEFECTO = 60.50;

// Función para formatear el precio en Bolívares (Bs.)
const formatearBs = (precioUSD, tasa) => {
    const tasaValida = typeof tasa === 'number' && !isNaN(tasa) ? tasa : TASA_CAMBIO_POR_DEFECTO;
    const precio = typeof precioUSD === 'number' ? precioUSD : parseFloat(precioUSD);
    const precioBs = precio * tasaValida;
    return precioBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Función para categorizar productos (Ya no es estrictamente necesaria porque viene del JSON, pero la dejamos por si acaso)
const obtenerCategoriaProducto = (nombre) => {
    return 'Varios';
};

// Función para asignar una imagen predeterminada según la categoría del Streaming
const obtenerImagenProducto = (categoria) => {
    switch (categoria) {
        case 'Streaming Audio': return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=500";
        case 'Streaming Video / Audio': return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=500";
        case 'Streaming IPTV': return "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=500";
        case 'Streaming Video': return "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=500";
        case 'Hogar y Salud': return "https://images.unsplash.com/photo-1544367563-12123d8965cd?auto=format&fit=crop&q=80&w=500";
        case 'Herramientas': return "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=500";
        case 'Streaming Video / Anime': return "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80&w=500";
        default: return "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=500";
    }
};

// Variables globales para almacenar los datos que vendrán del JSON
let PRODUCTOS_MOCK = [];
let DIAPOSITIVAS_CARRUSEL = [];
let CATEGORIAS = [];
let DATOS_FAQ = [];

// Estado global de la aplicación
let estado = {
    vista: 'home', // Vista actual (home, store, about, faq)
    tasaCambio: 60.50, // Tasa de cambio actual
    carrito: [], // Artículos en el carrito
    favoritos: [], // IDs de productos favoritos
    consultaBusqueda: '', // Término de búsqueda
    categoriaSeleccionada: 'Todas', // Filtro de categoría
    modoVista: 'grid', // Modo de visualización de la tienda (grid/list)
    paginaActual: 1, // Página de la tienda
    itemsPorPagina: 12, // Productos por página
    diapositivaActual: 0, // Índice del carrusel en el inicio
    productoModal: null, // Producto seleccionado para ver detalles
    cantidadModal: 1 // Cantidad a añadir desde el modal
};

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
    iniciarLucide(); // Cargar iconos
    reproducirAnimacionCarga(); // Mostrar pantalla de splash

    // Cargar los datos desde el archivo data.json primero
    await cargarDatosJSON();

    obtenerTasaCambio(); // Actualizar tasa de cambio del dólar

    // Configurar Inicio (Hero y Tendencias)
    renderizarCarrusel();
    setInterval(siguienteDiapositiva, 5000); // Autoplay del carrusel
    renderizarTendencias();

    // Configurar Tienda
    renderizarDesplegableCategorias();
    configurarListenerBusqueda();
    renderizarTienda();

    // Configurar Preguntas Frecuentes
    renderizarFAQ();
});

// Función para cargar los datos del catálogo desde un archivo JSON
async function cargarDatosJSON() {
    try {
        const respuesta = await fetch('assets/data/productos.json');
        if (!respuesta.ok) throw new Error('No se pudo cargar assets/data/productos.json');
        const datos = await respuesta.json();

        // Datos del Carrusel predeterminados por defecto al no existir en JSON de productos
        DIAPOSITIVAS_CARRUSEL = [
            {
                "title": "Catálogo de Streaming",
                "desc": "Las mejores plataformas de entretenimiento al mejor precio mensual.",
                "image": "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=1920&q=80"
            }
        ];

        let cats = new Set();
        let idCounter = 1;
        PRODUCTOS_MOCK = [];

        // Mapear los productos crudos para aplanar los planes en productos individuales
        datos.forEach((plat) => {
            if (plat.categoria) cats.add(plat.categoria);

            if (plat.planes && Array.isArray(plat.planes)) {
                plat.planes.forEach((plan) => {
                    const precioBs = plan.precioBs !== null ? plan.precioBs : 0;
                    const precioUSD = (precioBs / estado.tasaCambio).toFixed(2);

                    PRODUCTOS_MOCK.push({
                        id: idCounter++,
                        name: `${plat.plataforma} - ${plan.tipo}`,
                        category: plat.categoria,
                        price: precioUSD,
                        precioBsOriginal: precioBs,
                        rating: (Math.random() * 1.5 + 3.5).toFixed(1), // Rating simulado
                        description: `Disfruta de ${plat.plataforma} por ${plan.duracion}. Incluye ${plan.pantallas} pantalla(s).`,
                        image: obtenerImagenProducto(plat.categoria),
                        specs: [
                            `Plataforma: ${plat.plataforma}`,
                            `Plan: ${plan.tipo}`,
                            `Duración: ${plan.duracion}`,
                            `Pantallas: ${plan.pantallas}`
                        ],
                        agotado: plan.agotado
                    });
                });
            }
        });

        CATEGORIAS = [{ name: 'Todas', icon: 'list' }, ...Array.from(cats).map(c => ({ name: c, icon: 'tv' }))];

        // Cargar datos útiles de Preguntas Frecuentes
        DATOS_FAQ = [
            {
                category: "Pagos y Suscripciones",
                icon: "credit-card",
                questions: [
                    { q: "¿Cuáles son los métodos de pago aceptados?", a: "Aceptamos pagos a través de Pago Móvil, transferencias bancarias nacionales (Bs), Binance Pay y Zelle. Todo el proceso es verificado de forma segura a través de WhatsApp." },
                    { q: "¿Qué pasa si se me vence la suscripción?", a: "Te enviaremos un recordatorio 3 días antes del vencimiento. Puedes renovar fácilmente enviando un mensaje a nuestro WhatsApp con tu número de pedido o nombre de usuario." },
                    { q: "¿Debo pagar comisiones adicionales?", a: "No, el precio listado en la tienda es el precio final. Solo debes asegurarte de calcular correctamente el monto en bolívares según la tasa del día indicada al momento de pagar." }
                ]
            },
            {
                category: "Entrega y Activación",
                icon: "zap",
                questions: [
                    { q: "¿Cuánto tarda la entrega de mi cuenta?", a: "La entrega es prácticamente automática. Una vez que validamos y confirmamos tu pago vía WhatsApp, te enviamos los accesos (correo y contraseña) en menos de 5 Minutos." },
                    { q: "¿Son cuentas compartidas o privadas?", a: "El tipo de cuenta depende del plan que selecciones en el catálogo. Ofrecemos tanto pantallas individuales (perfiles en cuentas compartidas) como cuentas completas privadas. Verás este detalle en la descripción de cada producto." },
                    { q: "¿En qué dispositivos puedo usar mi cuenta?", a: "Puedes usarla en cualquier dispositivo compatible con la plataforma que adquieras: Smart TVs, teléfonos móviles, tablets, PCs, consolas de videojuegos, Roku, Fire TV, etc. Solo ten en cuenta el límite simultáneo de pantallas según tu plan." }
                ]
            },
            {
                category: "Soporte y Garantías",
                icon: "shield-check",
                questions: [
                    { q: "¿Qué pasa si se cae el servicio o tengo un problema?", a: "Todos nuestros servicios cuentan con garantía por el tiempo total contratado. Si experimentas un problema de acceso, una caída de señal o requieres cambio de clave, contáctanos al WhatsApp de soporte y lo solucionaremos de inmediato sin costo extra." },
                    { q: "¿Puedo cambiar la contraseña de la cuenta?", a: "Si adquiriste una cuenta completa privada, sí puedes cambiar la contraseña. Si compraste un perfil (pantalla), está estrictamente prohibido cambiar los datos de acceso del correo o la contraseña, ya que afectará a los demás usuarios. Hacerlo anula la garantía." }
                ]
            }
        ];

    } catch (error) {
        console.error("Error cargando los datos:", error);
        mostrarAlerta("Error", "No se pudieron cargar los productos del catálogo.", "info");
    }
}

// Inicializar la librería de iconos Lucide
function iniciarLucide() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// --- PANTALLA DE CARGA (SPLASH) ---
function reproducirAnimacionCarga() {
    if (window.anime) {
        const tl = window.anime.timeline({
            easing: 'easeOutExpo', complete: () => {
                document.getElementById('splash-screen').style.display = 'none';
            }
        });
        tl.add({ targets: '.splash-logo-bg', scale: [0, 1], opacity: [0, 1], rotate: '1turn', duration: 800 })
            .add({ targets: '.splash-logo-text', opacity: [0, 1], scale: [0.5, 1], duration: 600, offset: '-=400' })
            .add({ targets: '.splash-title', opacity: [0, 1], translateY: [20, 0], duration: 800, offset: '-=400' })
            .add({ targets: '#splash-screen', opacity: 0, duration: 600, delay: 500, easing: 'linear' });
    } else {
        setTimeout(() => document.getElementById('splash-screen').style.display = 'none', 2000);
    }
}

// --- NAVEGACIÓN ---
// Función para cambiar de vista (inicio, tienda, etc.)
function navegar(vista, categoria = null) {
    estado.vista = vista;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Ocultar todas las vistas
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    // Mostrar la seleccionada
    document.getElementById(`view-${vista}`).classList.add('active');

    // Actualizar estado activo en la barra de navegación
    document.querySelectorAll('.nav-link').forEach(el => {
        const span = el.querySelector('.line-active');
        if (el.getAttribute('data-target') === vista) {
            el.classList.add('text-blue-700');
            el.classList.remove('text-slate-600');
            span.classList.remove('w-0');
            span.classList.add('w-full');
        } else {
            el.classList.remove('text-blue-700');
            el.classList.add('text-slate-600');
            span.classList.add('w-0');
            span.classList.remove('w-full');
        }
    });

    // Validar si navegamos a la tienda con una categoría específica
    if (vista === 'store') {
        if (categoria) {
            estado.categoriaSeleccionada = categoria;
            document.getElementById('selected-category-text').innerText = categoria;
        }
        estado.paginaActual = 1;
        renderizarTienda();
    }
}

// Alternar menú móvil
function alternarMenuMovil() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
}

// --- API TASA DE CAMBIO ---
// Obtener la tasa oficial del dólar en Venezuela
async function obtenerTasaCambio() {
    try {
        const respuesta = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
        const datos = await respuesta.json();
        if (datos && datos.promedio) {
            estado.tasaCambio = datos.promedio;
            renderizarTendencias();
            renderizarTienda();
            actualizarUIcarrito();
        }
    } catch (error) { console.error("Error al obtener la tasa de cambio:", error); }
}

// --- ALERTAS (TOASTS) ---
let alertaActual = null;
function mostrarAlerta(titulo, mensaje, tipo = 'success') {
    const contenedor = document.getElementById('toast-container');
    contenedor.innerHTML = '';

    const div = document.createElement('div');
    div.className = 'pointer-events-auto flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-4 rounded-lg min-w-[300px] mb-2 transform origin-right opacity-0 transition-colors duration-300';

    const iconHTML = tipo === 'success'
        ? `<i data-lucide="check-circle" class="text-green-500 w-5 h-5"></i>`
        : `<i data-lucide="info" class="text-blue-500 w-5 h-5"></i>`;

    div.innerHTML = `
        ${iconHTML}
        <div class="flex-1">
            <p class="text-sm font-bold text-slate-900 dark:text-white transition-colors">${titulo}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 transition-colors">${mensaje}</p>
        </div>
    `;
    contenedor.appendChild(div);
    iniciarLucide();

    if (window.anime) {
        window.anime({
            targets: div,
            translateX: [50, 0],
            opacity: [0, 1],
            scale: [0.9, 1],
            easing: 'easeOutElastic(1, .8)',
            duration: 800
        });
    } else {
        div.style.opacity = '1';
    }

    if (alertaActual) clearTimeout(alertaActual);
    alertaActual = setTimeout(() => {
        if (window.anime) {
            window.anime({ targets: div, opacity: 0, translateX: 50, duration: 300, easing: 'easeInQuad', complete: () => div.remove() });
        } else {
            div.remove();
        }
    }, 3000);
}

// --- LÓGICA DE INICIO ---
// Renderizar el carrusel principal
function renderizarCarrusel() {
    const contenedor = document.getElementById('hero-slides-container');
    const indicadores = document.getElementById('hero-indicators');
    contenedor.innerHTML = '';
    indicadores.innerHTML = '';

    DIAPOSITIVAS_CARRUSEL.forEach((diapositiva, index) => {
        const esActual = index === estado.diapositivaActual;
        contenedor.innerHTML += `
            <div class="hero-slide absolute inset-0 transition-opacity duration-700 ease-in-out ${esActual ? 'opacity-100 z-10' : 'opacity-0 z-0'}">
                <div class="absolute inset-0 bg-black/50 z-10"></div>
                <img src="${diapositiva.image}" alt="${diapositiva.title}" class="hero-img w-full h-full object-cover" />
                <div class="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
                    <h2 class="hero-title text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">${diapositiva.title}</h2>
                    <p class="hero-desc text-lg md:text-xl text-slate-200 mb-8 max-w-2xl">${diapositiva.desc}</p>
                    <button onclick="navegar('store')" class="hero-btn inline-flex items-center justify-center px-8 py-3 text-base font-medium transition-colors border rounded-none bg-white text-blue-700 border-transparent hover:bg-slate-100">Ver Productos</button>
                </div>
            </div>
        `;
        indicadores.innerHTML += `<button onclick="irDiapositiva(${index})" class="w-12 h-1 transition-all ${esActual ? 'bg-blue-500' : 'bg-white/40 hover:bg-white/60'}"></button>`;
    });

    if (window.anime && DIAPOSITIVAS_CARRUSEL.length > 0) {
        // Animar la imagen del fondo (ligero zoom out)
        window.anime({ targets: '.hero-slide.opacity-100 .hero-img', scale: [1.1, 1], duration: 1500, easing: 'easeOutQuart' });

        // Animar el texto y botón (en cascada)
        window.anime.timeline({ easing: 'easeOutExpo' })
            .add({ targets: '.hero-slide.opacity-100 .hero-title', translateY: [30, 0], opacity: [0, 1], duration: 800, delay: 200 })
            .add({ targets: '.hero-slide.opacity-100 .hero-desc', translateY: [20, 0], opacity: [0, 1], duration: 800, offset: '-=500' })
            .add({ targets: '.hero-slide.opacity-100 .hero-btn', scale: [0.9, 1], opacity: [0, 1], duration: 800, offset: '-=500' });
    }
}
function siguienteDiapositiva() { estado.diapositivaActual = (estado.diapositivaActual + 1) % (DIAPOSITIVAS_CARRUSEL.length || 1); renderizarCarrusel(); }
function anteriorDiapositiva() { estado.diapositivaActual = (estado.diapositivaActual - 1 + DIAPOSITIVAS_CARRUSEL.length) % (DIAPOSITIVAS_CARRUSEL.length || 1); renderizarCarrusel(); }
function irDiapositiva(idx) { estado.diapositivaActual = idx; renderizarCarrusel(); }

// Renderizar productos en tendencia en el inicio (4 aleatorios)
function renderizarTendencias() {
    const contenedor = document.getElementById('trending-products-grid');
    if (PRODUCTOS_MOCK.length === 0) return;
    const revueltos = [...PRODUCTOS_MOCK].sort(() => 0.5 - Math.random());
    const tendencias = revueltos.slice(0, 4);
    contenedor.innerHTML = tendencias.map(producto => obtenerProductoHTML(producto, 'grid')).join('');
    iniciarLucide();
}

// --- LÓGICA DE TIENDA ---
// Renderizar las opciones de categorías en el filtro
function renderizarDesplegableCategorias() {
    const lista = document.getElementById('category-list');
    lista.innerHTML = CATEGORIAS.map(cat => `
        <button onclick="seleccionarCategoria('${cat.name}')" class="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${estado.categoriaSeleccionada === cat.name ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}">
            <i data-lucide="${cat.icon || 'tv'}" class="w-4 h-4"></i> ${cat.name}
        </button>
    `).join('');
    iniciarLucide();
}

function alternarMenuCategorias() {
    const menu = document.getElementById('category-menu');
    const chevron = document.getElementById('category-chevron');
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        chevron.classList.add('rotate-180');
    } else {
        menu.classList.add('hidden');
        chevron.classList.remove('rotate-180');
    }
}

function seleccionarCategoria(cat) {
    estado.categoriaSeleccionada = cat;
    document.getElementById('selected-category-text').innerText = cat;
    estado.paginaActual = 1;
    alternarMenuCategorias();
    renderizarDesplegableCategorias();
    renderizarTienda();
}

function configurarListenerBusqueda() {
    document.getElementById('search-input').addEventListener('input', (e) => {
        estado.consultaBusqueda = e.target.value;
        estado.paginaActual = 1;
        renderizarTienda();
    });
}

function establecerModoVista(modo) {
    estado.modoVista = modo;
    document.getElementById('btn-view-grid').className = `p-1.5 rounded-md transition-all ${modo === 'grid' ? 'bg-slate-100 dark:bg-slate-700 text-blue-700 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`;
    document.getElementById('btn-view-list').className = `p-1.5 rounded-md transition-all ${modo === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-blue-700 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`;
    renderizarTienda();
}

// Renderizar la lista de productos filtrados y paginados
function renderizarTienda() {
    // Filtrar por búsqueda y categoría
    const filtrados = PRODUCTOS_MOCK.filter(p => {
        const coincideBusqueda = p.name.toLowerCase().includes(estado.consultaBusqueda.toLowerCase()) || p.description.toLowerCase().includes(estado.consultaBusqueda.toLowerCase());
        const coincideCat = estado.categoriaSeleccionada === 'Todas' || p.category === estado.categoriaSeleccionada;
        return coincideBusqueda && coincideCat;
    });

    document.getElementById('products-count-text').innerText = `${filtrados.length} productos`;

    const contenedor = document.getElementById('store-products-container');
    const estadoVacio = document.getElementById('store-empty-state');
    const contenedorPaginacion = document.getElementById('pagination-container');

    if (filtrados.length === 0) {
        contenedor.style.display = 'none';
        estadoVacio.style.display = 'block';
        contenedorPaginacion.innerHTML = '';
        return;
    }

    contenedor.style.display = estado.modoVista === 'grid' ? 'grid' : 'flex';
    contenedor.className = estado.modoVista === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full'
        : 'flex flex-col gap-4 w-full';

    estadoVacio.style.display = 'none';

    // Lógica de Paginación
    const totalPaginas = Math.ceil(filtrados.length / estado.itemsPorPagina);
    const productosActuales = filtrados.slice((estado.paginaActual - 1) * estado.itemsPorPagina, estado.paginaActual * estado.itemsPorPagina);

    contenedor.innerHTML = productosActuales.map(p => obtenerProductoHTML(p, estado.modoVista)).join('');

    // Animación chula para la carga de productos
    if (window.anime) {
        const hijos = contenedor.children;
        window.anime.set(hijos, { opacity: 0, translateY: 20 });
        window.anime({ targets: hijos, opacity: 1, translateY: 0, duration: 300, easing: 'easeOutQuad', delay: window.anime.stagger(30) });
    }

    renderizarPaginacion(totalPaginas);
    iniciarLucide();
}

// Template de HTML para los productos (card de grilla o lista)
function obtenerProductoHTML(producto, modo) {
    if (modo === 'grid') {
        return `
            <div class="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 flex flex-col h-full rounded-xl overflow-hidden shadow-sm hover:shadow-md">
                <div class="aspect-square bg-slate-100 dark:bg-slate-900 overflow-hidden relative cursor-pointer" onclick="abrirModalProducto(${producto.id})">
                   <img src="${producto.image}" alt="${producto.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button class="bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 rounded-md w-10 h-10 p-0 flex items-center justify-center shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onclick="event.stopPropagation(); añadirAlCarrito(${producto.id}, 1)"><i data-lucide="shopping-cart" class="w-5 h-5"></i></button>
                      <button class="bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 rounded-md w-10 h-10 p-0 flex items-center justify-center shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" onclick="event.stopPropagation(); abrirModalProducto(${producto.id})"><i data-lucide="eye" class="w-5 h-5"></i></button>
                   </div>
                </div>
                <div class="p-4 flex flex-col flex-grow">
                  <span class="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase mb-1 transition-colors">${producto.category}</span>
                  <h3 class="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-2 line-clamp-2 hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer transition-colors" onclick="abrirModalProducto(${producto.id})">${producto.name}</h3>
                  <div class="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col items-start gap-1 transition-colors">
                    <div class="w-full flex items-center justify-between"><span class="text-lg font-bold text-slate-900 dark:text-white transition-colors">$${producto.price}</span><div class="flex items-center gap-1 text-yellow-500 text-xs"><i data-lucide="star" class="w-3 h-3 fill-current"></i>${producto.rating}</div></div>
                    <span class="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors">Bs. ${formatearBs(producto.price, estado.tasaCambio)}</span>
                  </div>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col sm:flex-row items-center p-4 gap-6 rounded-xl shadow-sm hover:shadow-md">
                <div class="w-full sm:w-48 h-48 sm:h-32 bg-slate-100 dark:bg-slate-900 shrink-0 cursor-pointer rounded-lg overflow-hidden transition-colors" onclick="abrirModalProducto(${producto.id})">
                    <img src="${producto.image}" alt="${producto.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div class="flex-grow text-center sm:text-left">
                  <span class="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase transition-colors">${producto.category}</span>
                  <h3 class="font-bold text-slate-900 dark:text-white text-xl mb-2 hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer transition-colors" onclick="abrirModalProducto(${producto.id})">${producto.name}</h3>
                  <p class="text-slate-500 dark:text-slate-400 text-sm mb-4 max-w-2xl line-clamp-2 transition-colors">${producto.description}</p>
                </div>
                <div class="flex flex-col items-center sm:items-end gap-1 min-w-[120px]">
                  <span class="text-xl font-bold text-slate-900 dark:text-white transition-colors">$${producto.price}</span>
                  <span class="text-sm text-slate-500 dark:text-slate-400 font-medium mb-3 transition-colors">Bs. ${formatearBs(producto.price, estado.tasaCambio)}</span>
                  <button class="bg-blue-700 text-white hover:bg-blue-800 w-full py-2 text-xs font-medium rounded-none transition-colors" onclick="añadirAlCarrito(${producto.id}, 1)">Añadir</button>
                  <button onclick="abrirModalProducto(${producto.id})" class="text-blue-700 dark:text-blue-400 text-sm font-medium hover:underline mt-1 transition-colors">Ver detalles</button>
                </div>
            </div>
        `;
    }
}

// Interfaz gráfica para la paginación con puntos suspensivos
function renderizarPaginacion(totalPaginas) {
    const contenedor = document.getElementById('pagination-container');
    if (totalPaginas <= 1) { contenedor.innerHTML = ''; return; }

    const delta = 1;
    const rango = [];
    const rangoConPuntos = [];
    let l;

    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= estado.paginaActual - delta && i <= estado.paginaActual + delta)) {
            rango.push(i);
        }
    }

    for (let i of rango) {
        if (l) {
            if (i - l === 2) { rangoConPuntos.push(l + 1); }
            else if (i - l !== 1) { rangoConPuntos.push('...'); }
        }
        rangoConPuntos.push(i);
        l = i;
    }

    let html = `<button onclick="cambiarPagina(${Math.max(1, estado.paginaActual - 1)})" ${estado.paginaActual === 1 ? 'disabled' : ''} class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600 dark:text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700" aria-label="Página anterior"><i data-lucide="chevron-left" class="w-4 h-4"></i></button>`;

    html += `<div class="flex gap-1">`;
    rangoConPuntos.forEach(pagina => {
        if (pagina === '...') {
            html += `<button disabled class="w-8 h-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center text-slate-400 dark:text-slate-500 cursor-default bg-transparent">...</button>`;
        } else {
            const esActiva = pagina === estado.paginaActual;
            const clases = esActiva
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-none'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700';
            html += `<button onclick="cambiarPagina(${pagina})" class="w-8 h-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center ${clases}">${pagina}</button>`;
        }
    });
    html += `</div>`;

    html += `<button onclick="cambiarPagina(${Math.min(totalPaginas, estado.paginaActual + 1)})" ${estado.paginaActual === totalPaginas ? 'disabled' : ''} class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600 dark:text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700" aria-label="Página siguiente"><i data-lucide="chevron-right" class="w-4 h-4"></i></button>`;

    contenedor.innerHTML = html;
}

function cambiarPagina(p) {
    estado.paginaActual = p;
    renderizarTienda();
    // Hacer scroll de vuelta al top de la tienda
    window.scrollTo({ top: document.getElementById('view-store').offsetTop - 80, behavior: 'smooth' });
}

// --- MODAL DE PRODUCTOS ---
// Abre el modal para ver los detalles de un producto específico
function abrirModalProducto(id) {
    const producto = PRODUCTOS_MOCK.find(p => p.id === id);
    if (!producto) return;
    estado.productoModal = producto;
    estado.cantidadModal = 1;

    const esFav = estado.favoritos.includes(producto.id);
    const claseFav = esFav ? 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/30 text-yellow-600 dark:text-yellow-400' : 'text-slate-700 dark:text-slate-300 bg-transparent border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800';
    const rellenoEstrella = esFav ? 'fill-current text-yellow-500 dark:text-yellow-400' : 'text-slate-400 dark:text-slate-500';

    const htmlEspecificaciones = producto.specs.map(spec => `<li class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 transition-colors"><div class="w-4 h-4 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center shrink-0"><i data-lucide="check" class="w-2.5 h-2.5 text-blue-600 dark:text-blue-400"></i></div>${spec}</li>`).join('');

    const html = `
        <button onclick="cerrarModalProducto()" class="absolute top-2 right-2 z-10 p-1 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 rounded-full md:hidden transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
        <div class="w-full md:w-5/12 bg-slate-100 dark:bg-slate-900 relative group transition-colors">
          <img src="${producto.image}" alt="${producto.name}" class="w-full h-48 md:h-full object-cover" />
          <div class="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider transition-colors">${producto.category}</div>
        </div>
        <div class="w-full md:w-7/12 p-5 flex flex-col">
          <div class="flex justify-between items-start mb-2">
            <div>
               <h2 class="text-xl font-bold text-slate-900 dark:text-white leading-tight transition-colors">${producto.name}</h2>
               <div class="flex items-center gap-1 text-yellow-500 dark:text-yellow-400 text-xs mt-1"><i data-lucide="star" class="w-3 h-3 fill-current"></i><span class="text-slate-700 dark:text-slate-300 font-medium ml-1 transition-colors">${producto.rating}</span><span class="text-slate-400 dark:text-slate-500 font-normal ml-1">(124)</span></div>
            </div>
            <button onclick="cerrarModalProducto()" class="hidden md:block p-1 -mr-2 -mt-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
          </div>
          <div class="mb-4 border-b border-slate-100 dark:border-slate-800 pb-3 transition-colors">
            <div class="text-3xl font-light text-slate-900 dark:text-white leading-none mb-1 transition-colors">$${producto.price}</div>
            <div class="text-lg font-medium text-slate-500 dark:text-slate-400 leading-none transition-colors">Bs. ${formatearBs(producto.price, estado.tasaCambio)}</div>
          </div>
          <div class="mb-4"><p class="text-slate-600 dark:text-slate-400 leading-snug text-sm line-clamp-3 transition-colors">${producto.description}</p></div>
          <div class="mb-5 flex-grow">
            <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-2 transition-colors">Especificaciones</h3>
            <ul class="grid grid-cols-1 gap-1">${htmlEspecificaciones}</ul>
          </div>
          <div class="mt-auto flex flex-col gap-4">
             <div class="flex items-center gap-3">
                <span class="text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">Cantidad:</span>
                <div class="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg transition-colors">
                    <button onclick="actualizarCantidadModal(-1)" class="px-3 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold">-</button>
                    <span id="modal-qty-text" class="px-3 py-1 text-sm font-medium text-slate-900 dark:text-white border-l border-r border-slate-200 dark:border-slate-700 transition-colors min-w-[2.5rem] text-center">${estado.cantidadModal}</span>
                    <button onclick="actualizarCantidadModal(1)" class="px-3 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold">+</button>
                </div>
             </div>
             <div class="flex gap-2">
                <button onclick="añadirAlCarritoDesdeModal()" class="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm h-9 font-medium transition-colors border rounded-none bg-blue-700 text-white border-transparent hover:bg-blue-800 hover:shadow-lg transform active:scale-95"><i data-lucide="shopping-cart" class="w-4 h-4 mr-2"></i> Añadir al carrito</button>
                <button onclick="alternarFavorito(${producto.id})" class="px-3 h-9 inline-flex items-center justify-center text-sm font-medium transition-colors border rounded-none ${claseFav}"><i data-lucide="star" class="w-4 h-4 transition-transform duration-300 ${rellenoEstrella}"></i></button>
             </div>
          </div>
        </div>
    `;

    const modal = document.getElementById('product-modal');
    const contenido = document.getElementById('product-modal-content');
    contenido.innerHTML = html;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    iniciarLucide();

    // Animación de aparición
    if (window.anime) {
        contenido.style.opacity = 0;
        window.anime({ targets: contenido, opacity: [0, 1], translateY: [50, 0], scale: [0.95, 1], easing: 'easeOutExpo', duration: 400 });
    } else {
        contenido.style.opacity = 1;
        contenido.style.transform = 'translateY(0)';
    }
}

function cerrarModalProducto() {
    document.getElementById('product-modal').classList.add('hidden');
    document.getElementById('product-modal').classList.remove('flex');
}

function actualizarCantidadModal(cambio) {
    estado.cantidadModal = Math.max(1, estado.cantidadModal + cambio);
    document.getElementById('modal-qty-text').innerText = estado.cantidadModal;
}

function añadirAlCarritoDesdeModal() {
    if (estado.productoModal) {
        añadirAlCarrito(estado.productoModal.id, estado.cantidadModal);
        cerrarModalProducto();
    }
}

function alternarFavorito(idProducto) {
    const producto = PRODUCTOS_MOCK.find(p => p.id === idProducto);
    if (!producto) return;
    const esFav = estado.favoritos.includes(idProducto);
    if (esFav) {
        estado.favoritos = estado.favoritos.filter(id => id !== idProducto);
        mostrarAlerta('Eliminado de favoritos', `${producto.name} ya no está en favoritos.`, 'info');
    } else {
        estado.favoritos.push(idProducto);
        mostrarAlerta('¡Añadido a favoritos!', `${producto.name} guardado para luego.`, 'success');
    }
    abrirModalProducto(idProducto);
}

// --- CARRITO Y SIDEBAR ---
function añadirAlCarrito(idProducto, cant = 1, silencioso = false) {
    const producto = PRODUCTOS_MOCK.find(p => p.id === idProducto);
    if (!producto) return;
    for (let i = 0; i < cant; i++) estado.carrito.push(producto);
    actualizarUIcarrito();
    if (!silencioso) {
        mostrarAlerta('¡Añadido al carrito!', `${cant} x ${producto.name} añadido(s).`, 'success');
    }
}

function eliminarDelCarrito(idProducto, todas = true) {
    if (todas) {
        estado.carrito = estado.carrito.filter(p => p.id !== idProducto);
        mostrarAlerta('Producto eliminado', 'El artículo ha sido removido del carrito.', 'info');
    } else {
        const idx = estado.carrito.findIndex(p => p.id === idProducto);
        if (idx > -1) estado.carrito.splice(idx, 1);
    }
    actualizarUIcarrito();
}

function actualizarUIcarrito() {
    const insignia = document.getElementById('cart-badge');
    const conteoMovil = document.getElementById('mobile-cart-count');
    const longitud = estado.carrito.length;

    conteoMovil.innerText = longitud;
    if (longitud > 0) {
        insignia.innerText = longitud;
        insignia.classList.remove('hidden');
        if (window.anime) {
            window.anime({ targets: '#cart-btn i', rotate: [0, 12, -12, 0], scale: [1, 1.2, 1], duration: 400 });
            window.anime({ targets: insignia, scale: [1, 1.3, 1], duration: 400 });
        }
    } else {
        insignia.classList.add('hidden');
    }

    if (!document.getElementById('cart-sidebar-container').classList.contains('hidden')) {
        renderizarContenidoSidebarCarrito();
    }
}

function alternarSidebarCarrito() {
    const contenedor = document.getElementById('cart-sidebar-container');
    const sidebar = document.getElementById('cart-sidebar');

    if (contenedor.classList.contains('hidden')) {
        contenedor.classList.remove('hidden');
        contenedor.classList.add('flex');
        renderizarContenidoSidebarCarrito();
        if (window.anime) {
            window.anime({ targets: sidebar, translateX: ['100%', '0%'], opacity: [0.5, 1], easing: 'easeOutExpo', duration: 600 });
        } else {
            sidebar.style.transform = 'translateX(0)';
        }
    } else {
        if (window.anime) {
            window.anime({
                targets: sidebar, translateX: ['0%', '100%'], opacity: [1, 0.5], easing: 'easeInExpo', duration: 400, complete: () => {
                    contenedor.classList.add('hidden');
                    contenedor.classList.remove('flex');
                }
            });
        } else {
            contenedor.classList.add('hidden');
            contenedor.classList.remove('flex');
        }
    }
}

function enviarPedidoWhatsApp() {
    if (estado.carrito.length === 0) {
        mostrarAlerta("Carrito vacío", "Por favor añade algunos productos antes de finalizar la compra.", "info");
        return;
    }

    // Agrupar productos para mostrar cantidad y subtotales correctamente
    const conteoItems = {};
    let totalUSD = 0;

    estado.carrito.forEach(item => {
        if (!conteoItems[item.id]) {
            conteoItems[item.id] = {
                nombre: item.name,
                precioUnitario: parseFloat(item.price),
                cantidad: 0
            };
        }
        conteoItems[item.id].cantidad++;
        totalUSD += parseFloat(item.price);
    });

    let mensaje = "Hola, buen día. Me gustaría ordenar lo siguiente:\n\n";

    Object.values(conteoItems).forEach(item => {
        const subtotalUSD = item.precioUnitario * item.cantidad;
        mensaje += `* ${item.cantidad}x ${item.nombre}\n`;
        mensaje += `  $${subtotalUSD.toFixed(2)} / Bs. ${formatearBs(subtotalUSD, estado.tasaCambio)}\n\n`;
    });

    mensaje += `Total: $${totalUSD.toFixed(2)} / Bs. ${formatearBs(totalUSD, estado.tasaCambio)}\n\n`;
    mensaje += "Quedo a la espera de datos y monto para proceder a pagar.";

    const numeroWhatsApp = "584122865550";
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

function renderizarContenidoSidebarCarrito() {
    document.getElementById('cart-item-count-text').innerText = `${estado.carrito.length} productos`;
    const lista = document.getElementById('cart-items-list');
    const pie = document.getElementById('cart-footer');

    if (estado.carrito.length === 0) {
        lista.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-center p-8">
               <div class="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-300 dark:text-slate-600 transition-colors"><i data-lucide="shopping-bag" class="w-10 h-10"></i></div>
               <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 transition-colors">Tu carrito está vacío</h3>
               <p class="text-slate-500 dark:text-slate-400 text-sm mb-6 transition-colors">¡Parece que aún no has añadido nada! Explora nuestra tienda para encontrar lo mejor en tecnología.</p>
               <button onclick="alternarSidebarCarrito(); navegar('store');" class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors border rounded-none bg-blue-700 text-white border-transparent hover:bg-blue-800">Empezar a comprar</button>
            </div>
        `;
        pie.classList.add('hidden');
    } else {
        const conteoItems = {};
        estado.carrito.forEach(item => {
            if (!conteoItems[item.id]) {
                conteoItems[item.id] = { ...item, cantidad: 0 };
            }
            conteoItems[item.id].cantidad++;
        });

        lista.innerHTML = Object.values(conteoItems).map(item => `
            <div class="flex gap-4 p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-blue-100 dark:hover:border-blue-500/50 hover:shadow-sm transition-all group">
                <div class="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 transition-colors relative">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover" />
                    <span class="absolute top-0 right-0 bg-blue-700/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg">x${item.cantidad}</span>
                </div>
                <div class="flex-grow flex flex-col justify-between">
                  <div>
                      <h4 class="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 transition-colors">${item.name}</h4>
                      <span class="text-xs text-slate-500 dark:text-slate-400 transition-colors">${item.category}</span>
                  </div>
                  <div class="flex justify-between items-end mt-2">
                    <div class="flex flex-col">
                        <span class="font-bold text-blue-700 dark:text-blue-400 text-sm transition-colors">$${(item.price * item.cantidad).toFixed(2)}</span>
                        <span class="text-[10px] text-slate-400 dark:text-slate-500 transition-colors">Bs. ${formatearBs(item.price * item.cantidad, estado.tasaCambio)}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <div class="flex items-center bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 transition-colors">
                            <button onclick="eliminarDelCarrito(${item.id}, false)" class="p-1 px-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-slate-500 dark:text-slate-400"><i data-lucide="minus" class="w-3 h-3"></i></button>
                            <span class="text-xs font-bold w-4 text-center text-slate-700 dark:text-slate-300">${item.cantidad}</span>
                            <button onclick="añadirAlCarrito(${item.id}, 1, true)" class="p-1 px-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-slate-500 dark:text-slate-400"><i data-lucide="plus" class="w-3 h-3"></i></button>
                        </div>
                        <button onclick="eliminarDelCarrito(${item.id}, true)" class="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors" title="Eliminar producto"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                  </div>
                </div>
            </div>
        `).join('');

        const totalUSD = estado.carrito.reduce((suma, item) => suma + parseFloat(item.price), 0);
        document.getElementById('cart-subtotal-usd').innerText = `$${totalUSD.toFixed(2)}`;
        document.getElementById('cart-total-usd').innerText = `$${totalUSD.toFixed(2)}`;
        document.getElementById('cart-total-bs').innerText = `Bs. ${formatearBs(totalUSD, estado.tasaCambio)}`;
        pie.classList.remove('hidden');
    }
    iniciarLucide();
}

// --- PREGUNTAS FRECUENTES (FAQ) ---
function renderizarFAQ() {
    const contenedor = document.getElementById('faq-container');
    if (!DATOS_FAQ || DATOS_FAQ.length === 0) return;

    contenedor.innerHTML = DATOS_FAQ.map((cat, indiceCat) => `
        <div class="faq-card bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors duration-300 transform">
            <div class="bg-slate-50/50 dark:bg-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 transition-colors">
                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center text-blue-700 dark:text-blue-400 transition-colors"><i data-lucide="${cat.icon}" class="w-4 h-4"></i></div>
                <h3 class="font-bold text-slate-900 dark:text-white transition-colors">${cat.category}</h3>
            </div>
            <div class="px-6 py-2">
                ${cat.questions.map((q, indiceQ) => `
                    <div class="border-b border-slate-200 dark:border-slate-700 last:border-0 transition-colors">
                        <button onclick="alternarFAQ('faq-${indiceCat}-${indiceQ}')" class="w-full flex items-center justify-between py-4 text-left focus:outline-none group">
                            <span class="font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors" id="faq-text-${indiceCat}-${indiceQ}">${q.q}</span>
                            <div class="p-1 rounded-full text-slate-400 dark:text-slate-500 group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors" id="faq-icon-bg-${indiceCat}-${indiceQ}">
                                <i data-lucide="plus" class="w-4 h-4 transform transition-transform duration-300 rotate-0" id="faq-icon-${indiceCat}-${indiceQ}"></i>
                            </div>
                        </button>
                        <div id="faq-${indiceCat}-${indiceQ}" class="overflow-hidden transition-all duration-300 ease-in-out" style="max-height: 0px;">
                            <p class="text-slate-500 dark:text-slate-400 text-sm pb-4 leading-relaxed transition-colors">${q.a}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    iniciarLucide();

    // Animación de entrada de las tarjetas FAQ
    if (window.anime) {
        const tarjetas = document.querySelectorAll('.faq-card');
        window.anime.set(tarjetas, { opacity: 0, translateY: 30 });

        // El IntersectionObserver asegura que se animen cuando aparezcan en pantalla
        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach(entrada => {
                if (entrada.isIntersecting) {
                    window.anime({
                        targets: entrada.target,
                        opacity: 1,
                        translateY: 0,
                        duration: 600,
                        easing: 'easeOutQuart'
                    });
                    observador.unobserve(entrada.target);
                }
            });
        }, { threshold: 0.1 });

        tarjetas.forEach(t => observador.observe(t));
    }
}

function alternarFAQ(id) {
    const contenido = document.getElementById(id);
    const icono = document.getElementById(id.replace('faq-', 'faq-icon-'));
    const texto = document.getElementById(id.replace('faq-', 'faq-text-'));
    const fondoIcono = document.getElementById(id.replace('faq-', 'faq-icon-bg-'));

    if (contenido.style.maxHeight === '0px') {
        contenido.style.maxHeight = contenido.scrollHeight + "px";
        icono.setAttribute('data-lucide', 'minus');
        icono.classList.replace('rotate-0', 'rotate-180');
        texto.classList.replace('text-slate-700', 'text-blue-700');
        texto.classList.replace('dark:text-slate-300', 'dark:text-blue-400');
        fondoIcono.classList.replace('text-slate-400', 'text-blue-700');
        fondoIcono.classList.replace('dark:text-slate-500', 'dark:text-blue-400');
        fondoIcono.classList.add('bg-blue-100', 'dark:bg-blue-900/40');
    } else {
        contenido.style.maxHeight = '0px';
        icono.setAttribute('data-lucide', 'plus');
        icono.classList.replace('rotate-180', 'rotate-0');
        texto.classList.replace('text-blue-700', 'text-slate-700');
        texto.classList.replace('dark:text-blue-400', 'dark:text-slate-300');
        fondoIcono.classList.replace('text-blue-700', 'text-slate-400');
        fondoIcono.classList.replace('dark:text-blue-400', 'dark:text-slate-500');
        fondoIcono.classList.remove('bg-blue-100', 'dark:bg-blue-900/40');
    }
    iniciarLucide();
}
