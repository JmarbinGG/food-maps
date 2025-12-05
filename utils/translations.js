// Multi-language translation system for Food Maps
// Supports: English, Spanish, Chinese, Tagalog, Vietnamese, Arabic, French, Korean

const translations = {
  en: {
    // Navigation
    'nav.features': 'Features',
    'nav.howItWorks': 'How It Works',
    'nav.impact': 'Impact',
    'nav.impactStory': 'Impact Story',
    'nav.donate': 'Donate',
    'nav.getStarted': 'Get Started',
    'nav.signIn': 'Sign In',
    'nav.signUp': 'Sign Up',

    // Common
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.loading': 'Loading...',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.view': 'View',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.confirm': 'Confirm',
    'common.yes': 'Yes',
    'common.no': 'No',

    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.name': 'Full Name',
    'auth.phone': 'Phone Number',
    'auth.logout': 'Logout',
    'auth.forgotPassword': 'Forgot Password?',

    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.myListings': 'My Listings',
    'dashboard.createListing': 'Create Listing',
    'dashboard.profile': 'Profile',
    'dashboard.adminPanel': 'Admin Panel',

    // Listings
    'listing.name': 'Item Name',
    'listing.description': 'Description',
    'listing.quantity': 'Quantity',
    'listing.location': 'Location',
    'listing.expiryDate': 'Expiry Date',
    'listing.status': 'Status',
    'listing.available': 'Available',
    'listing.claimed': 'Claimed',
    'listing.expired': 'Expired',

    // Impact Story
    'impact.title': 'Our Impact Story',
    'impact.readMore': 'Read More',
    'impact.watchNow': 'Watch Now',
    'impact.viewAll': 'View All',
    'impact.firstName': 'First Name',
    'impact.lastName': 'Last Name',
    'impact.email': 'Email',
    'impact.mobilePhone': 'Mobile Phone',
    'impact.interestedIn': "I'm interested in:",
    'impact.volunteering': 'Volunteering',
    'impact.donatingFood': 'Donating Food',
    'impact.partnership': 'Partnership Opportunities',
    'impact.updates': 'Monthly Updates',
    'impact.letsGo': "Let's Go!",
  },

  es: {
    // Navigation
    'nav.features': 'Características',
    'nav.howItWorks': 'Cómo Funciona',
    'nav.impact': 'Impacto',
    'nav.impactStory': 'Historia de Impacto',
    'nav.donate': 'Donar',
    'nav.getStarted': 'Comenzar',
    'nav.signIn': 'Iniciar Sesión',
    'nav.signUp': 'Registrarse',

    // Common
    'common.submit': 'Enviar',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.close': 'Cerrar',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.loading': 'Cargando...',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.view': 'Ver',
    'common.download': 'Descargar',
    'common.upload': 'Subir',
    'common.confirm': 'Confirmar',
    'common.yes': 'Sí',
    'common.no': 'No',

    // Auth
    'auth.signIn': 'Iniciar Sesión',
    'auth.signUp': 'Registrarse',
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.confirmPassword': 'Confirmar Contraseña',
    'auth.name': 'Nombre Completo',
    'auth.phone': 'Número de Teléfono',
    'auth.logout': 'Cerrar Sesión',
    'auth.forgotPassword': '¿Olvidó su Contraseña?',

    // Dashboard
    'dashboard.welcome': 'Bienvenido',
    'dashboard.myListings': 'Mis Publicaciones',
    'dashboard.createListing': 'Crear Publicación',
    'dashboard.profile': 'Perfil',
    'dashboard.adminPanel': 'Panel de Administración',

    // Listings
    'listing.name': 'Nombre del Artículo',
    'listing.description': 'Descripción',
    'listing.quantity': 'Cantidad',
    'listing.location': 'Ubicación',
    'listing.expiryDate': 'Fecha de Vencimiento',
    'listing.status': 'Estado',
    'listing.available': 'Disponible',
    'listing.claimed': 'Reclamado',
    'listing.expired': 'Vencido',

    // Impact Story
    'impact.title': 'Nuestra Historia de Impacto',
    'impact.readMore': 'Leer Más',
    'impact.watchNow': 'Ver Ahora',
    'impact.viewAll': 'Ver Todo',
    'impact.firstName': 'Nombre',
    'impact.lastName': 'Apellido',
    'impact.email': 'Correo Electrónico',
    'impact.mobilePhone': 'Teléfono Móvil',
    'impact.interestedIn': 'Estoy interesado en:',
    'impact.volunteering': 'Voluntariado',
    'impact.donatingFood': 'Donar Alimentos',
    'impact.partnership': 'Oportunidades de Asociación',
    'impact.updates': 'Actualizaciones Mensuales',
    'impact.letsGo': '¡Vamos!',
  },

  zh: {
    // Navigation
    'nav.features': '功能',
    'nav.howItWorks': '如何运作',
    'nav.impact': '影响',
    'nav.impactStory': '影响故事',
    'nav.donate': '捐赠',
    'nav.getStarted': '开始使用',
    'nav.signIn': '登录',
    'nav.signUp': '注册',

    // Common
    'common.submit': '提交',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.close': '关闭',
    'common.back': '返回',
    'common.next': '下一步',
    'common.loading': '加载中...',
    'common.search': '搜索',
    'common.filter': '筛选',
    'common.view': '查看',
    'common.download': '下载',
    'common.upload': '上传',
    'common.confirm': '确认',
    'common.yes': '是',
    'common.no': '否',

    // Auth
    'auth.signIn': '登录',
    'auth.signUp': '注册',
    'auth.email': '电子邮件',
    'auth.password': '密码',
    'auth.confirmPassword': '确认密码',
    'auth.name': '全名',
    'auth.phone': '电话号码',
    'auth.logout': '登出',
    'auth.forgotPassword': '忘记密码？',

    // Dashboard
    'dashboard.welcome': '欢迎',
    'dashboard.myListings': '我的列表',
    'dashboard.createListing': '创建列表',
    'dashboard.profile': '个人资料',
    'dashboard.adminPanel': '管理面板',

    // Listings
    'listing.name': '物品名称',
    'listing.description': '描述',
    'listing.quantity': '数量',
    'listing.location': '位置',
    'listing.expiryDate': '到期日期',
    'listing.status': '状态',
    'listing.available': '可用',
    'listing.claimed': '已领取',
    'listing.expired': '已过期',

    // Impact Story
    'impact.title': '我们的影响故事',
    'impact.readMore': '阅读更多',
    'impact.watchNow': '立即观看',
    'impact.viewAll': '查看全部',
    'impact.firstName': '名字',
    'impact.lastName': '姓氏',
    'impact.email': '电子邮件',
    'impact.mobilePhone': '手机号码',
    'impact.interestedIn': '我感兴趣的是：',
    'impact.volunteering': '志愿服务',
    'impact.donatingFood': '捐赠食物',
    'impact.partnership': '合作机会',
    'impact.updates': '每月更新',
    'impact.letsGo': '开始吧！',
  },

  tl: {
    // Navigation (Tagalog)
    'nav.features': 'Mga Tampok',
    'nav.howItWorks': 'Paano Ito Gumagana',
    'nav.impact': 'Epekto',
    'nav.impactStory': 'Kuwento ng Epekto',
    'nav.donate': 'Mag-donate',
    'nav.getStarted': 'Magsimula',
    'nav.signIn': 'Mag-sign In',
    'nav.signUp': 'Mag-sign Up',

    // Common
    'common.submit': 'Isumite',
    'common.cancel': 'Kanselahin',
    'common.save': 'I-save',
    'common.delete': 'Tanggalin',
    'common.edit': 'I-edit',
    'common.close': 'Isara',
    'common.back': 'Bumalik',
    'common.next': 'Susunod',
    'common.loading': 'Naglo-load...',
    'common.search': 'Maghanap',
    'common.filter': 'I-filter',
    'common.view': 'Tingnan',
    'common.download': 'I-download',
    'common.upload': 'Mag-upload',
    'common.confirm': 'Kumpirmahin',
    'common.yes': 'Oo',
    'common.no': 'Hindi',

    // Auth
    'auth.signIn': 'Mag-sign In',
    'auth.signUp': 'Mag-sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Kumpirmahin ang Password',
    'auth.name': 'Buong Pangalan',
    'auth.phone': 'Numero ng Telepono',
    'auth.logout': 'Mag-logout',
    'auth.forgotPassword': 'Nakalimutan ang Password?',

    // Dashboard
    'dashboard.welcome': 'Maligayang pagdating',
    'dashboard.myListings': 'Aking mga Listahan',
    'dashboard.createListing': 'Gumawa ng Listahan',
    'dashboard.profile': 'Profile',
    'dashboard.adminPanel': 'Admin Panel',

    // Listings
    'listing.name': 'Pangalan ng Item',
    'listing.description': 'Deskripsyon',
    'listing.quantity': 'Dami',
    'listing.location': 'Lokasyon',
    'listing.expiryDate': 'Petsa ng Pag-expire',
    'listing.status': 'Katayuan',
    'listing.available': 'Available',
    'listing.claimed': 'Na-claim',
    'listing.expired': 'Nag-expire',

    // Impact Story
    'impact.title': 'Ang Aming Kuwento ng Epekto',
    'impact.readMore': 'Magbasa Pa',
    'impact.watchNow': 'Panoorin Ngayon',
    'impact.viewAll': 'Tingnan Lahat',
    'impact.firstName': 'Pangalan',
    'impact.lastName': 'Apelyido',
    'impact.email': 'Email',
    'impact.mobilePhone': 'Mobile Phone',
    'impact.interestedIn': 'Interesado ako sa:',
    'impact.volunteering': 'Volunteer',
    'impact.donatingFood': 'Pag-donate ng Pagkain',
    'impact.partnership': 'Mga Pagkakataon sa Partnership',
    'impact.updates': 'Buwanang Updates',
    'impact.letsGo': 'Tara Na!',
  },

  vi: {
    // Navigation (Vietnamese)
    'nav.features': 'Tính Năng',
    'nav.howItWorks': 'Cách Hoạt Động',
    'nav.impact': 'Tác Động',
    'nav.impactStory': 'Câu Chuyện Tác Động',
    'nav.donate': 'Quyên Góp',
    'nav.getStarted': 'Bắt Đầu',
    'nav.signIn': 'Đăng Nhập',
    'nav.signUp': 'Đăng Ký',

    // Common
    'common.submit': 'Gửi',
    'common.cancel': 'Hủy',
    'common.save': 'Lưu',
    'common.delete': 'Xóa',
    'common.edit': 'Sửa',
    'common.close': 'Đóng',
    'common.back': 'Quay Lại',
    'common.next': 'Tiếp Theo',
    'common.loading': 'Đang tải...',
    'common.search': 'Tìm Kiếm',
    'common.filter': 'Lọc',
    'common.view': 'Xem',
    'common.download': 'Tải Xuống',
    'common.upload': 'Tải Lên',
    'common.confirm': 'Xác Nhận',
    'common.yes': 'Có',
    'common.no': 'Không',

    // Auth
    'auth.signIn': 'Đăng Nhập',
    'auth.signUp': 'Đăng Ký',
    'auth.email': 'Email',
    'auth.password': 'Mật Khẩu',
    'auth.confirmPassword': 'Xác Nhận Mật Khẩu',
    'auth.name': 'Họ Tên',
    'auth.phone': 'Số Điện Thoại',
    'auth.logout': 'Đăng Xuất',
    'auth.forgotPassword': 'Quên Mật Khẩu?',

    // Dashboard
    'dashboard.welcome': 'Chào Mừng',
    'dashboard.myListings': 'Danh Sách Của Tôi',
    'dashboard.createListing': 'Tạo Danh Sách',
    'dashboard.profile': 'Hồ Sơ',
    'dashboard.adminPanel': 'Bảng Quản Trị',

    // Listings
    'listing.name': 'Tên Món',
    'listing.description': 'Mô Tả',
    'listing.quantity': 'Số Lượng',
    'listing.location': 'Vị Trí',
    'listing.expiryDate': 'Ngày Hết Hạn',
    'listing.status': 'Trạng Thái',
    'listing.available': 'Có Sẵn',
    'listing.claimed': 'Đã Nhận',
    'listing.expired': 'Hết Hạn',

    // Impact Story
    'impact.title': 'Câu Chuyện Tác Động Của Chúng Tôi',
    'impact.readMore': 'Đọc Thêm',
    'impact.watchNow': 'Xem Ngay',
    'impact.viewAll': 'Xem Tất Cả',
    'impact.firstName': 'Tên',
    'impact.lastName': 'Họ',
    'impact.email': 'Email',
    'impact.mobilePhone': 'Điện Thoại Di Động',
    'impact.interestedIn': 'Tôi quan tâm đến:',
    'impact.volunteering': 'Tình Nguyện',
    'impact.donatingFood': 'Quyên Góp Thực Phẩm',
    'impact.partnership': 'Cơ Hội Hợp Tác',
    'impact.updates': 'Cập Nhật Hàng Tháng',
    'impact.letsGo': 'Bắt Đầu Nào!',
  },

  ar: {
    // Navigation (Arabic)
    'nav.features': 'الميزات',
    'nav.howItWorks': 'كيف يعمل',
    'nav.impact': 'التأثير',
    'nav.impactStory': 'قصة التأثير',
    'nav.donate': 'تبرع',
    'nav.getStarted': 'ابدأ',
    'nav.signIn': 'تسجيل الدخول',
    'nav.signUp': 'اشتراك',

    // Common
    'common.submit': 'إرسال',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.close': 'إغلاق',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.loading': 'جارٍ التحميل...',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.view': 'عرض',
    'common.download': 'تنزيل',
    'common.upload': 'رفع',
    'common.confirm': 'تأكيد',
    'common.yes': 'نعم',
    'common.no': 'لا',

    // Auth
    'auth.signIn': 'تسجيل الدخول',
    'auth.signUp': 'اشتراك',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    'auth.name': 'الاسم الكامل',
    'auth.phone': 'رقم الهاتف',
    'auth.logout': 'تسجيل الخروج',
    'auth.forgotPassword': 'هل نسيت كلمة المرور؟',

    // Dashboard
    'dashboard.welcome': 'مرحباً',
    'dashboard.myListings': 'قوائمي',
    'dashboard.createListing': 'إنشاء قائمة',
    'dashboard.profile': 'الملف الشخصي',
    'dashboard.adminPanel': 'لوحة الإدارة',

    // Listings
    'listing.name': 'اسم العنصر',
    'listing.description': 'الوصف',
    'listing.quantity': 'الكمية',
    'listing.location': 'الموقع',
    'listing.expiryDate': 'تاريخ انتهاء الصلاحية',
    'listing.status': 'الحالة',
    'listing.available': 'متاح',
    'listing.claimed': 'محجوز',
    'listing.expired': 'منتهي الصلاحية',

    // Impact Story
    'impact.title': 'قصة تأثيرنا',
    'impact.readMore': 'اقرأ المزيد',
    'impact.watchNow': 'شاهد الآن',
    'impact.viewAll': 'عرض الكل',
    'impact.firstName': 'الاسم الأول',
    'impact.lastName': 'اسم العائلة',
    'impact.email': 'البريد الإلكتروني',
    'impact.mobilePhone': 'رقم الجوال',
    'impact.interestedIn': 'أنا مهتم بـ:',
    'impact.volunteering': 'التطوع',
    'impact.donatingFood': 'التبرع بالطعام',
    'impact.partnership': 'فرص الشراكة',
    'impact.updates': 'التحديثات الشهرية',
    'impact.letsGo': 'لنبدأ!',
  },

  fr: {
    // Navigation (French)
    'nav.features': 'Fonctionnalités',
    'nav.howItWorks': 'Comment Ça Marche',
    'nav.impact': 'Impact',
    'nav.impactStory': 'Histoire d\'Impact',
    'nav.donate': 'Faire un Don',
    'nav.getStarted': 'Commencer',
    'nav.signIn': 'Se Connecter',
    'nav.signUp': 'S\'inscrire',

    // Common
    'common.submit': 'Soumettre',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.close': 'Fermer',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.loading': 'Chargement...',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.view': 'Voir',
    'common.download': 'Télécharger',
    'common.upload': 'Téléverser',
    'common.confirm': 'Confirmer',
    'common.yes': 'Oui',
    'common.no': 'Non',

    // Auth
    'auth.signIn': 'Se Connecter',
    'auth.signUp': 'S\'inscrire',
    'auth.email': 'Email',
    'auth.password': 'Mot de Passe',
    'auth.confirmPassword': 'Confirmer le Mot de Passe',
    'auth.name': 'Nom Complet',
    'auth.phone': 'Numéro de Téléphone',
    'auth.logout': 'Se Déconnecter',
    'auth.forgotPassword': 'Mot de Passe Oublié?',

    // Dashboard
    'dashboard.welcome': 'Bienvenue',
    'dashboard.myListings': 'Mes Annonces',
    'dashboard.createListing': 'Créer une Annonce',
    'dashboard.profile': 'Profil',
    'dashboard.adminPanel': 'Panneau d\'Administration',

    // Listings
    'listing.name': 'Nom de l\'Article',
    'listing.description': 'Description',
    'listing.quantity': 'Quantité',
    'listing.location': 'Emplacement',
    'listing.expiryDate': 'Date d\'Expiration',
    'listing.status': 'Statut',
    'listing.available': 'Disponible',
    'listing.claimed': 'Réclamé',
    'listing.expired': 'Expiré',

    // Impact Story
    'impact.title': 'Notre Histoire d\'Impact',
    'impact.readMore': 'Lire Plus',
    'impact.watchNow': 'Regarder Maintenant',
    'impact.viewAll': 'Voir Tout',
    'impact.firstName': 'Prénom',
    'impact.lastName': 'Nom de Famille',
    'impact.email': 'Email',
    'impact.mobilePhone': 'Téléphone Mobile',
    'impact.interestedIn': 'Je suis intéressé par:',
    'impact.volunteering': 'Bénévolat',
    'impact.donatingFood': 'Don de Nourriture',
    'impact.partnership': 'Opportunités de Partenariat',
    'impact.updates': 'Mises à Jour Mensuelles',
    'impact.letsGo': 'Allons-y!',
  },

  ko: {
    // Navigation (Korean)
    'nav.features': '기능',
    'nav.howItWorks': '작동 방식',
    'nav.impact': '영향',
    'nav.impactStory': '영향 스토리',
    'nav.donate': '기부하기',
    'nav.getStarted': '시작하기',
    'nav.signIn': '로그인',
    'nav.signUp': '회원가입',

    // Common
    'common.submit': '제출',
    'common.cancel': '취소',
    'common.save': '저장',
    'common.delete': '삭제',
    'common.edit': '수정',
    'common.close': '닫기',
    'common.back': '뒤로',
    'common.next': '다음',
    'common.loading': '로딩 중...',
    'common.search': '검색',
    'common.filter': '필터',
    'common.view': '보기',
    'common.download': '다운로드',
    'common.upload': '업로드',
    'common.confirm': '확인',
    'common.yes': '예',
    'common.no': '아니오',

    // Auth
    'auth.signIn': '로그인',
    'auth.signUp': '회원가입',
    'auth.email': '이메일',
    'auth.password': '비밀번호',
    'auth.confirmPassword': '비밀번호 확인',
    'auth.name': '이름',
    'auth.phone': '전화번호',
    'auth.logout': '로그아웃',
    'auth.forgotPassword': '비밀번호를 잊으셨나요?',

    // Dashboard
    'dashboard.welcome': '환영합니다',
    'dashboard.myListings': '내 목록',
    'dashboard.createListing': '목록 만들기',
    'dashboard.profile': '프로필',
    'dashboard.adminPanel': '관리자 패널',

    // Listings
    'listing.name': '항목 이름',
    'listing.description': '설명',
    'listing.quantity': '수량',
    'listing.location': '위치',
    'listing.expiryDate': '만료일',
    'listing.status': '상태',
    'listing.available': '사용 가능',
    'listing.claimed': '청구됨',
    'listing.expired': '만료됨',

    // Impact Story
    'impact.title': '우리의 영향 스토리',
    'impact.readMore': '더 읽기',
    'impact.watchNow': '지금 보기',
    'impact.viewAll': '모두 보기',
    'impact.firstName': '이름',
    'impact.lastName': '성',
    'impact.email': '이메일',
    'impact.mobilePhone': '휴대전화',
    'impact.interestedIn': '관심 분야:',
    'impact.volunteering': '자원봉사',
    'impact.donatingFood': '음식 기부',
    'impact.partnership': '파트너십 기회',
    'impact.updates': '월간 업데이트',
    'impact.letsGo': '시작하기!',
  }
};

