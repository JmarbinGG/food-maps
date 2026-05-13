// Runtime DOM auto-translator for English <-> Spanish.
//
// Companion to utils/i18n.js. Walks the rendered DOM and swaps text
// nodes + key attributes (placeholder, title, aria-label, alt, value
// on submit/button inputs) using a phrase dictionary. A MutationObserver
// re-runs translation whenever React renders new content, so the toggle
// affects everything visible without needing to instrument every
// component.
//
// To extend: add entries to PHRASES below (English -> Spanish), or call
// window.i18nAuto.addPhrases({ "English text": "Texto en español" }).

(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.i18nAuto) return; // idempotent

  // ---------------------------------------------------------------
  // Phrase dictionary (English -> Spanish). Keys must match the EXACT
  // trimmed text that appears in the rendered DOM. Whitespace around
  // the original text is preserved automatically.
  // ---------------------------------------------------------------
  const PHRASES = {
    // -------- Common UI --------
    'Loading': 'Cargando',
    'Loading...': 'Cargando...',
    'Loading…': 'Cargando…',
    'Save': 'Guardar',
    'Saving...': 'Guardando...',
    'Saving…': 'Guardando…',
    'Cancel': 'Cancelar',
    'Close': 'Cerrar',
    'Delete': 'Eliminar',
    'Edit': 'Editar',
    'Remove': 'Quitar',
    'Update': 'Actualizar',
    'Submit': 'Enviar',
    'Send': 'Enviar',
    'Continue': 'Continuar',
    'Back': 'Atrás',
    'Next': 'Siguiente',
    'Previous': 'Anterior',
    'Done': 'Listo',
    'Confirm': 'Confirmar',
    'Yes': 'Sí',
    'No': 'No',
    'OK': 'OK',
    'Search': 'Buscar',
    'Search...': 'Buscar...',
    'Filter': 'Filtrar',
    'Filters': 'Filtros',
    'Reset': 'Restablecer',
    'Apply': 'Aplicar',
    'Add': 'Agregar',
    'Refresh': 'Actualizar',
    'Retry': 'Reintentar',
    'View': 'Ver',
    'View All': 'Ver todo',
    'View Details': 'Ver detalles',
    'Show All': 'Mostrar todo',
    'Show Less': 'Mostrar menos',
    'Show More': 'Mostrar más',
    'See more': 'Ver más',
    'See less': 'Ver menos',
    'Sign in': 'Iniciar sesión',
    'Sign In': 'Iniciar sesión',
    'Sign Up': 'Registrarse',
    'Sign Out': 'Cerrar sesión',
    'Log in': 'Iniciar sesión',
    'Log In': 'Iniciar sesión',
    'Login': 'Iniciar sesión',
    'Logout': 'Cerrar sesión',
    'Register': 'Registrarse',
    'Optional': 'Opcional',
    'Required': 'Requerido',
    'Select': 'Seleccionar',
    'Select Type': 'Seleccionar tipo',
    'Select an option': 'Seleccione una opción',
    'None': 'Ninguno',
    'All': 'Todo',
    'Status': 'Estado',
    'Type': 'Tipo',
    'Name': 'Nombre',
    'Email': 'Correo electrónico',
    'Phone': 'Teléfono',
    'Address': 'Dirección',
    'Description': 'Descripción',
    'Category': 'Categoría',
    'Quantity': 'Cantidad',
    'Unit': 'Unidad',
    'Price': 'Precio',
    'Date': 'Fecha',
    'Time': 'Hora',
    'Notes': 'Notas',
    'Note:': 'Nota:',
    'Tip:': 'Consejo:',
    'Warning': 'Advertencia',
    'Error': 'Error',
    'Success': 'Éxito',
    'Pending': 'Pendiente',
    'Approved': 'Aprobado',
    'Sent': 'Enviado',
    'Rejected': 'Rechazado',
    'Failed': 'Falló',
    'Available': 'Disponible',
    'Unavailable': 'No disponible',
    'Online': 'En línea',
    'Offline': 'Desconectado',
    'Active': 'Activo',
    'Inactive': 'Inactivo',
    'Completed': 'Completado',
    'Claimed': 'Reclamado',
    'Expired': 'Vencido',
    'Open': 'Abrir',
    'Closed': 'Cerrado',
    'Draft': 'Borrador',
    'Published': 'Publicado',
    'New': 'Nuevo',
    'Today': 'Hoy',
    'Yesterday': 'Ayer',
    'Tomorrow': 'Mañana',
    'Now': 'Ahora',
    'Just now': 'Ahora mismo',
    'High': 'Alto',
    'Medium': 'Medio',
    'Low': 'Bajo',
    'Critical': 'Crítico',
    'Caution': 'Precaución',
    'Urgent': 'Urgente',
    'Photo': 'Foto',
    'Photos': 'Fotos',
    'Image': 'Imagen',
    'Images': 'Imágenes',
    'Upload': 'Subir',
    'Download': 'Descargar',
    'Copy': 'Copiar',
    'Copied!': '¡Copiado!',
    'Copied to clipboard!': '¡Copiado al portapapeles!',
    'Settings': 'Configuración',
    'Help': 'Ayuda',
    'Support': 'Soporte',
    'Feedback': 'Comentarios',
    'Profile': 'Perfil',
    'Account': 'Cuenta',
    'Account Settings': 'Configuración de la cuenta',
    'Profile Settings': 'Configuración del perfil',
    'Dashboard': 'Panel',
    'Home': 'Inicio',
    'Map': 'Mapa',
    'List': 'Lista',
    'Details': 'Detalles',
    'More': 'Más',
    'Menu': 'Menú',
    'Notifications': 'Notificaciones',
    'Messages': 'Mensajes',
    'Language': 'Idioma',
    'English': 'Inglés',
    'Spanish': 'Español',
    'Welcome': 'Bienvenido',
    'Welcome back': 'Bienvenido de nuevo',
    'Get Started': 'Comenzar',
    'Learn More': 'Saber más',
    'Try Again': 'Intentar de nuevo',
    'Please try again.': 'Por favor, inténtalo de nuevo.',
    'Something went wrong': 'Algo salió mal',
    'Something went wrong. Please try again.': 'Algo salió mal. Por favor, inténtalo de nuevo.',

    // -------- Header / nav --------
    'Find Food': 'Buscar Comida',
    'Share Food': 'Compartir Comida',
    'Admin Panel': 'Panel de Administración',
    'My Routes': 'Mis Rutas',
    'My Claims': 'Mis Reclamos',
    'My Listings': 'Mis Publicaciones',
    'Driver Dashboard': 'Panel del Conductor',
    'Dispatch': 'Despacho',
    'Volunteer': 'Voluntario',
    'Volunteer Routes': 'Rutas de Voluntarios',
    'Donor': 'Donante',
    'Recipient': 'Beneficiario',
    'Driver': 'Conductor',
    'Admin': 'Administrador',
    'Store Owner': 'Dueño de Tienda',
    'User Portal': 'Portal del Usuario',
    'Quick Actions': 'Acciones Rápidas',
    'Your Impact': 'Tu Impacto',

    // -------- Listings / cards --------
    'Food Listing Details': 'Detalles del Anuncio de Comida',
    'Create Listing': 'Crear Anuncio',
    'Create a new food listing': 'Crear un nuevo anuncio de comida',
    'Bulk Upload': 'Carga Masiva',
    'Upload multiple listings': 'Subir varios anuncios',
    'No listings yet': 'Aún no hay anuncios',
    'No listings found': 'No se encontraron anuncios',
    'No claims yet': 'Aún no hay reclamos',
    'No routes assigned': 'No hay rutas asignadas',
    'No inventory items yet': 'Aún no hay artículos en el inventario',
    'No recommendations yet': 'Aún no hay recomendaciones',
    'Listings Created': 'Anuncios Creados',
    'Meals Shared': 'Comidas Compartidas',
    'Meals Received': 'Comidas Recibidas',
    'People Helped': 'Personas Ayudadas',
    'Impact Points': 'Puntos de Impacto',
    'Active Claims': 'Reclamos Activos',
    'Claim': 'Reclamar',
    'Claim now': 'Reclamar ahora',
    'Claim now before it expires': 'Reclama antes de que expire',
    'Track Food': 'Rastrear Comida',
    'Log consumption': 'Registrar consumo',
    'View full dashboard': 'Ver panel completo',
    'Recommended for You': 'Recomendado para ti',
    'Update Preferences': 'Actualizar Preferencias',
    'Loading recommendations…': 'Cargando recomendaciones…',
    'Loading recommendations...': 'Cargando recomendaciones...',
    'View All Recommendations': 'Ver todas las recomendaciones',
    'Set Dietary Preferences': 'Establecer Preferencias Dietéticas',

    // -------- Categories / units --------
    'Fresh Produce': 'Productos Frescos',
    'Produce': 'Productos',
    'Prepared Food': 'Comida Preparada',
    'Prepared Meals': 'Comidas Preparadas',
    'Packaged': 'Empacado',
    'Packaged Foods': 'Alimentos Empacados',
    'Bakery': 'Panadería',
    'Bakery Items': 'Productos de Panadería',
    'Fruit': 'Fruta',
    'Water': 'Agua',
    'items': 'artículos',
    'boxes': 'cajas',
    'bags': 'bolsas',
    'servings': 'porciones',
    'All Categories': 'Todas las Categorías',

    // -------- Forms / fields --------
    'Title': 'Título',
    'Pickup Address': 'Dirección de Recogida',
    'Pickup Window': 'Horario de Recogida',
    'Pickup Window Start': 'Inicio del Horario de Recogida',
    'Pickup Window End': 'Fin del Horario de Recogida',
    'Business Name': 'Nombre del Negocio',
    'Operating Hours': 'Horario de Operación',
    'Organization Type': 'Tipo de Organización',
    'Current Password': 'Contraseña Actual',
    'New Password': 'Nueva Contraseña',
    'Confirm New Password': 'Confirmar Nueva Contraseña',
    'Change Role:': 'Cambiar Rol:',
    'Account Role': 'Rol de la Cuenta',
    'Restaurant': 'Restaurante',
    'Grocery Store': 'Tienda de Comestibles',
    'Cafe': 'Café',
    'Catering Company': 'Empresa de Catering',
    'Food Bank': 'Banco de Alimentos',
    'Nonprofit Organization': 'Organización Sin Fines de Lucro',
    'School/University': 'Escuela/Universidad',
    'Corporate Cafeteria': 'Cafetería Corporativa',
    'Hotel': 'Hotel',

    // -------- AI / Assistant --------
    'Your AI Assistant': 'Tu Asistente de IA',
    'AI Meal Suggestions': 'Sugerencias de Comidas con IA',
    'AI Meal Builder': 'Creador de Comidas con IA',
    'Turn your food into meals': 'Convierte tu comida en comidas',
    'Spoilage Risk Alerts': 'Alertas de Riesgo de Deterioro',
    'Spoilage Alerts': 'Alertas de Deterioro',
    'AI Storage Coach': 'Asesor de Almacenamiento IA',
    'Storage Coach': 'Asesor de Almacenamiento',
    'Smart Notifications': 'Notificaciones Inteligentes',
    'Smart Alerts': 'Alertas Inteligentes',
    'Smart Storage Coach': 'Asesor de Almacenamiento Inteligente',
    'Get Smart Storage Advice': 'Obtener Consejos Inteligentes',
    'Storage Tips': 'Consejos de Almacenamiento',
    'Storage Info': 'Información de Almacenamiento',
    'Storage Instructions': 'Instrucciones de Almacenamiento',
    'Personalized': 'Personalizado',
    'Smart tools tailored to the food you claim': 'Herramientas inteligentes adaptadas a la comida que reclamas',
    'Meal Suggestions': 'Sugerencias de Comidas',
    'Recipes from your claims': 'Recetas de tus reclamos',
    'Use, freeze, or toss?': '¿Usar, congelar o tirar?',
    'Keep food fresh longer': 'Mantén la comida fresca por más tiempo',
    'Learns what you like': 'Aprende lo que te gusta',
    'AI learns what you care about - no spam': 'La IA aprende lo que te importa - sin spam',
    'Enable Smart Notifications': 'Activar Notificaciones Inteligentes',
    'Notifications Blocked': 'Notificaciones Bloqueadas',
    'Advanced Settings': 'Configuración Avanzada',
    'Recent Notifications': 'Notificaciones Recientes',
    'Categories You Like:': 'Categorías que te gustan:',
    'Response Rate:': 'Tasa de respuesta:',
    'Max Distance': 'Distancia Máxima',
    'Daily Limit': 'Límite Diario',
    'Mode': 'Modo',
    'Enabled': 'Activado',
    'Disabled': 'Desactivado',
    'Start': 'Inicio',

    // -------- Chatbot panel --------
    'FoodMaps Assistant': 'Asistente FoodMaps',
    'Ask about food, pickups, reminders': 'Pregunta sobre comida, recogidas, recordatorios',
    'Type a message…': 'Escribe un mensaje…',
    'Type a message...': 'Escribe un mensaje...',
    'Waiting for reply…': 'Esperando respuesta…',
    'Waiting for reply...': 'Esperando respuesta...',
    'Thinking…': 'Pensando…',
    'Thinking...': 'Pensando...',
    'Posting…': 'Publicando…',
    'Posting...': 'Publicando...',
    'Claiming…': 'Reclamando…',
    'Claiming...': 'Reclamando...',
    'Releasing…': 'Liberando…',
    'Releasing...': 'Liberando...',
    'Releasing claim…': 'Liberando reclamo…',
    'Releasing claim...': 'Liberando reclamo...',
    'Setting up request…': 'Configurando solicitud…',
    'Setting up request...': 'Configurando solicitud...',

    // -------- Spoilage / urgency --------
    'Analyzing spoilage risk...': 'Analizando riesgo de deterioro...',
    'Analyzing spoilage risk…': 'Analizando riesgo de deterioro…',
    'Analyzing storage requirements...': 'Analizando requisitos de almacenamiento...',
    'Analyzing storage requirements…': 'Analizando requisitos de almacenamiento…',
    'All Clear!': '¡Todo en orden!',
    'Active Alerts': 'Alertas Activas',
    'Risk Score': 'Puntuación de Riesgo',
    'Storage': 'Almacenamiento',
    'Nothing Expiring Soon!': '¡Nada que venza pronto!',
    'Finding meals to prevent waste...': 'Buscando comidas para evitar el desperdicio...',
    'Finding meals to prevent waste…': 'Buscando comidas para evitar el desperdicio…',
    'URGENT - Claim immediately!': '¡URGENTE - Reclamar inmediatamente!',
    'Expiring soon - Act fast': 'Expira pronto - Actúa rápido',
    'High - Consume within hours': 'Alto - Consumir en horas',
    'Medium - Consume soon': 'Medio - Consumir pronto',
    'Low - Stable for days': 'Bajo - Estable por días',

    // -------- Storage Guidance --------
    'Temperature:': 'Temperatura:',
    'Use within:': 'Usar dentro de:',
    'Once opened:': 'Una vez abierto:',
    'Food Safety Reminder:': 'Recordatorio de Seguridad Alimentaria:',
    'When in doubt, throw it out': 'En caso de duda, deséchalo',
    'Check for unusual odors or appearance': 'Verifica olores o apariencia inusual',
    'Wash hands before handling food': 'Lávate las manos antes de manipular alimentos',
    'Special Tip': 'Consejo Especial',
    'Best Within': 'Mejor Dentro De',
    'Location': 'Ubicación',
    'Temperature': 'Temperatura',

    // -------- Logistics / dispatch --------
    'Dispatch Map View': 'Vista del Mapa de Despacho',
    'Configure Mapbox token for interactive map': 'Configura el token de Mapbox para el mapa interactivo',
    'Setup Instructions:': 'Instrucciones de Configuración:',
    'Live Dispatch Stats': 'Estadísticas de Despacho en Vivo',
    'Active Routes': 'Rutas Activas',
    'Active Drivers': 'Conductores Activos',
    'Available Drivers': 'Conductores Disponibles',
    'Critical Orders': 'Órdenes Críticas',
    'Critical Deliveries': 'Entregas Críticas',
    'High Priority': 'Alta Prioridad',
    'Distribution Centers': 'Centros de Distribución',
    'Dispatch Controls': 'Controles de Despacho',
    'Refresh All Routes': 'Actualizar Todas las Rutas',
    'Auto-Optimize': 'Auto-Optimizar',
    'View All Locations': 'Ver Todas las Ubicaciones',
    'Map Legend': 'Leyenda del Mapa',
    'Map Error': 'Error del Mapa',
    'System Status:': 'Estado del Sistema:',
    'Last Update:': 'Última actualización:',
    'Total Distance Today:': 'Distancia Total Hoy:',
    'Fuel Saved:': 'Combustible Ahorrado:',
    'Current Stock': 'Inventario Actual',
    'Pending Pickups': 'Recogidas Pendientes',
    'Families Served:': 'Familias Atendidas:',
    'Last Delivery:': 'Última Entrega:',
    'Requested Items:': 'Artículos Solicitados:',
    'Capacity': 'Capacidad',
    'Deliveries': 'Entregas',
    'Hours': 'Horas',

    // -------- Volunteer routes --------
    'Only volunteers can access routes.': 'Solo los voluntarios pueden acceder a las rutas.',
    'Active Route': 'Ruta Activa',

    // -------- Store owner --------
    'Loading your store...': 'Cargando tu tienda...',
    'No Distribution Center Found': 'No Se Encontró Centro de Distribución',
    'Food Inventory': 'Inventario de Alimentos',
    'Add New Food Item': 'Agregar Nuevo Artículo',
    'Add Food Item': 'Agregar Artículo',
    'Click "Add Food Item" to get started': 'Haz clic en "Agregar Artículo" para comenzar',
    'Distribution Center Information': 'Información del Centro de Distribución',

    // -------- Trust badges --------
    'Assign Trust Badges': 'Asignar Insignias de Confianza',
    'AGLF Verified': 'Verificado por AGLF',
    'Verified by All Good Living Foundation': 'Verificado por All Good Living Foundation',
    'School Partner': 'Socio Escolar',
    'Official school partnership status': 'Estado oficial de asociación escolar',
    'Community Partner': 'Socio Comunitario',
    'Verified Donor': 'Donante Verificado',
    'Trusted Member': 'Miembro de Confianza',

    // -------- Voice search --------
    'Voice Search Examples': 'Ejemplos de Búsqueda por Voz',
    'Example Questions': 'Preguntas de Ejemplo',
    'Conversation': 'Conversación',
    'You said:': 'Dijiste:',
    'Response:': 'Respuesta:',

    // -------- User profile --------
    'Your Referral Code': 'Tu Código de Referido',
    'People Referred': 'Personas Referidas',
    'How it works:': 'Cómo funciona:',
    'Benefits:': 'Beneficios:',
    'Included': 'Incluido',
    'Get personalized food recommendations': 'Obtén recomendaciones personalizadas de comida',
    'Filter out allergens automatically': 'Filtra los alérgenos automáticamente',
    'See portion sizes for your household': 'Ve los tamaños de porción para tu hogar',
    'Required for SMS notifications': 'Requerido para notificaciones SMS',
    'You can switch between these roles anytime': 'Puedes cambiar entre estos roles en cualquier momento',
    'Donor - Share food donations': 'Donante - Compartir donaciones de comida',
    'Recipient - Request and claim food': 'Beneficiario - Solicitar y reclamar comida',

    // -------- AI Broadcasts / admin --------
    'AI Broadcasts': 'Transmisiones de IA',
    'In-app chat': 'Chat en la aplicación',
    'Both': 'Ambos',

    // -------- Tutorial --------
    'New to Food Maps?': '¿Nuevo en Food Maps?',

    // -------- Auth / placeholders --------
    'Your email': 'Tu correo electrónico',
    'Your password': 'Tu contraseña',
    'Enter your email': 'Ingresa tu correo electrónico',
    'Enter your password': 'Ingresa tu contraseña',
    'Forgot password?': '¿Olvidaste tu contraseña?',
    'Create account': 'Crear cuenta',
    'Already have an account?': '¿Ya tienes una cuenta?',
    "Don't have an account?": '¿No tienes una cuenta?',

    // === ListingCard ===
    'Add to favorites': 'Agregar a favoritos',
    'Remove from favorites': 'Quitar de favoritos',
    'Pending Confirmation': 'Confirmación Pendiente',
    'Waiting for Confirmation': 'Esperando Confirmación',
    'Click here to enter your code': 'Haz clic aquí para ingresar tu código',
    'Recipient Contact:': 'Contacto del Beneficiario:',
    'Donor Contact:': 'Contacto del Donante:',
    'Name:': 'Nombre:',
    'Phone:': 'Teléfono:',
    'Loading contact info...': 'Cargando información de contacto...',
    'Contact info not available': 'Información de contacto no disponible',
    'Safety Verified': 'Seguridad Verificada',
    'Safety Check Needed': 'Se Necesita Verificación de Seguridad',
    'Frozen': 'Congelado',
    'Refrigerated': 'Refrigerado',
    'Excellent': 'Excelente',
    'Good': 'Bueno',
    'Fair': 'Regular',
    'Poor': 'Pobre',
    'Packaging: Excellent': 'Empaque: Excelente',
    'Packaging: Good': 'Empaque: Bueno',
    'Packaging: Fair': 'Empaque: Regular',
    'Packaging: Poor': 'Empaque: Pobre',
    'Soon': 'Pronto',
    'Fresh': 'Fresco',

    // === DetailedModal ===
    'Claim This Food': 'Reclamar Esta Comida',
    'Get Directions': 'Obtener Indicaciones',
    'Food Information': 'Información de la Comida',
    'Category:': 'Categoría:',
    'Quantity:': 'Cantidad:',
    'Perishability:': 'Perecibilidad:',
    'Expires:': 'Vence:',
    'Pickup Information': 'Información de Recogida',
    'Address:': 'Dirección:',
    'Pickup Window:': 'Horario de Recogida:',
    'From:': 'Desde:',
    'To:': 'Hasta:',
    'Recipient Contact Information:': 'Información de Contacto del Beneficiario:',
    'Donor Contact Information:': 'Información de Contacto del Donante:',
    'Contact information not available': 'Información de contacto no disponible',
    'Listing Information': 'Información del Anuncio',
    'Posted on:': 'Publicado el:',
    'Listing ID:': 'ID del Anuncio:',
    'Available - Moderate timeline': 'Disponible - Plazo moderado',
    'Good availability': 'Buena disponibilidad',
    'This item has expired': 'Este artículo ha expirado',
    'Time remaining:': 'Tiempo restante:',
    'Medium - Consume within days': 'Medio - Consumir en días',
    'Low - Shelf stable': 'Bajo - Estable en estante',
    'Not specified': 'No especificado',
    'Invalid date': 'Fecha inválida',

    // === TutorialMode ===
    'Welcome to Food Maps!': '¡Bienvenido a Food Maps!',
    "Let's take a quick tour to help you get started. This tutorial will show you how to make the most of our platform.":
      'Hagamos un recorrido rápido para ayudarte a comenzar. Este tutorial te mostrará cómo aprovechar al máximo nuestra plataforma.',
    'Your Dashboard': 'Tu Panel',
    'This is your main view. Here you can see all available food listings in your area.':
      'Esta es tu vista principal. Aquí puedes ver todos los anuncios de comida disponibles en tu área.',
    'Browse Food Listings': 'Explorar Anuncios de Comida',
    'Switch between map and list view to find food near you. Listings show available food items from donors.':
      'Cambia entre la vista de mapa y lista para encontrar comida cerca de ti. Los anuncios muestran artículos de comida disponibles de donantes.',
    'Urgency Indicators': 'Indicadores de Urgencia',
    'Pay attention to urgency badges. Critical items need to be claimed within 2 hours. High urgency items expire in 6 hours.':
      'Presta atención a las insignias de urgencia. Los artículos críticos deben reclamarse en 2 horas. Los artículos de alta urgencia expiran en 6 horas.',
    'Set Your Dietary Needs': 'Establece tus Necesidades Dietéticas',
    'Click on your profile to set dietary preferences and allergies. The app will recommend food that matches your needs!':
      '¡Haz clic en tu perfil para establecer preferencias dietéticas y alergias. La aplicación recomendará comida que coincida con tus necesidades!',
    'Claim Food Items': 'Reclamar Artículos de Comida',
    "When you find food you need, click the 'Claim' button. You'll receive an SMS code to confirm your claim.":
      'Cuando encuentres comida que necesites, haz clic en el botón "Reclamar". Recibirás un código SMS para confirmar tu reclamo.',
    'Pickup Status': 'Estado de Recogida',
    'After claiming, keep your pickup status current so donors and recipients know the handoff timing.':
      'Después de reclamar, mantén actualizado tu estado de recogida para que donantes y beneficiarios conozcan el momento de la entrega.',
    'Filter & Search': 'Filtrar y Buscar',
    'Use filters to find specific food types, adjust distance, or search by category. Make it easy to find what you need!':
      '¡Usa filtros para encontrar tipos específicos de comida, ajustar la distancia o buscar por categoría. Haz que sea fácil encontrar lo que necesitas!',
    'Get Support': 'Obtener Soporte',
    "Need help? Open your profile menu and tap 'Message Support' to chat with our team anytime.":
      '¿Necesitas ayuda? Abre tu menú de perfil y toca "Mensaje al Soporte" para chatear con nuestro equipo en cualquier momento.',
    "You're All Set!": '¡Todo Listo!',
    "You're ready to start finding food. Claim urgent items quickly and keep your pickup status up to date.":
      'Estás listo para comenzar a encontrar comida. Reclama artículos urgentes rápidamente y mantén actualizado tu estado de recogida.',
    'Create Listings': 'Crear Anuncios',
    "Click 'Donate Food' to create a new listing. Add photos, description, quantity, and expiration date.":
      'Haz clic en "Donar Comida" para crear un nuevo anuncio. Agrega fotos, descripción, cantidad y fecha de vencimiento.',
    'Set Urgency & Perishability': 'Establecer Urgencia y Perecibilidad',
    'Mark how perishable your food is. The app will automatically show urgency countdown timers to recipients!':
      '¡Marca qué tan perecedera es tu comida. La aplicación mostrará automáticamente temporizadores de urgencia a los beneficiarios!',
    'Track Your Impact': 'Rastrea tu Impacto',
    "View your donor dashboard to see how many people you've helped and how much food you've saved from waste!":
      '¡Ve tu panel de donante para ver a cuántas personas has ayudado y cuánta comida has salvado del desperdicio!',
    'Manage Claims': 'Gestionar Reclamos',
    "When someone claims your food, you'll see their contact info. Send them an SMS confirmation code.":
      'Cuando alguien reclame tu comida, verás su información de contacto. Envíales un código de confirmación por SMS.',
    'Claim Tracking': 'Seguimiento de Reclamos',
    'Track claim updates so you can confirm successful pickups and coordinate handoffs.':
      'Sigue las actualizaciones de reclamos para confirmar recogidas exitosas y coordinar entregas.',
    'Schedule Donations': 'Programar Donaciones',
    'Set up recurring donations if you regularly have surplus food. Help feed your community consistently!':
      '¡Configura donaciones recurrentes si tienes comida sobrante regularmente. Ayuda a alimentar a tu comunidad de manera consistente!',
    "You're Ready to Give!": '¡Estás Listo para Dar!',
    "You're all set to start helping your community! Create listings, manage claims, and track your positive impact. Thank you for being generous!":
      '¡Todo listo para empezar a ayudar a tu comunidad! Crea anuncios, gestiona reclamos y rastrea tu impacto positivo. ¡Gracias por ser generoso!',
    'Sign Up to Get Started': 'Regístrate para Comenzar',
    "Create an account to claim food as a recipient or donate food as a donor. It's free and takes just a minute!":
      '¡Crea una cuenta para reclamar comida como beneficiario o donar como donante. Es gratis y solo toma un minuto!',
    'Explore the Map': 'Explorar el Mapa',
    'See available food listings in your area. Each marker represents food available for pickup.':
      'Ve los anuncios de comida disponibles en tu área. Cada marcador representa comida disponible para recoger.',
    'Ready to Join?': '¿Listo para Unirte?',
    'Sign up now to start claiming food or donating to your community. Together we can reduce food waste!':
      '¡Regístrate ahora para empezar a reclamar comida o donar a tu comunidad. Juntos podemos reducir el desperdicio de alimentos!',
    'The element for this step is not currently visible. You can continue to the next step.':
      'El elemento de este paso no está visible actualmente. Puedes continuar al siguiente paso.',
    'Finish': 'Finalizar',
    'Skip tutorial': 'Omitir tutorial',
    'You can restart the tutorial anytime from your profile menu!':
      '¡Puedes reiniciar el tutorial en cualquier momento desde tu menú de perfil!',
    'Tutorial Skipped': 'Tutorial Omitido',
    "Great job! You're ready to use Food Maps. Explore and enjoy!":
      '¡Buen trabajo! Estás listo para usar Food Maps. ¡Explora y disfruta!',
    'Tutorial Complete!': '¡Tutorial Completado!',
    'Take a quick tour to learn how to use the app!':
      '¡Haz un recorrido rápido para aprender a usar la aplicación!',
    'Start Tutorial': 'Iniciar Tutorial',

    // === AdminPanel ===
    'Overview': 'Resumen',
    'Referrals': 'Referidos',
    'Database': 'Base de Datos',
    'Export': 'Exportar',
    'Total Users': 'Usuarios Totales',
    'Food Listings': 'Anuncios de Comida',
    'Schedules': 'Horarios',
    'Active Tasks': 'Tareas Activas',
    'Add Center': 'Agregar Centro',
    'Edit Distribution Center': 'Editar Centro de Distribución',
    'Add New Distribution Center': 'Agregar Nuevo Centro de Distribución',
    'Center Name': 'Nombre del Centro',
    'Latitude': 'Latitud',
    'Longitude': 'Longitud',
    'Geocode': 'Geocodificar',
    'Operating Hours (e.g., Mon-Fri 9AM-5PM)': 'Horario de Operación (ej., Lun-Vie 9AM-5PM)',
    'Create': 'Crear',
    'No distribution centers found. Add one to get started.':
      'No se encontraron centros de distribución. Agrega uno para comenzar.',
    'Referral Analytics': 'Análisis de Referidos',
    'Loading referral data...': 'Cargando datos de referidos...',
    'Total Referrers': 'Referidores Totales',
    'Total Referrals': 'Referidos Totales',
    'Avg per Referrer': 'Promedio por Referidor',
    'Top Referrers': 'Referidores Principales',
    'User': 'Usuario',
    'Referral Code': 'Código de Referido',
    'Joined': 'Se unió',
    'No referral data available yet.': 'Aún no hay datos de referidos disponibles.',
    'Recent Referrals': 'Referidos Recientes',
    'No recent referrals to display.': 'No hay referidos recientes para mostrar.',
    'Food Listings Management': 'Gestión de Anuncios de Comida',
    'Loading listings...': 'Cargando anuncios...',
    'No listings found.': 'No se encontraron anuncios.',
    'Location:': 'Ubicación:',
    'Posted by:': 'Publicado por:',
    'Status:': 'Estado:',
    'Are you sure you want to delete this distribution center?':
      '¿Estás seguro de que deseas eliminar este centro de distribución?',
    'Are you sure you want to delete this listing? This action cannot be undone.':
      '¿Estás seguro de que deseas eliminar este anuncio? Esta acción no se puede deshacer.',
    'Listing deleted successfully': 'Anuncio eliminado con éxito',

    // === AIBroadcastsPanel ===
    'Hourly job drafts SMS / in-app messages about new listings. Review and approve before they go out.':
      'Un trabajo por hora redacta mensajes SMS / en la app sobre nuevos anuncios. Revisa y aprueba antes de que se envíen.',
    'Run scan now': 'Ejecutar escaneo ahora',
    'Scanning…': 'Escaneando…',
    'Scanning...': 'Escaneando...',
    'Approve all': 'Aprobar todo',
    'Sending…': 'Enviando…',
    'Sending...': 'Enviando...',
    'No broadcasts with status': 'Sin transmisiones con estado',
    'SMS': 'SMS',
    'Approve & send': 'Aprobar y enviar',
    'Reject': 'Rechazar',
    'Approve': 'Aprobar',

    // === Dashboard ===
    'Total Claims': 'Reclamos Totales',
    'Add Listing': 'Agregar Anuncio',
    'Create First Listing': 'Crear Primer Anuncio',
    'Available Tasks': 'Tareas Disponibles',
    'Hours This Month': 'Horas Este Mes',
    'Pickup & Delivery': 'Recogida y Entrega',
    'Accept Task': 'Aceptar Tarea',
    'No tasks available': 'No hay tareas disponibles',
    'Please sign in to view dashboard': 'Inicia sesión para ver el panel',

    // === FilterPanel ===
    'Prepared': 'Preparado',

    // === CreateListing ===
    'Basic Info': 'Información Básica',
    'Safety Check': 'Verificación de Seguridad',
    'Only donors can create listings': 'Solo los donantes pueden crear anuncios',
    'Title *': 'Título *',
    'e.g., Fresh vegetables from community garden': 'ej., Verduras frescas del jardín comunitario',
    'Describe the food items...': 'Describe los artículos de comida...',
    'Photos': 'Fotos',
    'Add photos': 'Agregar fotos',
    'Uploading…': 'Subiendo…',
    'Uploading...': 'Subiendo...',
    'Category *': 'Categoría *',
    'Perishability': 'Perecibilidad',
    'Quantity *': 'Cantidad *',
    'Pounds': 'Libras',
    'Items': 'Artículos',
    'Servings': 'Porciones',
    'Ounces': 'Onzas',
    'Pickup Address *': 'Dirección de Recogida *',
    'Search address with Mapbox': 'Buscar dirección con Mapbox',
    'Selected Address:': 'Dirección Seleccionada:',
    'Coordinates:': 'Coordenadas:',
    'Pickup Window Start *': 'Inicio del Horario de Recogida *',
    'Pickup Window End *': 'Fin del Horario de Recogida *',
    '+2h': '+2h',
    'Continue to Safety Check →': 'Continuar a Verificación de Seguridad →',
    '← Back': '← Atrás',
    'Skip Safety Check': 'Omitir Verificación de Seguridad',
    'Clear photos help recipients trust and choose your food. Max 8MB per image.':
      'Las fotos claras ayudan a los beneficiarios a confiar y elegir tu comida. Máx 8MB por imagen.',
    'High (consume within hours)': 'Alto (consumir en horas)',
    'Medium (consume within days)': 'Medio (consumir en días)',
    'Low (shelf stable)': 'Bajo (estable en estante)',
    'Valid quantity is required': 'Se requiere una cantidad válida',
    'Title is required': 'El título es obligatorio',
    'Pickup must be in the future': 'La recogida debe ser en el futuro',
    'End time must be after start time': 'La hora de fin debe ser posterior a la hora de inicio',
    'Pickup address is required': 'La dirección de recogida es obligatoria',
    'Start time is required': 'La hora de inicio es obligatoria',
    'End time is required': 'La hora de fin es obligatoria',
    'Sign in required': 'Se requiere iniciar sesión',
    'Please sign in as a donor to create a listing.':
      'Por favor inicia sesión como donante para crear un anuncio.',
    'Phone required': 'Se requiere teléfono',
    'A phone number is required to create a listing.':
      'Se requiere un número de teléfono para crear un anuncio.',
    'Listing created successfully!': '¡Anuncio creado con éxito!',
    'Failed to create listing.': 'Error al crear el anuncio.',
    'Invalid address': 'Dirección inválida',
    'Please choose a valid address from the suggestions.':
      'Por favor elige una dirección válida de las sugerencias.',
    'Remove photo': 'Quitar foto',

    // === Common extras observed across components ===
    'Donate Food': 'Donar Comida',
    'Message Support': 'Mensaje al Soporte',
    'Profile Menu': 'Menú de Perfil',
    'How It Works': 'Cómo Funciona',
    'Tutorial': 'Tutorial',
    'Restart Tutorial': 'Reiniciar Tutorial',
    'Step': 'Paso',
    'of': 'de',
  };

  // Reverse map (Spanish -> English) so the toggle works both directions.
  const REVERSE = {};
  for (const k of Object.keys(PHRASES)) {
    REVERSE[PHRASES[k]] = k;
  }

  // Attributes we translate. value-of-input is handled separately.
  const TEXT_ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];

  // Tags whose contents we never touch.
  const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA',
  ]);

  function getTargetMap(lang) {
    // Always try both directions: a phrase might currently be in either
    // language depending on whether React just re-rendered something.
    return lang === 'es'
      ? { primary: PHRASES, secondary: null }
      : { primary: REVERSE, secondary: null };
  }

  function shouldSkipNode(node) {
    let p = node.parentNode;
    while (p) {
      if (p.nodeType === 1) {
        if (SKIP_TAGS.has(p.tagName)) return true;
        if (p.hasAttribute && p.hasAttribute('data-no-i18n')) return true;
        if (p.isContentEditable) return true;
      }
      p = p.parentNode;
    }
    return false;
  }

  function translateText(raw, map) {
    if (!raw) return null;
    // Preserve leading/trailing whitespace.
    const m = raw.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!m) return null;
    const lead = m[1], core = m[2], trail = m[3];
    if (!core) return null;
    if (Object.prototype.hasOwnProperty.call(map, core)) {
      return lead + map[core] + trail;
    }
    return null;
  }

  function translateTextNode(node, map) {
    if (node.nodeType !== 3) return;
    if (shouldSkipNode(node)) return;
    const out = translateText(node.nodeValue, map);
    if (out !== null && out !== node.nodeValue) {
      node.nodeValue = out;
    }
  }

  function translateAttributes(el, map) {
    if (!el || el.nodeType !== 1) return;
    if (SKIP_TAGS.has(el.tagName)) return;
    if (el.hasAttribute && el.hasAttribute('data-no-i18n')) return;

    for (const a of TEXT_ATTRS) {
      if (el.hasAttribute && el.hasAttribute(a)) {
        const v = el.getAttribute(a);
        const out = translateText(v, map);
        if (out !== null && out !== v) {
          el.setAttribute(a, out);
        }
      }
    }
    // <input type="submit|button"> value is user-visible button label.
    if (el.tagName === 'INPUT') {
      const t = (el.getAttribute('type') || '').toLowerCase();
      if (t === 'submit' || t === 'button' || t === 'reset') {
        const v = el.value;
        const out = translateText(v, map);
        if (out !== null && out !== v) {
          el.value = out;
        }
      }
    }
  }

  function walkAndTranslate(root, map) {
    if (!root) return;
    if (root.nodeType === 3) {
      translateTextNode(root, map);
      return;
    }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) {
      if (SKIP_TAGS.has(root.tagName)) return;
      if (root.hasAttribute && root.hasAttribute('data-no-i18n')) return;
      translateAttributes(root, map);
    }

    // Use TreeWalker for performance.
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode(n) {
          if (n.nodeType === 1) {
            if (SKIP_TAGS.has(n.tagName)) return NodeFilter.FILTER_REJECT;
            if (n.hasAttribute && n.hasAttribute('data-no-i18n')) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );
    let n;
    while ((n = walker.nextNode())) {
      if (n.nodeType === 3) {
        translateTextNode(n, map);
      } else if (n.nodeType === 1) {
        translateAttributes(n, map);
      }
    }
  }

  let observer = null;
  let scheduled = false;
  const pendingRoots = new Set();

  function flush() {
    scheduled = false;
    const lang = (window.i18n && window.i18n.getCurrentLanguage()) || 'en';
    const { primary } = getTargetMap(lang);
    const roots = Array.from(pendingRoots);
    pendingRoots.clear();
    // Pause observer while we mutate to avoid feedback.
    if (observer) observer.disconnect();
    try {
      for (const r of roots) {
        if (r && r.isConnected !== false) {
          walkAndTranslate(r, primary);
        }
      }
    } finally {
      if (observer) startObserving();
    }
  }

  function schedule(root) {
    if (root) pendingRoots.add(root);
    if (scheduled) return;
    scheduled = true;
    // rAF gives React time to finish committing the current render.
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(flush);
    } else {
      setTimeout(flush, 16);
    }
  }

  function translateAll() {
    pendingRoots.add(document.body || document.documentElement);
    if (!scheduled) {
      scheduled = true;
      // Run synchronously on language toggle for snappy UX.
      flush();
    }
  }

  function startObserving() {
    if (!observer) {
      observer = new MutationObserver(function (mutations) {
        for (const m of mutations) {
          if (m.type === 'characterData') {
            schedule(m.target);
          } else if (m.type === 'childList') {
            for (const n of m.addedNodes) schedule(n);
          } else if (m.type === 'attributes') {
            schedule(m.target);
          }
        }
      });
    }
    const target = document.body || document.documentElement;
    if (target) {
      observer.observe(target, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: TEXT_ATTRS,
      });
    }
  }

  function stopObserving() {
    if (observer) observer.disconnect();
  }

  function init() {
    // Initial sweep based on current language.
    translateAll();
    startObserving();
  }

  // React to language toggle.
  window.addEventListener('languageChanged', function () {
    translateAll();
  });

  // Wait for DOM ready before doing the initial sweep.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    // Slight delay so React (loaded via defer) can render the first tree.
    setTimeout(init, 0);
  }

  // Public API.
  window.i18nAuto = {
    translateAll: translateAll,
    addPhrases: function (entries) {
      if (!entries || typeof entries !== 'object') return;
      for (const k of Object.keys(entries)) {
        const v = entries[k];
        if (typeof v !== 'string') continue;
        PHRASES[k] = v;
        REVERSE[v] = k;
      }
      translateAll();
    },
    getPhrases: function () {
      return Object.assign({}, PHRASES);
    },
    pause: stopObserving,
    resume: startObserving,
  };
})();
