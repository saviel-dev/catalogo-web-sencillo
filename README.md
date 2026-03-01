# TechCatalog - Catálogo de Streaming 🎬

TechCatalog es una aplicación web moderna diseñada para la venta de perfiles y cuentas completas de plataformas de streaming (Netflix, Prime Video, Disney+, HBO Max, Max, etc.). Está construido con un enfoque móvil primero (mobile-first), proporcionando una experiencia veloz, fluida y nativa directamente desde el navegador, con integración directa de pago y entrega a través de WhatsApp.

## 🚀 Características Principales

- **Diseño Responsivo:** Interfaz moderna e intuitiva que se adapta a cualquier tamaño de pantalla (Mobile, Tablet, Desktop).
- **Modo Oscuro / Claro:** Soporte incorporado y automático para Dark/Light mode, respetando las preferencias del sistema del usuario o el botón flotante manual.
- **Carrito de Compras Integrado:** Permite a los usuarios seleccionar múltiples productos, agrupar cantidades iguales y calcular el total dinámicamente.
- **Tasa de Cambio Dinámica:** Conversión en tiempo real de USD a Moneda Local (Bs.) empleando una tasa de cambio actualizable.
- **Checkout en 1 Clic (WhatsApp):** Los pedidos se estructuran de forma pulcra y se envían listos para confirmar a través de un link directo a la API de WhatsApp.
- **Filtrado Dinámico:** Búsqueda en tiempo real por nombre de producto y filtrado instantáneo por categorías.
- **Optimización SEO:** Configuración avanzada de metadatos *OpenGraph* y *Twitter Cards* para un perfecto renderizado y presentación estética al momento de compartir el enlace del catálogo en redes sociales y chats.
- **Arquitectura JSON:** Los datos de los productos se obtienen dinámicamente desde un simple y limpio `productos.json`, haciendo muy fácil actualizar precios y catálogos sin manipular el código fuente.

## 🛠️ Tecnologías Empleadas

- **Estructura base:** HTML5 y Vanilla JavaScript.
- **Estilos:** [Tailwind CSS (v3)](https://tailwindcss.com/) cargado mediante CDN con configuración modularizada.
- **Animaciones:** [Anime.js](https://animejs.com/) para transiciones muy suaves (Tarjetas, Carrito, FAQ, Modal, Skeleton Loadings, etc.).
- **Íconos:** [Lucide Icons](https://lucide.dev/) (alternativa moderna a Feather icons).

## 📁 Estructura del Proyecto

```text
catalogo-de-streaming/
│
├── assets/
│   ├── css/
│   │   └── styles.css          # Estilos base y animaciones de keyframes personalizadas
│   ├── data/
│   │   └── productos.json      # Base de Datos JSON del catálogo
│   ├── img/
│   │   ├── favicon.ico
│   │   ├── logo.png
│   │   └── placeholder.svg
│   └── js/
│       ├── main.js             # Lógica core (renderizado, carrito, búsqueda, API)
│       ├── tailwind.config.js  # Configuración y colores de Tailwind
│       └── theme.js            # Lógica para alternancia de Modo Oscuro
│
├── index.html                  # Punto de entrada de la aplicación
└── README.md                   # Documentación actual
```

## 💻 Instalación y Uso Local

Al ser un proyecto principalmente estático de frontend HTML/JS/CSS, no requiere Node.js ni procesos de compilación complejos para ejecutarlo localmente de forma inmediata:

1. Clona el repositorio:
   \`\`\`bash
   git clone <URL_DEL_REPOSITORIO>
   \`\`\`
2. Ingresa a la carpeta:
   \`\`\`bash
   cd catalogo-streaming
   \`\`\`
3. (Opcional pero Recomendado) Inicia un servidor web local para evitar inconvenientes de bloqueo de la política de CORS al solicitar el archivo JSON:
   - Utilizando la extensión **Live Server** de VSCode.
   - Utilizando Python: \`python -m http.server 3000\`
   - Utilizando Node: \`npx serve .\`
4. Abre `http://localhost:3000` (o el puerto respectivo) en tu navegador.

## 🤝 Contribuyendo / Autor

Diseñado y desarrollado por **Julián Herrera** ([Portfolio](https://julianherrera-dev.vercel.app/)). Todos los derechos reservados © 2026.