// Language names for display
const languageNames = {
  en: 'English',
  es: 'Español',
  zh: '中文',
  tl: 'Tagalog',
  vi: 'Tiếng Việt',
  ar: 'العربية',
  fr: 'Français',
  ko: '한국어'
};

// Get current language from localStorage or default to English
function getCurrentLanguage() {
  return localStorage.getItem('language') || 'en';
}

// Set current language
function setLanguage(lang) {
  if (translations[lang]) {
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    // Set RTL for Arabic
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
    return true;
  }
  return false;
}

// Get translation for a key
function t(key, lang = null) {
  const currentLang = lang || getCurrentLanguage();
  return translations[currentLang]?.[key] || translations.en[key] || key;
}

// Translate all elements with data-i18n attribute
function translatePage() {
  const lang = getCurrentLanguage();
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = t(key, lang);

    // Handle different element types
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      if (element.placeholder) {
        element.placeholder = translation;
      }
    } else {
      element.textContent = translation;
    }
  });

  // Translate placeholders separately
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.placeholder = t(key, lang);
  });
}

// Initialize language system
function initLanguageSystem() {
  const lang = getCurrentLanguage();
  setLanguage(lang);
  translatePage();
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.i18n = {
    t,
    getCurrentLanguage,
    setLanguage,
    translatePage,
    initLanguageSystem,
    translations,
    languageNames
  };
}
