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
    'Start': 'Comienzo',
    'End': 'Fin',

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

    // === Header / nav extras ===
    'My Impact': 'Mi Impacto',
    'How to Use': 'Cómo Usar',
    'SMS Text Notifications': 'Notificaciones SMS',
    'Pickup Reminders': 'Recordatorios de Recogida',

    // === UserProfile ===
    'Account Info': 'Información de Cuenta',
    'Dietary Needs': 'Necesidades Dietéticas',
    'Favorites': 'Favoritos',
    'Password': 'Contraseña',
    'Confirm Password': 'Confirmar Contraseña',
    'Change Role': 'Cambiar Rol',
    'Dispatcher': 'Despachador',
    'Full platform access': 'Acceso completo a la plataforma',
    'Can share food donations': 'Puede compartir donaciones de comida',
    'Can request and claim food': 'Puede solicitar y reclamar comida',
    'Can volunteer for deliveries': 'Puede ser voluntario para entregas',
    'Can deliver food donations': 'Puede entregar donaciones de comida',
    'Can coordinate deliveries': 'Puede coordinar entregas',
    'Profile updated successfully!': '¡Perfil actualizado con éxito!',
    'New passwords do not match': 'Las nuevas contraseñas no coinciden',
    'Password changed successfully!': '¡Contraseña cambiada con éxito!',
    'Update Profile': 'Actualizar Perfil',

    // === UserPortal ===
    'Profile Information': 'Información del Perfil',
    'Contact Name': 'Nombre de Contacto',
    'Full Name': 'Nombre Completo',

    // === MessageSupport ===
    'Chat with our admin team': 'Chatea con nuestro equipo de administración',
    'Loading messages...': 'Cargando mensajes...',
    'No messages yet': 'Aún no hay mensajes',
    'Send a message to start chatting with support': 'Envía un mensaje para comenzar a chatear con soporte',
    'Type your message...': 'Escribe tu mensaje...',
    'You': 'Tú',

    // === FoodSearch ===
    'Quick Search': 'Búsqueda Rápida',
    'Advanced': 'Avanzado',
    'Search for food items...': 'Buscar artículos de comida...',
    'Nearest First': 'Más cercano primero',
    'Most Relevant': 'Más relevante',
    'Recently Added': 'Agregado recientemente',
    'Min quantity': 'Cantidad mínima',
    'Within 3 miles': 'Dentro de 3 millas',
    'Within 6 miles': 'Dentro de 6 millas',
    'Within 15 miles': 'Dentro de 15 millas',
    'Within 30 miles': 'Dentro de 30 millas',
    'Available for pickup today': 'Disponible para recoger hoy',
    'Found': 'Encontrado',
    'results': 'resultados',
    'No results found': 'No se encontraron resultados',
    'Try adjusting your search or filters': 'Prueba ajustar tu búsqueda o filtros',
    'Find Food Near You': 'Busca Comida Cerca de Ti',
    'Search for available food donations in your area': 'Busca donaciones de comida disponibles en tu área',
    'Select This Food': 'Seleccionar Esta Comida',

    // === Map ===
    'Map failed to load. Please refresh the page.': 'No se pudo cargar el mapa. Por favor recarga la página.',
    'Map failed to initialize. Please refresh the page.': 'No se pudo inicializar el mapa. Por favor recarga la página.',
    'Listing': 'Anuncio',
    'Pickup': 'Recogida',
    'Removed from favorites': 'Eliminado de favoritos',
    'Added to favorites': 'Agregado a favoritos',
    'Please sign in to save favorites': 'Inicia sesión para guardar favoritos',
    'You cannot favorite your own listing.': 'No puedes marcar como favorito tu propio anuncio.',

    // === AIChatbot extras ===
    'Confirming claim…': 'Confirmando reclamo…',
    'Confirming claim...': 'Confirmando reclamo...',
    'Updating profile…': 'Actualizando perfil…',
    'Updating profile...': 'Actualizando perfil...',
    'Bulk-importing listings…': 'Importando anuncios en masa…',
    'Bulk-importing listings...': 'Importando anuncios en masa...',
    'Looking at your photo…': 'Mirando tu foto…',
    'Looking at your photo...': 'Mirando tu foto...',
    'Posting listing…': 'Publicando anuncio…',
    'Posting listing...': 'Publicando anuncio...',
    'Setting up listing…': 'Configurando anuncio…',
    'Setting up listing...': 'Configurando anuncio...',
    'Finding food near you…': 'Buscando comida cerca de ti…',
    'Finding food near you...': 'Buscando comida cerca de ti...',
    'Planning route…': 'Planificando ruta…',
    'Planning route...': 'Planificando ruta...',
    'Pulling up meal ideas…': 'Buscando ideas de comidas…',
    'Pulling up meal ideas...': 'Buscando ideas de comidas...',
    'Checking spoilage risk…': 'Verificando riesgo de deterioro…',
    'Checking spoilage risk...': 'Verificando riesgo de deterioro...',
    'Opening storage coach…': 'Abriendo asesor de almacenamiento…',
    'Opening storage coach...': 'Abriendo asesor de almacenamiento...',
    'Opening notification settings…': 'Abriendo configuración de notificaciones…',
    'Opening notification settings...': 'Abriendo configuración de notificaciones...',
    'Opening pickup reminders…': 'Abriendo recordatorios de recogida…',
    'Opening pickup reminders...': 'Abriendo recordatorios de recogida...',
    'Opening SMS settings…': 'Abriendo configuración SMS…',
    'Opening SMS settings...': 'Abriendo configuración SMS...',
    'Food claimed!': '¡Comida reclamada!',
    'Reply with the 4-digit code to confirm pickup.': 'Responde con el código de 4 dígitos para confirmar la recogida.',
    'Pickup confirmed!': '¡Recogida confirmada!',
    "You're all set — head to the pickup spot.": '¡Todo listo — dirígete al lugar de recogida.',
    'Listing posted!': '¡Anuncio publicado!',
    'Recipients can now see and claim it on the map.': 'Los beneficiarios ahora pueden verlo y reclamarlo en el mapa.',
    'Request posted!': '¡Solicitud publicada!',
    'Donors near you will be notified.': 'Los donantes cerca de ti serán notificados.',
    'Listings imported!': '¡Anuncios importados!',
    'Your inventory is live on the map.': 'Tu inventario está activo en el mapa.',
    'Working…': 'Trabajando…',
    'Working...': 'Trabajando...',
    "I didn't hear anything. Please try again.": 'No escuché nada. Por favor intenta de nuevo.',
    'Microphone access denied. Please enable microphone permissions.': 'Acceso al micrófono denegado. Habilita los permisos de micrófono.',
    'Sorry, I had trouble understanding. Please try again.': 'Lo siento, tuve problemas para entender. Por favor intenta de nuevo.',
    'Sorry, I had trouble understanding that. Could you try again?': 'Lo siento, tuve problemas para entender eso. ¿Puedes intentar de nuevo?',

    // === SpoilageRiskAlerts ===
    'UNSAFE TO EAT': 'NO SEGURO PARA COMER',
    'Discard immediately': 'Desechar inmediatamente',
    'EXPIRED': 'VENCIDO',
    'expired': 'vencido',
    'days ago': 'días atrás',
    'This item may no longer be safe - discard': 'Este artículo puede ya no ser seguro - desechar',
    'SPOILAGE RISK HIGH': 'RIESGO DE DETERIORO ALTO',
    'This item may no longer be safe': 'Este artículo puede ya no ser seguro',
    'FREEZE NOW': 'CONGELAR AHORA',
    'Freeze now to preserve': 'Congela ahora para preservar',
    'USE TONIGHT': 'USAR ESTA NOCHE',
    'Use tonight or freeze': 'Usar esta noche o congelar',
    'PLAN TO USE SOON': 'PLANEAR USAR PRONTO',
    'days': 'días',
    'BREAD IN FRIDGE': 'PAN EN EL REFRIGERADOR',
    'Move to counter or freeze': 'Mover al mostrador o congelar',
    'STILL FRESH': 'AÚN FRESCO',
    'No action needed': 'No se necesita acción',
    'Storage Method': 'Método de Almacenamiento',
    'Refrigerator': 'Refrigerador',
    'Counter': 'Mostrador',
    'Freezer': 'Congelador',

    // === MealBuilder ===
    'Turn your picked-up food into delicious meals!': '¡Convierte la comida que recogiste en comidas deliciosas!',
    'Your Available Food': 'Tu Comida Disponible',
    "Select items you've picked up or claimed to get meal suggestions": 'Selecciona los artículos que has recogido o reclamado para obtener sugerencias de comidas',
    'Meal Type': 'Tipo de Comida',
    'Rice Bowl': 'Tazón de Arroz',
    'Sandwich': 'Sándwich',
    'Pasta Bowl': 'Tazón de Pasta',
    'Mac & Cheese': 'Mac & Cheese',
    'Quesadilla': 'Quesadilla',
    'Fruit & Yogurt Parfait': 'Parfait de Frutas y Yogur',
    'Stovetop Stir-Fry': 'Salteado a la Estufa',
    'Microwave Mug Meal': 'Comida de Taza al Microondas',
    'No-Cook Wrap': 'Wrap Sin Cocción',
    'Bean & Rice Bowl': 'Tazón de Frijoles y Arroz',
    'Tacos': 'Tacos',
    'Fried Rice': 'Arroz Frito',
    'Noodle Stir-Fry': 'Salteado de Fideos',
    'Pasta with Sauce': 'Pasta con Salsa',
    'Caprese Salad': 'Ensalada Caprese',
    'Bruschetta': 'Bruschetta',
    'Hummus Plate': 'Plato de Hummus',
    'Greek Salad': 'Ensalada Griega',
    'Pita Wrap': 'Wrap de Pita',

    // === DonorImpactDashboard ===
    'Your Impact Dashboard': 'Tu Panel de Impacto',
    "See the difference you're making": 'Ve la diferencia que estás haciendo',
    'This Week': 'Esta Semana',
    'This Month': 'Este Mes',
    'This Year': 'Este Año',
    'All Time': 'Todo el Tiempo',
    'Impact Score': 'Puntuación de Impacto',
    'Based on your donations and community engagement': 'Basado en tus donaciones y participación comunitaria',
    'out of 100': 'de 100',
    'Day Streak!': '¡Días Seguidos!',
    'Total Donations': 'Donaciones Totales',
    'Pounds Donated': 'Libras Donadas',
    'Meals Provided': 'Comidas Proporcionadas',
    'Environmental Impact': 'Impacto Ambiental',
    'lbs CO₂ Prevented': 'lbs CO₂ Evitado',
    'Equal to': 'Equivalente a',
    'miles driven': 'millas conducidas',
    'Gallons Water Saved': 'Galones de Agua Ahorrados',
    'showers': 'duchas',
    'Value to Recipients': 'Valor para Beneficiarios',
    'Approximate grocery value': 'Valor aproximado de compra',
    'Badges & Achievements': 'Insignias y Logros',
    'First Share': 'Primer Compartir',
    '10 Donations': '10 Donaciones',
    '100 Meals': '100 Comidas',
    '7 Day Streak': 'Racha de 7 Días',
    'Eco Warrior': 'Guerrero Ecológico',
    '50 Donations': '50 Donaciones',
    '100 Donations': '100 Donaciones',
    'Community Hero': 'Héroe Comunitario',
    'Recent Donations': 'Donaciones Recientes',
    'Claimed by': 'Reclamado por',
    'Provided': 'Proporcionado',
    'meals': 'comidas',

    // === DispatchDashboard ===
    'Dispatch Control': 'Control de Despacho',
    'Force Replan': 'Forzar Replanificación',
    'Open Donations': 'Donaciones Abiertas',
    'Open Requests': 'Solicitudes Abiertas',
    'Active Volunteers': 'Voluntarios Activos',
    'Completed Today': 'Completadas Hoy',
    'SLA Compliance': 'Cumplimiento SLA',
    'Avg Response': 'Respuesta Promedio',
    'SLA Risk Items': 'Artículos en Riesgo SLA',
    'No active alerts': 'No hay alertas activas',
    'All items within SLA': 'Todos los artículos dentro de SLA',
    'h overdue': 'h de retraso',
    'priority': 'prioridad',
    'Escalate': 'Escalar',
    'Access denied. Dispatcher role required.': 'Acceso denegado. Se requiere rol de despachador.',

    // === VoiceSearch ===
    'Voice search not supported, enabling text input fallback': 'Búsqueda por voz no compatible, habilitando entrada de texto',
    'I can help you find food!': '¡Puedo ayudarte a encontrar comida!',
    "Try saying things like 'Where can I get produce near me?' or 'Is anything open after 6?'":
      'Intenta decir cosas como "¿Dónde puedo conseguir productos cerca?" o "¿Hay algo abierto después de las 6?"',
    'Going to': 'Yendo a',
    "To claim food, browse available listings and tap the 'Claim' button.":
      'Para reclamar comida, explora los anuncios disponibles y toca el botón "Reclamar".',
    'Would you like me to show you available food?': '¿Quieres que te muestre la comida disponible?',

    // === FavoritesPanel ===
    'My Favorite Locations': 'Mis Ubicaciones Favoritas',
    'Your trusted spots for food access': 'Tus lugares de confianza para acceso a comida',
    'Search favorites...': 'Buscar favoritos...',
    'All Types': 'Todos los Tipos',
    'Trusted Donors': 'Donantes de Confianza',
    'General Locations': 'Ubicaciones Generales',
    'Loading favorites...': 'Cargando favoritos...',
    'No matching favorites': 'No hay favoritos que coincidan',
    'Try adjusting your search or filter': 'Prueba ajustar tu búsqueda o filtro',
    'No favorites yet': 'Aún no hay favoritos',
    'Save locations by clicking the star icon on listings and distribution centers':
      'Guarda ubicaciones haciendo clic en el icono de estrella en anuncios y centros de distribución',
    'Trusted Donor': 'Donante de Confianza',
    'Saved Location': 'Ubicación Guardada',
    'Mark Visit': 'Marcar Visita',
    'Get directions': 'Obtener indicaciones',
    'Saved Locations': 'Ubicaciones Guardadas',
    'Total Visits': 'Visitas Totales',
    'With Alerts': 'Con Alertas',
    'Notifications enabled': 'Notificaciones activadas',
    'km radius': 'radio en km',
    'Remove this location from your favorites?': '¿Eliminar esta ubicación de tus favoritos?',
    'Location removed from favorites': 'Ubicación eliminada de favoritos',
    'Failed to remove favorite': 'Error al eliminar favorito',

    // === DietaryPreferences ===
    'Help us find the best food matches for your needs': 'Ayúdanos a encontrar las mejores coincidencias de comida para tus necesidades',
    'Household Size': 'Tamaño del Hogar',
    'person': 'persona',
    'people': 'personas',
    'in your household': 'en tu hogar',
    'This helps us recommend appropriate portion sizes': 'Esto nos ayuda a recomendar tamaños de porción apropiados',
    'Dietary Restrictions': 'Restricciones Dietéticas',
    'Gluten-Free': 'Sin Gluten',
    'Dairy-Free': 'Sin Lácteos',
    'Diabetic-Friendly': 'Apto para Diabéticos',
    'Low-Sodium': 'Bajo en Sodio',
    'Keto': 'Keto',
    'Paleo': 'Paleo',
    'Nut-Free': 'Sin Frutos Secos',
    'Allergies & Food Sensitivities': 'Alergias y Sensibilidades Alimentarias',
    'Peanuts': 'Maní',
    'Tree Nuts': 'Frutos Secos',
    'Dairy': 'Lácteos',
    'Eggs': 'Huevos',
    'Soy': 'Soya',
    'Wheat/Gluten': 'Trigo/Gluten',
    'Fish': 'Pescado',
    'Shellfish': 'Mariscos',
    'Sesame': 'Sésamo',
    'Corn': 'Maíz',
    'Sulfites': 'Sulfitos',
    "We'll filter out foods containing these allergens": 'Filtraremos los alimentos que contengan estos alérgenos',
    'Preferred Food Types': 'Tipos de Comida Preferidos',
    'Beverages': 'Bebidas',
    'Additional Notes (Optional)': 'Notas Adicionales (Opcional)',
    'Any other dietary needs, preferences, or requirements we should know about...':
      'Otras necesidades dietéticas, preferencias o requisitos que debamos conocer...',
    'Your Dietary Profile': 'Tu Perfil Dietético',
    'Restrictions:': 'Restricciones:',
    'Dietary preferences saved successfully!': '¡Preferencias dietéticas guardadas con éxito!',
    'Failed to save dietary preferences. Please try again.': 'Error al guardar preferencias dietéticas. Por favor intenta de nuevo.',

    // === AllergenDietaryFlags ===
    'Nuts': 'Frutos secos',
    'Gluten': 'Gluten',
    'Allergen Warning': 'Advertencia de Alérgenos',
    'Contains': 'Contiene',
    'allergen': 'alérgeno',
    'allergens': 'alérgenos',
    'SEVERE ALLERGY RISK - If you have allergies to these items, DO NOT consume':
      'RIESGO DE ALERGIA SEVERA - Si tienes alergias a estos artículos, NO consumas',
    'Check ingredients carefully if you have food allergies': 'Verifica los ingredientes cuidadosamente si tienes alergias alimentarias',
    'Prepared in shared kitchen': 'Preparado en cocina compartida',
    'Prepared in a facility that also processes common allergens': 'Preparado en una instalación que también procesa alérgenos comunes',
    'Shared equipment': 'Equipo compartido',
    'Prepared using equipment shared with allergen-containing foods': 'Preparado usando equipo compartido con alimentos que contienen alérgenos',
    'May contain traces': 'Puede contener trazas',
    'May contain traces of allergens due to production process': 'Puede contener trazas de alérgenos debido al proceso de producción',
    'Home kitchen': 'Cocina casera',
    'Prepared in a home kitchen (allergen exposure varies)': 'Preparado en una cocina casera (la exposición a alérgenos varía)',
    'No meat, poultry, or fish': 'Sin carne, aves ni pescado',
    'No animal products (meat, dairy, eggs, honey)': 'Sin productos animales (carne, lácteos, huevos, miel)',
    'Prepared according to Islamic dietary guidelines': 'Preparado según las pautas dietéticas islámicas',
    'Prepared according to Jewish dietary laws': 'Preparado según las leyes dietéticas judías',
    'Does not contain gluten': 'No contiene gluten',
    'Does not contain dairy products': 'No contiene lácteos',
    'Does not contain nuts': 'No contiene frutos secos',

    // === PickupReminders ===
    'Never miss a food pickup': 'Nunca te pierdas una recogida de comida',
    'Reminders': 'Recordatorios',
    'Upcoming': 'Próximos',
    'Reminder settings updated!': '¡Configuración de recordatorios actualizada!',
    'Failed to update settings': 'Error al actualizar configuración',
    'Reminder scheduled!': '¡Recordatorio programado!',
    'Failed to schedule reminder': 'Error al programar recordatorio',
    'Reminder cancelled': 'Recordatorio cancelado',
    'Failed to cancel reminder': 'Error al cancelar recordatorio',
    'Reminder snoozed for': 'Recordatorio pospuesto por',
    'minutes': 'minutos',
    'Overdue': 'Atrasado',
    'Enable Reminders': 'Activar Recordatorios',
    'Advance Notice (hours)': 'Aviso Anticipado (horas)',
    'SMS Reminders': 'Recordatorios SMS',
    'Email Reminders': 'Recordatorios por Correo',
    'Auto Reminder': 'Recordatorio Automático',
    'Snooze': 'Posponer',
    '30 minutes': '30 minutos',
    '1 hour': '1 hora',
    '2 hours': '2 horas',
    'Cancel Reminder': 'Cancelar Recordatorio',

    // === ConsumptionTracker ===
    'Food Consumption Tracker': 'Rastreador de Consumo de Comida',
    'Log Consumption': 'Registrar Consumo',
    'Log Food Consumption': 'Registrar Consumo de Comida',
    'Food name (e.g., Apples, Leftover pasta)': 'Nombre de la comida (ej., Manzanas, Pasta sobrante)',
    'Kilograms': 'Kilogramos',
    'Cups': 'Tazas',
    'Food Bank Donation': 'Donación de Banco de Alimentos',
    'Own Garden/Tree': 'Jardín/Árbol Propio',
    'Purchased': 'Comprado',
    'Home Leftovers': 'Sobras de Casa',
    'Notes (optional)': 'Notas (opcional)',
    'Recent Consumption (Last 30 days)': 'Consumo Reciente (Últimos 30 días)',
    'No consumption logs yet': 'Aún no hay registros de consumo',
    'Start Tracking': 'Comenzar Seguimiento',
    'Consumption logged successfully!': '¡Consumo registrado con éxito!',
    'Failed to log consumption. Please try again.': 'Error al registrar consumo. Por favor intenta de nuevo.',

    // === ExpirationEducation ===
    'Sell By': 'Vender Antes De',
    'For stores, not you': 'Para las tiendas, no para ti',
    'This tells the store when to rotate stock. The food is still good for days or weeks after this date if stored properly.':
      'Esto le dice a la tienda cuándo rotar el inventario. La comida sigue siendo buena por días o semanas después de esta fecha si se almacena correctamente.',
    'Safe to eat after this date': 'Seguro para comer después de esta fecha',
    'Check for freshness using your senses - look, smell, and taste a small amount.':
      'Verifica la frescura usando tus sentidos - mira, huele y prueba una pequeña cantidad.',
    'Use By': 'Usar Antes De',
    'Best quality deadline': 'Fecha límite de mejor calidad',
    'The manufacturer suggests using by this date for best quality and flavor. Most foods are still safe after this date.':
      'El fabricante sugiere usar antes de esta fecha para la mejor calidad y sabor. La mayoría de los alimentos siguen siendo seguros después de esta fecha.',
    'Usually safe if stored properly': 'Generalmente seguro si se almacena correctamente',
    "Check the food carefully. If it looks, smells, and tastes normal, it's likely fine.":
      'Verifica la comida cuidadosamente. Si se ve, huele y sabe normal, probablemente está bien.',
    'Best By': 'Mejor Antes De',
    'Peak quality date': 'Fecha de calidad óptima',
    "This is when the food tastes best. It doesn't mean the food is unsafe after this date - just that flavor or texture might change.":
      'Esto es cuando la comida sabe mejor. No significa que la comida sea insegura después de esta fecha - solo que el sabor o la textura pueden cambiar.',
    'Quality may decline, but food is still safe. Canned goods often last years past this date.':
      'La calidad puede disminuir, pero la comida sigue siendo segura. Los enlatados a menudo duran años después de esta fecha.',
    'Expires On': 'Vence El',
    'Safety deadline': 'Fecha límite de seguridad',
    'This date is used for foods where safety is a concern. Do not consume these items after the expiration date.':
      'Esta fecha se usa para alimentos donde la seguridad es una preocupación. No consumas estos artículos después de la fecha de vencimiento.',
    'Do not consume after this date': 'No consumir después de esta fecha',
    'Discard after this date. Used mainly for baby formula, certain medications, and highly perishable items.':
      'Desechar después de esta fecha. Usado principalmente para fórmula infantil, ciertos medicamentos y artículos altamente perecederos.',
    'No date provided': 'No se proporcionó fecha',
    'd ago': 'd atrás',
    'Do not consume': 'No consumir',
    'd past label': 'd después de la etiqueta',
    'Use today': 'Usar hoy',
    'Expires today': 'Vence hoy',
    'd left': 'd restantes',
    'Still Fresh': 'Aún Fresco',

    // === ReferralDashboard ===
    'Referral Program': 'Programa de Referidos',
    'Copy to clipboard': 'Copiar al portapapeles',
    'Share Referral Code': 'Compartir Código de Referido',
    'Share your referral code with friends': 'Comparte tu código de referido con amigos',
    'They enter it when signing up': 'Lo ingresan cuando se registran',
    'Help grow the Food Maps community': 'Ayuda a crecer la comunidad de Food Maps',
    'Reduce food waste together!': '¡Reduce el desperdicio de comida juntos!',

    // === StoreOwnerDashboard ===
    'You need to set up a distribution center first. Please contact an administrator.':
      'Primero necesitas configurar un centro de distribución. Por favor contacta a un administrador.',
    'Go Back': 'Regresar',
    '+ Add Food Item': '+ Agregar Artículo',
    'Center Info': 'Información del Centro',
    'Inventory': 'Inventario',
    'Item added successfully!': '¡Artículo agregado con éxito!',
    'Are you sure you want to delete this item?': '¿Estás seguro de que deseas eliminar este artículo?',
    'Item deleted successfully': 'Artículo eliminado con éxito',
    'Failed to delete item': 'Error al eliminar artículo',

    // === Auth ===
    'Create Account': 'Crear Cuenta',
    'Invalid email or password': 'Correo electrónico o contraseña inválidos',
    'Please enter a valid email address': 'Por favor ingresa una dirección de correo electrónico válida',
    'Invalid token received': 'Token inválido recibido',
    'Network error': 'Error de red',
    'Account creation failed': 'Error al crear cuenta',
    'Demo Users': 'Usuarios de Demo',
    'Try a Demo Account': 'Prueba una Cuenta de Demo',
    'Select Role': 'Seleccionar Rol',
    'Optional - Enter if you have one': 'Opcional - Ingresa si tienes uno',
    'Need an account?': '¿Necesitas una cuenta?',
    'I agree to the Terms of Service and Privacy Policy': 'Acepto los Términos de Servicio y la Política de Privacidad',
    'Please complete the captcha verification': 'Por favor completa la verificación captcha',
    'Captcha Verification': 'Verificación Captcha',
    'Verify': 'Verificar',

    // === ListingCard urgency labels & banners ===
    'Critical': 'Crítico',
    'High': 'Alto',
    'Expired': 'Expirado',
    'Safety Verified': 'Seguridad Verificada',
    'Cancel': 'Cancelar',
    'Remove': 'Quitar',

    // === SmartNotifications ===
    ' Smart Notifications': ' Notificaciones Inteligentes',
    'Smart Notifications': 'Notificaciones Inteligentes',
    'AI learns what you care about - no spam': 'La IA aprende lo que te importa - sin spam',
    ' Settings': ' Configuración',
    'Settings': 'Configuración',
    'Enable Smart Notifications': 'Habilitar Notificaciones Inteligentes',
    'Get notified about fresh food near you, saved location restocks, and urgent items - only when it matters.':
      'Recibe notificaciones sobre comida fresca cerca de ti, reabastecimientos en ubicaciones guardadas y artículos urgentes - solo cuando importe.',
    'Enable Notifications': 'Habilitar Notificaciones',
    'Notifications Blocked': 'Notificaciones Bloqueadas',
    'Please enable notifications in your browser settings to receive smart alerts.':
      'Por favor habilita las notificaciones en la configuración de tu navegador para recibir alertas inteligentes.',
    ' Smart Notifications Active': ' Notificaciones Inteligentes Activas',
    'Smart Notifications Active': 'Notificaciones Inteligentes Activas',
    '⏸ Notifications Paused': '⏸ Notificaciones en Pausa',
    'Notifications Paused': 'Notificaciones en Pausa',
    'No notifications will be sent': 'No se enviarán notificaciones',
    'Enabled': 'Habilitado',
    'Max Distance': 'Distancia Máxima',
    'Daily Limit': 'Límite Diario',
    'Mode': 'Modo',
    ' Urgent Only': ' Solo Urgentes',
    'Urgent Only': 'Solo Urgentes',
    ' AI Learning Your Preferences': ' La IA Aprende Tus Preferencias',
    'AI Learning Your Preferences': 'La IA Aprende Tus Preferencias',
    'Categories You Like:': 'Categorías Que Te Gustan:',
    'Response Rate:': 'Tasa de Respuesta:',
    'Advanced Settings': 'Configuración Avanzada',
    'Quiet Hours (No Notifications)': 'Horas de Silencio (Sin Notificaciones)',
    'Start': 'Inicio',
    'End': 'Fin',
    ' Send Test Notification': ' Enviar Notificación de Prueba',
    'Send Test Notification': 'Enviar Notificación de Prueba',
    'Recent Notifications': 'Notificaciones Recientes',
    ' Notifications': ' Notificaciones',
    'Notifications': 'Notificaciones',
    'Notifications enabled': 'Notificaciones habilitadas',
    'Notifications disabled': 'Notificaciones deshabilitadas',
    'Please enable notifications first': 'Por favor habilita las notificaciones primero',
    'This browser does not support notifications': 'Este navegador no admite notificaciones',

    // === FeedbackModal ===
    'Send Feedback': 'Enviar Comentarios',
    'Help us improve Food Maps': 'Ayúdanos a mejorar Food Maps',
    'What type of feedback is this?': '¿Qué tipo de comentario es este?',
    'Bug Report': 'Reporte de Error',
    "Report something that isn't working": 'Reporta algo que no funciona',
    'Error Report': 'Reporte de Error Técnico',
    'Report a technical error': 'Reportar un error técnico',
    'Feature Request': 'Solicitud de Función',
    'Suggest a new feature': 'Sugerir una nueva función',
    'Improvement': 'Mejora',
    'Suggest an enhancement': 'Sugerir una mejora',
    'General Feedback': 'Comentarios Generales',
    'Share your thoughts': 'Comparte tus pensamientos',
    'Subject *': 'Asunto *',
    'Brief description of the issue or feedback': 'Breve descripción del problema o comentario',
    'Details *': 'Detalles *',
    'Please provide as much detail as possible. What happened? What did you expect to happen?':
      'Proporciona la mayor cantidad de detalles posible. ¿Qué pasó? ¿Qué esperabas que pasara?',
    'The more details you provide, the better we can help!':
      '¡Cuantos más detalles proporciones, mejor podremos ayudarte!',
    'Email (optional)': 'Correo electrónico (opcional)',
    "We'll use this to follow up with you (optional)":
      'Usaremos esto para hacer seguimiento contigo (opcional)',
    'Error Information (automatically captured)': 'Información de Error (capturada automáticamente)',
    'Include Screenshot': 'Incluir Captura de Pantalla',
    'Capturing...': 'Capturando...',
    'Captured': 'Capturado',
    'Capture Screen': 'Capturar Pantalla',
    'A screenshot helps us understand the issue better':
      'Una captura de pantalla nos ayuda a entender mejor el problema',
    'Screenshot attached': 'Captura adjunta',
    'Technical information (automatically included)':
      'Información técnica (incluida automáticamente)',
    'URL:': 'URL:',
    'Browser:': 'Navegador:',
    'Submitting...': 'Enviando...',
    'Submit Feedback': 'Enviar Comentarios',
    'Thank You!': '¡Gracias!',
    'Your feedback has been submitted successfully.': 'Tus comentarios se han enviado correctamente.',
    'We appreciate you taking the time to help us improve.':
      'Apreciamos que te hayas tomado el tiempo para ayudarnos a mejorar.',
    'Screenshot library is still loading. Please try again in a moment.':
      'La biblioteca de capturas de pantalla aún se está cargando. Por favor inténtalo de nuevo en un momento.',
    'Please Wait': 'Por Favor Espera',
    'Screenshot captured successfully!': '¡Captura de pantalla exitosa!',
    'Success': 'Éxito',
    'Could not capture screenshot. Please describe the issue in detail instead.':
      'No se pudo capturar la pantalla. Por favor describe el problema en detalle.',
    'Could not capture screenshot. Please describe the issue in detail.':
      'No se pudo capturar la pantalla. Por favor describe el problema en detalle.',
    'Capture Failed': 'Captura Fallida',
    'Failed to submit feedback. Please try again or contact support directly.':
      'No se pudieron enviar los comentarios. Por favor inténtalo de nuevo o contacta a soporte directamente.',

    // === FeedbackViewer (admin) ===
    'User Feedback & Reports': 'Comentarios y Reportes de Usuarios',
    'Manage user feedback and error reports': 'Gestiona comentarios y reportes de error de usuarios',
    'Type': 'Tipo',
    'All Types': 'Todos los Tipos',
    ' Bug Reports': ' Reportes de Error',
    'Bug Reports': 'Reportes de Error',
    ' Error Reports': ' Reportes de Error Técnico',
    'Error Reports': 'Reportes de Error Técnico',
    ' Feature Requests': ' Solicitudes de Función',
    'Feature Requests': 'Solicitudes de Función',
    ' Improvements': ' Mejoras',
    'Improvements': 'Mejoras',
    ' General': ' General',
    'General': 'General',
    'Status': 'Estado',
    'All Statuses': 'Todos los Estados',
    'New': 'Nuevo',
    'Reviewing': 'En Revisión',
    'In Progress': 'En Progreso',
    'Resolved': 'Resuelto',
    'Closed': 'Cerrado',
    'Loading feedback...': 'Cargando comentarios...',
    'No feedback found': 'No se encontraron comentarios',
    'Feedback Details': 'Detalles del Comentario',
    'Subject': 'Asunto',
    'Message': 'Mensaje',
    'Contact Email': 'Correo de Contacto',
    'Page URL': 'URL de la Página',
    'Submitted': 'Enviado',
    'Screenshot': 'Captura de Pantalla',
    'Error Stack Trace': 'Traza de Error',
    'Failed to load screenshot. The image data may be corrupted.':
      'No se pudo cargar la captura. Los datos de la imagen pueden estar corruptos.',
    'Screenshot was captured but data is not available. This may be due to database storage limits.':
      'La captura se tomó pero los datos no están disponibles. Esto puede deberse a límites de almacenamiento en la base de datos.',
    'Failed to load feedback': 'No se pudieron cargar los comentarios',
    'Status updated successfully': 'Estado actualizado correctamente',
    'Failed to update status': 'No se pudo actualizar el estado',

    // === FeedbackViewer dynamic type/status labels (after .replace('_',' ')) ===
    'bug': 'error',
    'error report': 'reporte de error',
    'feature request': 'solicitud de función',
    'improvement': 'mejora',
    'general': 'general',
    'new': 'nuevo',
    'reviewing': 'en revisión',
    'in progress': 'en progreso',
    'resolved': 'resuelto',
    'closed': 'cerrado',

    // === Landing / static HTML ===
    'Food Maps - Share and Find Food': 'Food Maps - Comparte y Encuentra Comida',
    'A simple food sharing app for donors, volunteers, and families. Post food, find nearby options, and arrange pickup quickly.':
      'Una aplicación simple para compartir comida entre donantes, voluntarios y familias. Publica comida, encuentra opciones cercanas y organiza la recogida rápidamente.',
    'A simple way to connect food donors, volunteers, and families. Post food, find nearby options, and arrange pickup quickly.':
      'Una manera simple de conectar donantes de comida, voluntarios y familias. Publica comida, encuentra opciones cercanas y organiza la recogida rápidamente.',
  };

  // Reverse map (Spanish -> English) so the toggle works both directions.
  const REVERSE = {};
  for (const k of Object.keys(PHRASES)) {
    REVERSE[PHRASES[k]] = k;
  }

  // Pattern-based translations for text containing dynamic values that
  // exact-match lookup can't handle (e.g. "URGENT - Expires in 2h!",
  // "Packaging: Excellent", "3/5 sent today", "0.5 mi"). Patterns run
  // AFTER exact-match misses. Capture groups are substituted into the
  // target with $1, $2, ... Use anchored regexes to avoid partial matches
  // that could mistranslate user content.
  const PATTERNS_EN_TO_ES = [
    { re: /^URGENT - Expires in (.+)!$/,                 to: '¡URGENTE - Vence en $1!' },
    { re: /^Claim now before it expires$/,               to: 'Reclama ahora antes de que expire' },
    { re: /^Safety Verified (\d+)%$/,                    to: 'Seguridad Verificada $1%' },
    { re: /^Packaging: Excellent$/,                      to: 'Empaque: Excelente' },
    { re: /^Packaging: Good$/,                           to: 'Empaque: Bueno' },
    { re: /^Packaging: Fair$/,                           to: 'Empaque: Regular' },
    { re: /^Packaging: Poor$/,                           to: 'Empaque: Pobre' },
    { re: /^(\d+)\/(\d+) sent today$/,                   to: '$1/$2 enviadas hoy' },
    { re: /^(\d+)\/day$/,                                to: '$1/día' },
    { re: /^([\d.]+) mi$/,                               to: '$1 mi' },
    { re: /^You click (\d+)% of notifications$/,         to: 'Haces clic en el $1% de las notificaciones' },
  ];
  const PATTERNS_ES_TO_EN = [
    { re: /^¡URGENTE - Vence en (.+)!$/,                 to: 'URGENT - Expires in $1!' },
    { re: /^Reclama ahora antes de que expire$/,         to: 'Claim now before it expires' },
    { re: /^Seguridad Verificada (\d+)%$/,               to: 'Safety Verified $1%' },
    { re: /^Empaque: Excelente$/,                        to: 'Packaging: Excellent' },
    { re: /^Empaque: Bueno$/,                            to: 'Packaging: Good' },
    { re: /^Empaque: Regular$/,                          to: 'Packaging: Fair' },
    { re: /^Empaque: Pobre$/,                            to: 'Packaging: Poor' },
    { re: /^(\d+)\/(\d+) enviadas hoy$/,                 to: '$1/$2 sent today' },
    { re: /^(\d+)\/día$/,                                to: '$1/day' },
    { re: /^Haces clic en el (\d+)% de las notificaciones$/, to: 'You click $1% of notifications' },
  ];

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
      ? { primary: PHRASES, secondary: null, patterns: PATTERNS_EN_TO_ES }
      : { primary: REVERSE, secondary: null, patterns: PATTERNS_ES_TO_EN };
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

  function translateText(raw, map, patterns) {
    if (!raw) return null;
    // Preserve leading/trailing whitespace.
    const m = raw.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!m) return null;
    const lead = m[1], core = m[2], trail = m[3];
    if (!core) return null;
    if (Object.prototype.hasOwnProperty.call(map, core)) {
      return lead + map[core] + trail;
    }
    if (patterns && patterns.length) {
      for (let i = 0; i < patterns.length; i++) {
        const p = patterns[i];
        if (p.re.test(core)) {
          return lead + core.replace(p.re, p.to) + trail;
        }
      }
    }
    return null;
  }

  function translateTextNode(node, map, patterns) {
    if (node.nodeType !== 3) return;
    if (shouldSkipNode(node)) return;
    const out = translateText(node.nodeValue, map, patterns);
    if (out !== null && out !== node.nodeValue) {
      node.nodeValue = out;
    }
  }

  function translateAttributes(el, map, patterns) {
    if (!el || el.nodeType !== 1) return;
    if (SKIP_TAGS.has(el.tagName)) return;
    if (el.hasAttribute && el.hasAttribute('data-no-i18n')) return;

    for (const a of TEXT_ATTRS) {
      if (el.hasAttribute && el.hasAttribute(a)) {
        const v = el.getAttribute(a);
        const out = translateText(v, map, patterns);
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
        const out = translateText(v, map, patterns);
        if (out !== null && out !== v) {
          el.value = out;
        }
      }
    }
  }

  function walkAndTranslate(root, map, patterns) {
    if (!root) return;
    if (root.nodeType === 3) {
      translateTextNode(root, map, patterns);
      return;
    }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) {
      if (SKIP_TAGS.has(root.tagName)) return;
      if (root.hasAttribute && root.hasAttribute('data-no-i18n')) return;
      translateAttributes(root, map, patterns);
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
        translateTextNode(n, map, patterns);
      } else if (n.nodeType === 1) {
        translateAttributes(n, map, patterns);
      }
    }
  }

  let observer = null;
  let scheduled = false;
  const pendingRoots = new Set();

  function flush() {
    scheduled = false;
    const lang = (window.i18n && window.i18n.getCurrentLanguage()) || 'en';
    const { primary, patterns } = getTargetMap(lang);
    const roots = Array.from(pendingRoots);
    pendingRoots.clear();
    // Pause observer while we mutate to avoid feedback.
    if (observer) observer.disconnect();
    try {
      for (const r of roots) {
        if (r && r.isConnected !== false) {
          walkAndTranslate(r, primary, patterns);
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

  // Multi-pass sweep used on explicit language toggle. The synchronous
  // translateAll() walks the current DOM, but React components (and
  // async-rendered children such as listing cards loaded after a fetch,
  // map popups, modal contents, lazy-mounted badges) may commit DOM
  // mutations *during* the walk (while the MutationObserver is paused)
  // or shortly after. Those late mutations would otherwise stay in the
  // previous language until the next user interaction. Re-sweep a few
  // times to converge.
  function translateAllDeferred() {
    translateAll();
    // Next animation frame catches mutations that React queued during
    // the synchronous walk (observer was disconnected then).
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(function () {
        pendingRoots.add(document.body || document.documentElement);
        if (!scheduled) { scheduled = true; flush(); }
      });
    }
    // Catch slower async renders (data fetches, image loads triggering
    // layout-dependent text, leaflet popups, dynamically mounted
    // subcomponents) without being so late that the UI feels laggy.
    setTimeout(function () {
      pendingRoots.add(document.body || document.documentElement);
      if (!scheduled) { scheduled = true; flush(); }
    }, 250);
    setTimeout(function () {
      pendingRoots.add(document.body || document.documentElement);
      if (!scheduled) { scheduled = true; flush(); }
    }, 1000);
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
    translateAllDeferred();
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
