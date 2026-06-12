export type AppLanguage = 'English' | 'Hindi' | 'Hinglish' | 'Marathi' | 'Tamil' | 'Bengali' | 'Spanish' | 'French' | 'German';

export const LANGUAGES: { code: AppLanguage; label: string; flag: string }[] = [
  { code: 'English', label: 'English', flag: '🇬🇧' },
  { code: 'Hindi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'Hinglish', label: 'Mixed (English + Hindi)', flag: '🔄' },
  { code: 'Marathi', label: 'मराठी', flag: '🇮🇳' },
  { code: 'Tamil', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'Bengali', label: 'বাংলা', flag: '🇮🇳' },
  { code: 'Spanish', label: 'Español', flag: '🇪🇸' },
  { code: 'French', label: 'Français', flag: '🇫🇷' },
  { code: 'German', label: 'Deutsch', flag: '🇩🇪' }
];

export const TRANSLATIONS: Record<string, Record<AppLanguage, string>> = {
  'home': {
    English: 'Home',
    Hindi: 'होम',
    Hinglish: 'Home Screen',
    Marathi: 'मुख्य पृष्ठ',
    Tamil: 'முகப்பு',
    Bengali: 'হোম',
    Spanish: 'Inicio',
    French: 'Accueil',
    German: 'Startseite'
  },
  'ai_tutor': {
    English: 'AI Tutor',
    Hindi: 'एआई टीचर',
    Hinglish: 'AI Tutor',
    Marathi: 'एआय शिक्षक',
    Tamil: 'AI ஆசிரியர்',
    Bengali: 'এআই শিক্ষক',
    Spanish: 'Tutor IA',
    French: 'Tuteur IA',
    German: 'KI-Lehrer'
  },
  'groups': {
    English: 'Groups',
    Hindi: 'समूह',
    Hinglish: 'Groups',
    Marathi: 'गट',
    Tamil: 'குழுக்கள்',
    Bengali: 'গ্রুপ সমূহ',
    Spanish: 'Grupos',
    French: 'Groupes',
    German: 'Gruppen'
  },
  'notebook': {
    English: 'Notebook',
    Hindi: 'नोटबुक',
    Hinglish: 'Copy-Notes',
    Marathi: 'वही',
    Tamil: 'குறிப்பேடு',
    Bengali: 'নোটবুক',
    Spanish: 'Cuaderno',
    French: 'Cahier',
    German: 'Notizbuch'
  },
  'quiz': {
    English: 'Quiz',
    Hindi: 'क्विज़',
    Hinglish: 'Test Game',
    Marathi: 'चाचणी',
    Tamil: 'வினாடி வினா',
    Bengali: 'কুইজ',
    Spanish: 'Examen',
    French: 'Quiz',
    German: 'Quiz'
  },
  'buddies_title': {
    English: 'Online Study Buddies',
    Hindi: 'ऑनलाइन सहपाठी',
    Hinglish: 'Padhai ke Online Dost',
    Marathi: 'ऑनलाइन अभ्यास मित्र',
    Tamil: 'ஆன்லைன் படிப்பு தோழர்கள்',
    Bengali: 'অনলাইন সহপাঠী',
    Spanish: 'Amigos de estudio en línea',
    French: 'Camarades d\'étude en ligne',
    German: 'Online-Studienpartner'
  },
  'playground_title': {
    English: 'Academy Playground',
    Hindi: 'अकादमी प्लेग्राउंड',
    Hinglish: 'Study Playground',
    Marathi: 'शैक्षणिक मैदान',
    Tamil: 'பயிற்சி மைதானம்',
    Bengali: 'একাডেমিক খেলার মাঠ',
    Spanish: 'Área de estudio de la Academia',
    French: 'Espace d\'étude de la classe',
    German: 'Akademie-Spielplatz'
  },
  'badges_title': {
    English: 'Academic Badges',
    Hindi: 'शैक्षणिक पदक और पुरस्कार',
    Hinglish: 'Earned Awards & Badges',
    Marathi: 'शैक्षणिक पदके आणि बक्षिसे',
    Tamil: 'கல்வி பதக்கங்கள் மற்றும் விருதுகள்',
    Bengali: 'একাডেমিক ব্যাজ এবং পুরস্কার',
    Spanish: 'Logros y medallas académicas',
    French: 'Badges et récompenses académiques',
    German: 'Akademische Auszeichnungen'
  },
  'progress_title': {
    English: 'Learning Progress',
    Hindi: 'सीखने की प्रगति रिपोर्ट',
    Hinglish: 'Your Study Progress',
    Marathi: 'अभ्यासातील प्रगती',
    Tamil: 'கற்றல் முன்னேற்ற அறிக்கை',
    Bengali: 'পড়াশোনার অগ্রগতি কার্ড',
    Spanish: 'Progreso de aprendizaje',
    French: 'Rapport d\'apprentissage',
    German: 'Lernfortschrittsbericht'
  },
  'switch_profile': {
    English: 'Switch Profile',
    Hindi: 'प्रोफ़ाइल बदलें',
    Hinglish: 'Profile Change Karein',
    Marathi: 'प्रोफाइल बदला',
    Tamil: 'சுயவிவரத்தை மாற்று',
    Bengali: 'প্রোফাইল পরিবর্তন',
    Spanish: 'Cambiar Perfil',
    French: 'Changer de Profil',
    German: 'Profil wechseln'
  },
  'live_assistant': {
    English: 'Live Assistant',
    Hindi: 'लाइव सहायक',
    Hinglish: 'Live Helper',
    Marathi: 'थेट सहाय्यक',
    Tamil: 'செயலில் உள்ள உதவியாளர்',
    Bengali: 'লাইভ সহকারী',
    Spanish: 'Asistente en vivo',
    French: 'Assistant en direct',
    German: 'Live-Assistent'
  },
  'tutor_desc': {
    English: 'Answers homework & designs custom drawings/diagrams',
    Hindi: 'होमवर्क के उत्तर देता है और चित्र/आरेख बनाता है',
    Hinglish: 'Answers homework provides explanation with nice drawings',
    Marathi: 'गृहपाठाची उत्तरे देतो आणि आकृत्या काढतो',
    Tamil: 'வீட்டுப்பாடம் மற்றும் வரைபடங்களுக்கு உதவும்',
    Bengali: 'সব হোমওয়ার্ক সমাধান ও ছবি এঁके সাহায্য করে',
    Spanish: 'Resuelve tareas y genera diagramas educativos',
    French: 'Résout vos exercices et crée des illustrations',
    German: 'Löst Aufgaben und erstellt Zeichnungen'
  },
  'practice_desc': {
    English: 'Test subject skills, earn dynamic XP medals',
    Hindi: 'विषयों का परीक्षण करें, XP पदक अर्जित करें',
    Hinglish: 'Practice questions to get more XP badges',
    Marathi: 'विषयांचा सराव करा आणि अधिक XP मिळवा',
    Tamil: 'திறன்களை சோதித்து XP பதக்கங்களை வெல்லுங்கள்',
    Bengali: 'নিজের স্কিল ঝালিয়ে নিয়ে নতুন XP জেতো',
    Spanish: 'Prueba tus destrezas y acumula medallas de XP',
    French: 'Testez vos forces et cumulez des XP',
    German: 'Machen Sie Tests und sammeln Sie XP'
  },
  'notebook_desc': {
    English: 'Formula sheets & key facts',
    Hindi: 'सूत्र पत्रक और प्रमुख तथ्य',
    Hinglish: 'Formula sheets aur important facts',
    Marathi: 'सूत्रांची पाने आणि महत्त्वाचे तथ्य',
    Tamil: 'சூத்திரங்கள் மற்றும் முக்கிய குறிப்புகள்',
    Bengali: 'সব ফর্মুলা ও দরকারী তথ্যের খাতা',
    Spanish: 'Fórmulas y conceptos importantes',
    French: 'Formulaires et concepts clés',
    German: 'Formeln und wichtige Konzepte'
  },
  'planner_desc': {
    English: 'Class timings & assignments',
    Hindi: 'कक्षा समय सारणी और असाइनमेंट',
    Hinglish: 'Class schedules aur homeworks tracker',
    Marathi: 'वर्गाचे वेळापत्रक आणि गृहपाठ',
    Tamil: 'வகுப்பு நேரங்கள் மற்றும் பணிகள்',
    Bengali: 'ক্লাস রুটিন ও পরীক্ষার খাতা',
    Spanish: 'Horario y organizador de tareas',
    French: 'Agenda de classe et devoirs',
    German: 'Stundenplan & Aufgabenliste'
  },
  'academic_buddies_footer': {
    English: 'Active Online Classmates',
    Hindi: 'सक्रिय ऑनलाइन सहपाठी',
    Hinglish: 'Active class ke dost',
    Marathi: 'सक्रिय अभ्यास मित्र',
    Tamil: 'செயலில் உள்ள படிப்பு தோழர்கள்',
    Bengali: 'সক্রিয় সহপাঠী বন্ধুরা',
    Spanish: 'Compañeros activos',
    French: 'Membres actifs',
    German: 'Aktive Partner'
  },
  'sticky_notes': {
    English: 'Sticky Notes',
    Hindi: 'स्टिकी नोट्स',
    Hinglish: 'Diary Notes',
    Marathi: 'स्टिकी नोट्स',
    Tamil: 'ஒட்டும் குறிப்புகள்',
    Bengali: 'স্টিকি নোটস',
    Spanish: 'Notas adhesivas',
    French: 'Notes adhésives',
    German: 'Haftnotizen'
  },
  'dailies_planner': {
    English: 'Dailies & Planner',
    Hindi: 'दैनिक कार्य और योजक',
    Hinglish: 'Daily Routine Organizer',
    Marathi: 'नियमित कामे आणि नियोजन',
    Tamil: 'தினசரி திட்டமிடல்',
    Bengali: 'দৈনিক রুটিন প্ল্যানার',
    Spanish: 'Planificador diario',
    French: 'Agenda & Tâches',
    German: 'Tagesplaner'
  },
  'practice_academy': {
    English: 'Practice Academy',
    Hindi: 'अभ्यास अकादमी',
    Hinglish: 'Practice Playground',
    Marathi: 'सराव अकादमी',
    Tamil: 'பயிற்சி கூடம்',
    Bengali: 'অনুশীলন অ্যাকাডেমি',
    Spanish: 'Academia de Práctica',
    French: 'Centre d\'entraînement',
    German: 'Übungsakademie'
  },
  'quiz_tag': {
    English: 'Dynamically Generated via Gemini AI',
    Hindi: 'जेमिनी एआई द्वारा संचालित गतिशील प्रश्न',
    Hinglish: 'Powered dynamically by Gemini AI tech',
    Marathi: 'जेमिनी एआय द्वारे स्वयंचलित चाचण्या',
    Tamil: 'ஜெமினி ஏஐ மூலம் உருவாக்கப்பட்டது',
    Bengali: 'জেমিনি এআই দিয়ে তৈরী কুইজ',
    Spanish: 'Generados dinámicamente con IA Gemini',
    French: 'Généré dynamiquement par l\'IA Gemini',
    German: 'Dynamisch generiert durch Gemini KI'
  },
  'start_quiz': {
    English: 'Start quiz',
    Hindi: 'क्विज़ शुरू करें',
    Hinglish: 'Test start karein',
    Marathi: 'चाचणी सुरू करा',
    Tamil: 'வினாவிடை தொடங்கு',
    Bengali: 'কুইজ শুরু করো',
    Spanish: 'Iniciar examen',
    French: 'Démarrer le quiz',
    German: 'Test starten'
  },
  'greet_night': {
    English: 'Good Night',
    Hindi: 'शुभ रात्रि',
    Hinglish: 'Good Night',
    Marathi: 'शुभ रात्री',
    Tamil: 'இனிய இரவு',
    Bengali: 'শুভ রাত্রি',
    Spanish: 'Buenas noches',
    French: 'Bonne nuit',
    German: 'Gute Nacht'
  },
  'greet_morning': {
    English: 'Good Morning',
    Hindi: 'शुभ प्रभात',
    Hinglish: 'Good Morning',
    Marathi: 'शुभ प्रभात',
    Tamil: 'காலை வணக்கம்',
    Bengali: 'শুভ সকাল',
    Spanish: 'Buenos días',
    French: 'Bonjour',
    German: 'Guten Morgen'
  },
  'greet_afternoon': {
    English: 'Good Afternoon',
    Hindi: 'शुभ दोपहर',
    Hinglish: 'Good Afternoon',
    Marathi: 'शुभ दुपार',
    Tamil: 'மதிய வணக்கம்',
    Bengali: 'শুভ দুপুর',
    Spanish: 'Buenas tardes',
    French: 'Bon après-midi',
    German: 'Guten Tag'
  },
  'greet_evening': {
    English: 'Good Evening',
    Hindi: 'शुभ संध्या',
    Hinglish: 'Good Evening',
    Marathi: 'शुभ संध्याकाळ',
    Tamil: 'மாலை வணக்கம்',
    Bengali: 'শুভ সন্ধ্যা',
    Spanish: 'Buenas tardes',
    French: 'Bonsoir',
    German: 'Guten Abend'
  },
  'onboarding_tagline': {
    English: 'Your Personal AI Study Companion',
    Hindi: 'आपका पर्सनल पढ़ाई दोस्त ✨',
    Hinglish: 'Aapka personal padhai dost',
    Marathi: 'तुमचा वैयक्तिक अभ्यास सोबती',
    Tamil: 'உங்கள் தனிப்பட்ட படிப்பு தோழன்',
    Bengali: 'তোমার নিজস্ব পড়াশোনার বন্ধু',
    Spanish: 'Tu compañero de estudio personal de IA',
    French: 'Votre compagnon d\'étude IA personnel',
    German: 'Ihr persönlicher KI-Lernbegleiter'
  },
  'onboarding_welcome_title': {
    English: 'A Special Message for Dear Students 🌟',
    Hindi: 'प्यारे बच्चों के लिए एक प्यारा संदेश 🌟',
    Hinglish: 'Pyaare bachon ke liye ek pyaara sandesh',
    Marathi: 'लाडक्या विद्यार्थ्यांसाठी एक खास संदेश 🌟',
    Tamil: 'அன்பான மாணவர்களுக்கான சிறப்புச் செய்தி 🌟',
    Bengali: 'প্রিয় ছাত্রছাত্রীদের উদ্দেশ্যে একটি বার্তা 🌟',
    Spanish: 'Un mensaje especial para nuestros queridos estudiantes 🌟',
    French: 'Un message spécial pour nos chers étudiants 🌟',
    German: 'Eine besondere Botschaft für liebe Schüler 🌟'
  },
  'onboarding_welcome_desc': {
    English: 'Welcome to StudyBuddy AI! This is your cute AI friend to make your school learning easy and fun. Here you can understand tough subjects (like Maths, Science, English, Physics) in simple words with pictures, and play quiz games live.',
    Hindi: 'स्टडी बडी AI में स्वागत है! यह आपकी स्कूल की पढ़ाई को आसान और मजेदार बनाने वाला आपका प्यारा AI दोस्त है। यहाँ आप कठिन से कठिन विषयों (जैसे: Maths, Science, English, Physics) को आसान शब्दों में चित्र के साथ समझ सकते हैं और लाइव मजेदार क्विज़ खेल सकते हैं।',
    Hinglish: 'StudyBuddy AI me welcome hai! Ye aapki school ki padhai ko easy aur fun banane wala aapka cute AI friend hai. Yahan aap tough subjects jaise Maths, Science, English ko simple words aur drawings ke sath samajh sakte hain aur quiz khel sakte hain.',
    Marathi: 'स्टडी बडी AI मध्ये आपले स्वागत आहे! हा आपल्या शालेय अभ्यासाला सोपा आणि रंजक बनवणारा आपला आवडता AI मित्र आहे. येथे तुम्ही कठीण विषय (उदा. गणित, विज्ञान, इंग्रजी) सोप्या शब्दांत चित्रांसह समजून घेऊ शकता आणि लाइव्ह क्रीडा क्विझ खेळू शकता.',
    Tamil: 'ஸ்டடிபடி AI-க்கு உங்களை வரவேற்கிறோம்! இது உங்கள் பள்ளிப் படிப்பை எளிதாகவும் வேடிக்கையாகவும் மாற்றும் ஒரு அழகான AI நண்பன். இங்கே நீங்கள் கணிதம், அறிவியல் போன்ற கடினமான பாடங்களை எளிய விளக்கங்கள் மற்றும் படங்களுடன் புரிந்து கொள்ளலாம்.',
    Bengali: 'স্টাডিবডি AI-তে তোমাকে স্বাগত! এটি তোমার স্কুলের পড়াশোনাকে সহজ করতে এবং আনন্দদায়ক করার জন্য একটি সুন্দর AI বন্ধু। এখানে তুমি কঠিন বিষয়গুলো (যেমন: গণিত, বিজ্ঞান, ইংরেজি, পদার্থবিজ্ঞান) সহজ কথায় ছবির মাধ্যমে বুঝে নিতে পারবে এবং লাইভ কুইজ খেলতে পারবে।',
    Spanish: '¡Bienvenido a StudyBuddy IA! Este es tu tierno amigo de IA para hacer que tu aprendizaje escolar sea fácil y de confianza. Aquí puedes comprender temas difíciles (como matemáticas, ciencias, inglés, física) en palabras sencillas con imágenes y jugar cuestionarios.',
    French: 'Bienvenue sur StudyBuddy IA ! C\'est votre ami IA mignon pour rendre l\'apprentissage scolaire facile et amusant. Ici, vous pouvez comprendre des sujets difficiles (comme les maths, les sciences, d\'un anglais simple, la physique) en mots simples avec des images.',
    German: 'Willkommen bei StudyBuddy KI! Dies ist dein süßer KI-Freund, der das Lernen in der Schule einfach und lustig macht. Hier kannst du schwierige Fächer (wie Mathe, Naturwissenschaften, Englisch, Physik) in einfachen Worten mit Bildern verstehen.'
  },
  'onboarding_welcome_notice': {
    English: '📢 To start, fill in your details (name, school, and class) below! The AI will then talk and teach you according to your school level and class. Let\'s get started! 🚀',
    Hindi: '📢 शुरू करने के लिए नीचे अपनी जानकारी (नाम, स्कूल और क्लास) भरें! इसके बाद AI बिलकुल आपके स्कूल और क्लास के अनुसार ही आपसे बात करेगा और पढ़ाएगा! चलो अपनी जानकारी भरें! 🚀',
    Hinglish: '📢 Shuru karne ke liye niche apna naam, school, aur class fill karein! Iske baad AI aapke school aur class ke according hi aapse baat karega aur padhaega! Chalo shuru karein! 🚀',
    Marathi: '📢 सुरू करण्यासाठी खाली तुमची माहिती (नाव, शाळा आणि वर्ग) भरा! यानंतर AI तुमच्या वर्गानुसारच तुमच्याशी बोलेल आणि शिकवेल! चला माहिती भरूया! 🚀',
    Tamil: '📢 தொடங்க, கீழே உங்கள் விவரங்களை (பெயர், பள்ளி மற்றும் வகுப்பு) நிரப்பவும்! அதன்பிறகு AI உங்கள் பள்ளி மற்றும் வகுப்பிற்கு ஏற்ப உங்களுடன் பேசும் மற்றும் கற்பிக்கும். தொடங்கலாம்! 🚀',
    Bengali: '📢 শুরু করার জন্য নিচে তোমার তথ্য (নাম, স্কুল এবং শ্রেণী) পূরণ করো! এরপর AI সম্পূর্ণ তোমার স্কুল ও শ্রেণী অনুযায়ী তোমার সাথে কথা বলবে ও পড়াবে! চলো তথ্য পূরণ করি! 🚀',
    Spanish: '📢 ¡Para comenzar, completa tus datos (nombre, escuela y clase) a continuación! La IA te hablará y te enseñará exactamente de acuerdo con tu nivel escolar. ¡Comencemos! 🚀',
    French: '📢 Pour commencer, remplissez vos coordonnées (nom, école et classe) ci-dessous ! L\'IA vous parlera et vous enseignera exactement selon votre niveau de classe. Commençons ! 🚀',
    German: '📢 Trage unten deine Daten (Name, Schule und Klasse) ein, um zu starten! Die KI wird dann genau passend zu deiner Klassenstufe mit dir sprechen und dich unterrichten. Los geht\'s! 🚀'
  },
  'onboarding_details_header': {
    English: 'Enter Your Student Details',
    Hindi: 'अपनी जानकारी भरें',
    Hinglish: 'Apni details fill karein',
    Marathi: 'तुमची माहिती भरा',
    Tamil: 'உங்கள் விவரங்களை உள்ளிடவும்',
    Bengali: 'তোমার বিবরণী পূরণ করো',
    Spanish: 'Ingresa tus detalles de estudiante',
    French: 'Saisissez vos informations d\'élève',
    German: 'Geben Sie Ihre Schülerdaten ein'
  },
  'onboarding_name_label': {
    English: 'Student Name *',
    Hindi: 'बच्चे का नाम *',
    Hinglish: 'Bachhe ka naam *',
    Marathi: 'विद्यार्थ्याचे नाव *',
    Tamil: 'மாணவர் பெயர் *',
    Bengali: 'ছাত্র/ছাত্রীর নাম *',
    Spanish: 'Nombre del estudiante *',
    French: 'Nom de l\'élève *',
    German: 'Name des Schülers *'
  },
  'onboarding_name_placeholder': {
    English: 'Write your name (e.g. Rohan Yadav)',
    Hindi: 'अपना नाम लिखें (जैसे: रोहन यादव)',
    Hinglish: 'Apna name likhein (e.g. Rohan Yadav)',
    Marathi: 'आपले नाव लिहा',
    Tamil: 'உங்கள் பெயரை எழுதவும்',
    Bengali: 'তোমার নাম লেখো',
    Spanish: 'Escribe tu nombre (ej. Rohan Yadav)',
    French: 'Écrivez votre nom (ex. Rohan Yadav)',
    German: 'Schreibe deinen Namen (z.B. Rohan Yadav)'
  },
  'onboarding_school_label': {
    English: 'School Name *',
    Hindi: 'बच्चे का स्कूल *',
    Hinglish: 'School ka name *',
    Marathi: 'शाळेचे नाव *',
    Tamil: 'பள்ளி பெயர் *',
    Bengali: 'স্কুলের নাম *',
    Spanish: 'Nombre de la escuela *',
    French: 'Nom de l\'école *',
    German: 'Name der Schule *'
  },
  'onboarding_school_placeholder': {
    English: 'Write school name (e.g. Model School)',
    Hindi: 'स्कूल का नाम लिखें (जैसे: मॉडल स्कूल)',
    Hinglish: 'School name likhein (e.g. Model School)',
    Marathi: 'शाळेचे नाव लिहा',
    Tamil: 'பள்ளியின் பெயரை எழுதவும்',
    Bengali: 'স্কুলের নাম লেখো',
    Spanish: 'Escribe el nombre de la escuela (ej. Escuela Modelo)',
    French: 'Écrivez le nom de votre école',
    German: 'Schreibe den Namen deiner Schule'
  },
  'onboarding_class_label': {
    English: 'Student Class *',
    Hindi: 'बच्चे की क्लास *',
    Hinglish: 'Class select karein *',
    Marathi: 'विद्यार्थ्याचा वर्ग *',
    Tamil: 'மாணவர் வகுப்பு *',
    Bengali: 'শ্রেণী *',
    Spanish: 'Clase del estudiante *',
    French: 'Classe de l\'élève *',
    German: 'Klasse des Schülers *'
  },
  'onboarding_avatar_label': {
    English: 'Choose Your Avatar ✨',
    Hindi: 'अपना स्टडी अवतार चुनें ✨',
    Hinglish: 'Apna study avatar chunein ✨',
    Marathi: 'तुमचा अवतार निवडा ✨',
    Tamil: 'உங்கள் அவதாரத்தை தேர்வு செய்யவும் ✨',
    Bengali: 'তোমার স্টাডি অবতার বেছে নাও ✨',
    Spanish: 'Elige tu avatar de estudio ✨',
    French: 'Choisissez votre avatar d\'étude ✨',
    German: 'Wähle deinen Lern-Avatar ✨'
  },
  'onboarding_submit_btn': {
    English: "Let's Study! 🚀",
    Hindi: 'चलो पढ़ाई शुरू करें! 🚀',
    Hinglish: 'Chalo padhai shuru karein! 🚀',
    Marathi: 'चला अभ्यास करूया! 🚀',
    Tamil: 'படிக்கத் தொடங்கலாம்! 🚀',
    Bengali: 'চলো পড়াশোনা শুরু করি! 🚀',
    Spanish: '¡A estudiar! 🚀',
    French: 'C\'est parti pour étudier ! 🚀',
    German: 'Lass uns lernen! 🚀'
  },
  'class_num': {
    English: 'Class',
    Hindi: 'कक्षा',
    Hinglish: 'Class',
    Marathi: 'इयत्ता',
    Tamil: 'வகுப்பு',
    Bengali: 'শ্রেণী',
    Spanish: 'Clase',
    French: 'Classe',
    German: 'Klasse'
  },
  'quiz_completed_title': {
    English: 'Quiz Completed!',
    Hindi: 'अभ्यास समाप्त!',
    Hinglish: 'Quiz Completed!',
    Marathi: 'चाचणी पूर्ण झाली!',
    Tamil: 'வினாடி வினா முடிந்தது!',
    Bengali: 'কুইज সম্পন্ন হয়েছে!',
    Spanish: '¡Cuestionario completado!',
    French: 'Quiz terminé !',
    German: 'Quiz abgeschlossen!'
  },
  'quiz_completed_score': {
    English: 'Excellent Effort! You scored',
    Hindi: 'शानदार प्रयास! आपका स्कोर',
    Hinglish: 'Excellent Effort! Aapka score',
    Marathi: 'उत्कृष्ट प्रयत्न! आपला निकाल',
    Tamil: 'சிறந்த முயற்சி! நீங்கள் பெற்ற மதிப்பெண்',
    Bengali: 'র্দুদান্ত চেষ্টা! তোমার স্কোর',
    Spanish: '¡Excelente esfuerzo! Tu puntuación es',
    French: 'Excellent effort ! Votre score est de',
    German: 'Hervorragender Einsatz! Deine Punktzahl ist'
  },
  'back_to_topics': {
    English: 'Back to Topics',
    Hindi: 'वापस जाएं',
    Hinglish: 'Wapas jayein',
    Marathi: 'विषयांवर परत जा',
    Tamil: 'பாடங்களுக்கு திரும்புக',
    Bengali: 'পূর্ববর্তী বিষয়ে ফিরে যাও',
    Spanish: 'Volver a los temas',
    French: 'Retour aux sujets',
    German: 'Zurück zu den Themen'
  },
  'quiz_question_label': {
    English: 'Question',
    Hindi: 'प्रश्न',
    Hinglish: 'Sawaal',
    Marathi: 'प्रश्न',
    Tamil: 'கேள்வி',
    Bengali: 'প্রশ্ন',
    Spanish: 'Pregunta',
    French: 'Question',
    German: 'Frage'
  },
  'blackboard_title': {
    English: 'Magical Interactive Board',
    Hindi: '✨ जादुई शिक्षा बोर्ड ✨',
    Hinglish: '✨ Magical Blackboard ✨',
    Marathi: 'जादुई फळा',
    Tamil: 'கரும்பலகை',
    Bengali: 'ম্যাজিক বোর্ড',
    Spanish: 'Pizarra Mágica',
    French: 'Tableau Magique',
    German: 'Magische Tafel'
  },
  'save_to_notebook': {
    English: 'Save to Notebook 📝',
    Hindi: 'कॉपी में सुरक्षित करें 📝',
    Hinglish: 'Notebook me Save karein 📝',
    Marathi: 'वहीत जतन करा 📝',
    Tamil: 'குறிப்பேட்டில் சேமி 📝',
    Bengali: 'নোটবুকে সেভ করো 📝',
    Spanish: 'Guardar en Cuaderno 📝',
    French: 'Sauver dans le Cahier 📝',
    German: 'In Notizbuch speichern 📝'
  },
  'tts_speak': {
    English: 'Speak out loud 🔊',
    Hindi: 'बोल कर सुनाओ 🔊',
    Hinglish: 'Speak out loud 🔊',
    Marathi: 'बोलून दाखवा 🔊',
    Tamil: 'உரக்கப் படி 🔊',
    Bengali: 'পড়ে শোনাও 🔊',
    Spanish: 'Escuchar audio 🔊',
    French: 'Écouter l\'explication 🔊',
    German: 'Vorlesen lassen 🔊'
  },
  'tts_stop': {
    English: 'Stop Voice 🤫',
    Hindi: 'आवाज़ बंद करें 🤫',
    Hinglish: 'Stop Voice 🤫',
    Marathi: 'आवाज थांबवा 🤫',
    Tamil: 'பேச்சை நிறுத்தவும் 🤫',
    Bengali: 'পড়া বন্ধ করো 🤫',
    Spanish: 'Detener audio 🤫',
    French: 'Arrêter la lecture 🤫',
    German: 'Stoppen 🤫'
  },
  'close_blackboard': {
    English: 'Done Studying 🌟',
    Hindi: 'पढ़ाई पूरी हुई! 🌟',
    Hinglish: 'Done, back to Chat 🌟',
    Marathi: 'अभ्यास पूर्ण! 🌟',
    Tamil: 'படித்து முடித்தேன் 🌟',
    Bengali: 'পড়া শেষ 🌟',
    Spanish: 'Terminado 🌟',
    French: 'Fermer le tableau 🌟',
    German: 'Lernen beendet 🌟'
  },
  'welcome_ai_chat': {
    English: 'Hello school champ! 👋 Ask any homework question or ask me to draw a diagram! Let\'s read together! 🚀',
    Hindi: 'नमस्ते स्कूल चैंपियन! 👋 कोई भी होमवर्क प्रश्न पूछें या मुझसे चित्र बनाने को कहें! आओ साथ मिलकर पढ़ाई करें! 🚀',
    Hinglish: 'Hello school champ! 👋 Koi bhi homework sawaal pucho ya diagram generator try karo! Chalo sath padhein! 🚀',
    Marathi: 'नमस्कार शाळकरी मित्रा! 👋 गृहपाठाचा कोणताही प्रश्न विचार किंवा मला आकृती काढायला सांग! चला एकत्र शिकूया! 🚀',
    Tamil: 'வணக்கம் பள்ளி சாம்பியன்! 👋 வீட்டுப்பாடம் அல்லது வரைபடங்களுக்கு என்னிடம் கேளுங்கள்! இணைந்து படிப்போம்! 🚀',
    Bengali: 'হ্যালো स्कूल চ্যাম্পিয়ন! 👋 যেকোনো হোমওয়ার্ক প্রশ্ন জিজ্ঞাসা করো বা ছবি আঁকতে বলো! এসো একসাথে পড়ি! 🚀',
    Spanish: '¡Hola campeón! 👋 Hazme cualquier pregunta de tu tarea o pídeme que dibuje un diagrama. ¡Estudiemos juntos! 🚀',
    French: 'Bonjour jeune champion ! 👋 Pose-moi tes questions de devoirs ou demande-moi un schéma. Étudions ensemble ! 🚀',
    German: 'Hallo Schul-Champ! 👋 Stelle mir Fragen zu den Hausaufgaben oder bitte mich, ein Diagramm zu zeichnen. Lass uns kooperativ lernen! 🚀'
  }
};

export function translate(key: string, lang: AppLanguage, defaultText: string = ''): string {
  if (TRANSLATIONS[key] && TRANSLATIONS[key][lang]) {
    return TRANSLATIONS[key][lang];
  }
  return defaultText;
}
