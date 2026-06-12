export interface FallbackQuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

export const FALLBACK_QUIZZES: Record<string, Record<'English' | 'Hindi', FallbackQuizQuestion[]>> = {
  'Mathematics': {
    'English': [
      {
        question: "What is the value of x in the equation 3x - 7 = 8?",
        options: ["3", "5", "10", "15"],
        answer: 1
      },
      {
        question: "A triangle with three equal sides is called an...",
        options: ["Isosceles triangle", "Scalene triangle", "Equilateral triangle", "Right-angled triangle"],
        answer: 2
      },
      {
        question: "What is 25% of 200?",
        options: ["25", "50", "150", "100"],
        answer: 1
      },
      {
        question: "What is the area of a rectangle with length 8 cm and width 5 cm?",
        options: ["13 sq cm", "30 sq cm", "40 sq cm", "45 sq cm"],
        answer: 2
      },
      {
        question: "If a coin is tossed, what is the probability of getting a Head?",
        options: ["1", "0", "0.5", "0.25"],
        answer: 2
      }
    ],
    'Hindi': [
      {
        question: "समीकरण 3x - 7 = 8 में x का मान क्या है?",
        options: ["3", "5", "10", "15"],
        answer: 1
      },
      {
        question: "तीन समान भुजाओं वाले त्रिभुज को क्या कहा जाता है?",
        options: ["समद्विबाहु त्रिभुज", "विषमबाहु त्रिभुज", "समबाहु त्रिभुज", "समकोण त्रिभुज"],
        answer: 2
      },
      {
        question: "200 का 25% कितना होता है?",
        options: ["25", "50", "150", "100"],
        answer: 1
      },
      {
        question: "8 सेमी लंबाई और 5 सेमी चौड़ाई वाले आयत का क्षेत्रफल क्या होगा?",
        options: ["13 वर्ग सेमी", "30 वर्ग सेमी", "40 वर्ग सेमी", "45 वर्ग सेमी"],
        answer: 2
      },
      {
        question: "एक सिक्का उछालने पर चित (Heads) आने की प्रायिकता क्या है?",
        options: ["1", "0", "0.5", "0.25"],
        answer: 2
      }
    ]
  },
  'Science': {
    'English': [
      {
        question: "Which planet in our solar system is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        answer: 1
      },
      {
        question: "What is the process of water vapor changing into liquid water called?",
        options: ["Evaporation", "Condensation", "Precipitation", "Transpiration"],
        answer: 1
      },
      {
        question: "Which gas do human beings inhale to survive?",
        options: ["Carbon Dioxide", "Nitrogen", "Oxygen", "Helium"],
        answer: 2
      },
      {
        question: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Apparatus"],
        answer: 2
      },
      {
        question: "What type of force attracts any object with mass toward each other?",
        options: ["Magnetic Force", "Gravity", "Friction", "Electrostatic"],
        answer: 1
      }
    ],
    'Hindi': [
      {
        question: "हमारे सौरमंडल के किस ग्रह को लाल ग्रह के रूप में जाना जाता है?",
        options: ["शुक्र", "मंगल", "बृहस्पति", "शनि"],
        answer: 1
      },
      {
        question: "जलवाष्प के द्रव जल में बदलने की प्रक्रिया को क्या कहते हैं?",
        options: ["वाष्पीकरण", "संघनन", "वर्षण", "वाष्पोत्सर्जन"],
        answer: 1
      },
      {
        question: "मनुष्य जीवित रहने के लिए किस गैस को सांस के रूप में लेता है?",
        options: ["कार्बन डाइऑक्साइड", "नाइटोजन", "ऑक्सीजन", "हीलियम"],
        answer: 2
      },
      {
        question: "कोशिका का पावरहाउस (ऊर्जा गृह) किसे कहा जाता है?",
        options: ["केंद्रक", "राइबोसोम", "माइटोकॉन्ड्रिया", "गॉल्जी उपकरण"],
        answer: 2
      },
      {
        question: "किस प्रकार का बल द्रव्यमान वाले पिंडों को अपनी ओर आकर्षित करता है?",
        options: ["चुंबकीय बल", "गुरुत्वाकर्षण", "घर्षण", "स्थिर विद्युत"],
        answer: 1
      }
    ]
  },
  'Biology': {
    'English': [
      {
        question: "Which pigment gives green color to plant leaves?",
        options: ["Carotenoid", "Chlorophyll", "Anthocyanin", "Melanin"],
        answer: 1
      },
      {
        question: "What is the primary function of red blood cells?",
        options: ["Excrete waste", "Fight infections", "Carry oxygen", "Produce platelets"],
        answer: 2
      },
      {
        question: "Which organ in the human body is responsible for pumping blood?",
        options: ["Lungs", "Brain", "Heart", "Kidneys"],
        answer: 2
      },
      {
        question: "Photosynthesis takes place in which cell organelle?",
        options: ["Cytoplasm", "Cell Wall", "Chloroplast", "Mitochondria"],
        answer: 2
      },
      {
        question: "Humans belong to which class of animals?",
        options: ["Reptiles", "Amphibians", "Mammals", "Birds"],
        answer: 2
      }
    ],
    'Hindi': [
      {
        question: "पौधों की पत्तियों को हरा रंग कौन सा वर्णक देता है?",
        options: ["कैरोटीनॉयड", "क्लोरोफिल", "एंथोसायनिन", "मेलेनिन"],
        answer: 1
      },
      {
        question: "लाल रक्त कोशिकाओं (RBC) का मुख्य कार्य क्या है?",
        options: ["अपशिष्ट बाहर निकालना", "संक्रमण से लड़ना", "ऑक्सीजन का परिवहन करना", "प्लेटलेट्स बनाना"],
        answer: 2
      },
      {
        question: "मानव शरीर का कौन सा अंग रक्त पंप करने के लिए जिम्मेदार है?",
        options: ["फेफड़े", "मस्तिष्क", "हृदय", "गुर्दे"],
        answer: 2
      },
      {
        question: "प्रकाश संश्लेषण कोशिका के किस अंग में होता है?",
        options: ["कोशिकाद्रव्य", "कोशिका भित्ति", "क्लोरोप्लास्ट", "माइटोकॉन्ड्रिया"],
        answer: 2
      },
      {
        question: "मनुष्य जानवरों के किस वर्ग में आते हैं?",
        options: ["सरीसृप", "उभयचर", "स्तनधारी", "पक्षी"],
        answer: 2
      }
    ]
  },
  'Physics': {
    'English': [
      {
        question: "What is the SI unit of force?",
        options: ["Joule", "Watt", "Newton", "Pascal"],
        answer: 2
      },
      {
        question: "What is the approximate speed of light in a vacuum?",
        options: ["300,000 km/s", "150,000 km/s", "1,000,000 km/s", "3,000 km/s"],
        answer: 0
      },
      {
        question: "Sound waves cannot travel through which of the following?",
        options: ["Water", "Air", "Steel", "Vacuum"],
        answer: 3
      },
      {
        question: "An instrument used to measure electric current is called:",
        options: ["Voltmeter", "Ammeter", "Barometer", "Thermometer"],
        answer: 1
      },
      {
        question: "What kind of energy is stored in a compressed spring?",
        options: ["Kinetic Energy", "Thermal Energy", "Potential Energy", "Chemical Energy"],
        answer: 2
      }
    ],
    'Hindi': [
      {
        question: "बल की SI इकाई क्या है?",
        options: ["जूल", "वाट", "न्यूटन", "पास्कल"],
        answer: 2
      },
      {
        question: "निर्वात में प्रकाश की गति लगभग कितनी होती है?",
        options: ["300,000 किमी/सेकंड", "150,000 किमी/सेकंड", "1,000,000 किमी/सेकंड", "3,000 किमी/सेकंड"],
        answer: 0
      },
      {
        question: "ध्वनि तरंगें निम्नलिखित में से किस माध्यम में यात्रा नहीं कर सकती हैं?",
        options: ["पानी", "हवा", "इस्पात", "निर्वात"],
        answer: 3
      },
      {
        question: "विद्युत धारा मापने के लिए प्रयुक्त उपकरण को क्या कहते हैं?",
        options: ["वोल्टमीटर", "एमीटर", "बैरोमीटर", "थर्मामीटर"],
        answer: 1
      },
      {
        question: "दबी हुई स्प्रिंग में किस प्रकार की ऊर्जा संचित होती है?",
        options: ["गतिज ऊर्जा", "तापीय ऊर्जा", "स्थितिज ऊर्जा", "रासायनिक ऊर्जा"],
        answer: 2
      }
    ]
  },
  'Chemistry': {
    'English': [
      {
        question: "What is the chemical formula of water?",
        options: ["CO2", "H2O", "NaCl", "HCl"],
        answer: 1
      },
      {
        question: "Which element is present in all organic chemical compounds?",
        options: ["Oxygen", "Nitrogen", "Carbon", "Hydrogen"],
        answer: 2
      },
      {
        question: "What is the pH value of neutral pure water?",
        options: ["1", "5", "7", "14"],
        answer: 2
      },
      {
        question: "Which gas is commonly known as 'Laughing Gas'?",
        options: ["Nitrous Oxide", "Carbon Monoxide", "Sulphur Dioxide", "Nitrogen Dioxide"],
        answer: 0
      },
      {
        question: "What is the everyday common name of Sodium Chloride?",
        options: ["Baking Soda", "Table Salt", "Bleaching Powder", "Vinegar"],
        answer: 1
      }
    ],
    'Hindi': [
      {
        question: "जल का रासायनिक सूत्र क्या है?",
        options: ["CO2", "H2O", "NaCl", "HCl"],
        answer: 1
      },
      {
        question: "सभी कार्बनिक यौगिकों में कौन सा तत्व अनिवार्य रूप से उपस्थित होता है?",
        options: ["ऑक्सीजन", "नाइट्रोजन", "कार्बन", "हाइड्रोजन"],
        answer: 2
      },
      {
        question: "शुद्ध जल का pH मान कितना होता है?",
        options: ["1", "5", "7", "14"],
        answer: 2
      },
      {
        question: "किस गैस को आमतौर पर 'हंसाने वाली गैस' (Laughing Gas) कहा जाता है?",
        options: ["नाइट्रस ऑक्साइड", "कार्बन मोनोऑक्साइड", "सल्फर डाइऑक्साइड", "नाइट्रोजन डाइऑक्साइड"],
        answer: 0
      },
      {
        question: "सोडियम क्लोराइड का साधारण घरेलू नाम क्या है?",
        options: ["बेकिंग सोडा", "साधारण नमक", "ब्लीचिंग पाउडर", "सिरका"],
        answer: 1
      }
    ]
  },
  'English': {
    'English': [
      {
        question: "Identify the noun in this sentence: 'The happy boy jumped over the fence.'",
        options: ["happy", "jumped", "boy", "over"],
        answer: 2
      },
      {
        question: "What is the opposite (antonym) of the word 'Ancient'?",
        options: ["Old", "Antique", "Modern", "Beautiful"],
        answer: 2
      },
      {
        question: "Which of the following is an irregular verb?",
        options: ["Walk", "Play", "Go", "Cook"],
        answer: 2
      },
      {
        question: "Choose the correctly spelled word:",
        options: ["Recieve", "Receive", "Recive", "Riceive"],
        answer: 1
      },
      {
        question: "Fill in the blank: 'She ___ to school every single day.'",
        options: ["go", "going", "gone", "goes"],
        answer: 3
      }
    ],
    'Hindi': [
      {
        question: "वाक्य 'The happy boy jumped over the fence' में संज्ञा (Noun) कौन सा शब्द है?",
        options: ["happy", "jumped", "boy", "over"],
        answer: 2
      },
      {
        question: "अंग्रेजी शब्द 'Ancient' (प्राचीन) का विलोम शब्द (Antonym) क्या होगा?",
        options: ["Old", "Antique", "Modern", "Beautiful"],
        answer: 2
      },
      {
        question: "इनमें से कौन सी क्रिया (Verb) अनियमित (Irregular) है?",
        options: ["Walk", "Play", "Go", "Cook"],
        answer: 2
      },
      {
        question: "सही वर्तनी (Spelling) वाले शब्द को चुनें:",
        options: ["Recieve", "Receive", "Recive", "Riceive"],
        answer: 1
      },
      {
        question: "रिक्त स्थान भरें: 'She ___ to school every single day.'",
        options: ["go", "going", "gone", "goes"],
        answer: 3
      }
    ]
  }
};

export function getFallbackAnswer(prompt: string, studentContext?: { name: string; school: string; className: string }): string {
  const name = studentContext?.name || "प्यारे छात्र";
  const school = studentContext?.school || "आपके स्कूल";
  const className = studentContext?.className || "आपकी कक्षा";

  const lower = prompt.toLowerCase();
  
  if (lower.includes("math") || lower.includes("fraction") || lower.includes("algebra") || lower.includes("geometry") || lower.includes("समीकरण") || lower.includes("गणित")) {
    return `### 📐 गणित सहायता (Mathematics Help) for ${name} from ${school} (Class ${className})

हेलो ${name}! गणित को समझना बहुत आसान है जब हम इसे चरणों में विभाजित करते हैं! आइए आपके सवाल को समझते हैं:

1. **सवाल का मूल (Understanding the query):** आपने गणित या समीकरण के बारे में पूछा है।
2. **मुख्य नियम (Key Concept):** समीकरण को हल करने के लिए हम समान क्रियाएं दोनों पक्षों में करते हैं (BODMAS या पक्षांतरण नियम)।
3. **चरण-दर-चरण समाधान (Step-by-Step Explanation):**
   * यदि हम \(3x - 7 = 8\) जैसी किसी चीज़ को देखते हैं, तो सबसे पहले दोनों पक्षों में 7 जोड़ें: \(3x = 15\).
   * इसके बाद, दोनों पक्षों को 3 से भाग दें: \(x = 5\)।
4. **आपके लिए टिप:** अभ्यास आपको परिपूर्ण बनाता है! अपनी स्कूल की पाठ्यपुस्तकों से ऐसे सवालों का अभ्यास करते रहें।

यदि आपके पास कोई विशिष्ट संख्यात्मक प्रश्न है, तो उसे यहाँ टाइप करें ताकि मैं उसे ठीक से हल कर सकूँ! 🚀`;
  }

  if (lower.includes("science") || lower.includes("force") || lower.includes("water") || lower.includes("light") || lower.includes("विज्ञान") || lower.includes("चक्र")) {
    return `### 🔬 विज्ञान सीखें (Science Corner) for ${name} at ${school}

नमस्ते ${name}! विज्ञान हमारे आसपास की जादुई दुनिया को समझने का जरिया है।

**महत्वपूर्ण सिद्धांत (Important Concept):**
* **बल (Force):** बल किसी भी वस्तु को हिलाने, रोकने या उसकी दिशा बदलने की क्षमता है (खिंचाव या धक्का)।
* **जल चक्र (Water Cycle):** सूरज पानी को गर्म करता है (वाष्पीकरण), वह हवा में ठंडा होता है (संघनन), और बारिश बनकर गिरता है (वर्षण)।

**याद रखने योग्य बातें:**
1. हमेशा सवाल पूछें: "ऐसा क्यों होता है?"
2. अपने विज्ञान प्रयोगों को ध्यानपूर्वक स्कूल में करें!

कक्षा ${className} के अनुसार यह बहुत ही महत्वपूर्ण है। अपने विशिष्ट प्रश्न को नीचे लिखें, मैं उसका तुरंत जवाब दूँगा! ✨`;
  }

  if (lower.includes("bio") || lower.includes("cell") || lower.includes("heart") || lower.includes("plant") || lower.includes("जीव") || lower.includes("पौध")) {
    return `### 🍀 जीव विज्ञान मित्र (Biology Helper) | Class ${className} Support

हेलो ${name}! आइए जीव विज्ञान (Biology) के एक प्यारे विषय को आसान भाषा में समझें:

- **क्लोरोफिल (Chlorophyll):** यह पत्तियों को हरा रंग देता है और सूरज की रोशनी को भोजन में बदलने में मदद करता है।
- **प्रकाश संश्लेषण (Photosynthesis):** पौधे सूर्य का प्रकाश, पानी और कार्बन डाइऑक्साइड लेकर ग्लूकोज (भोजन) और ऑक्सीजन बनाते हैं।
- **हमारा हृदय (Our Heart):** यह एक पंप की तरह है जो हमारे पूरे शरीर में पोषक तत्वों और ऑक्सीजन से भरपूर रक्त पहुंचाता है।

क्या आप अपने स्कूल (${school}) के लिए कोई विशेष डायग्राम या चक्र समझना चाहते हैं? मुझे प्रश्न लिखकर भेजें! 🔬`;
  }

  return `### 🌟 स्टडी बडी AI सहायता (StudyBuddy Assistant)

नमस्ते **${name}**! मैं आपका पर्सनल स्टडी बडी हूँ (Class ${className}, ${school})। 

वर्तमान में इंटरनेट या सर्वर व्यस्त होने के कारण मैं सीमित मोड में चल रहा हूँ, पर मैं हमेशा आपकी मदद के लिए तैयार हूँ! 

**आप मुझसे ये चीजें पूछ सकते हैं:**
1. गणित के बुनियादी नियम (Basic Math Rules)
2. विज्ञान के सिद्धांत (Science Concepts)
3. अपनी भाषा के पाठ और व्याकरण (Language & Grammar)

चलो अभ्यास करने के लिए **"Practice Academy"** टैब पर जाएं और अपनी पसंद का शानदार हिंदी या इंग्लिश क्विज़ खेलें! आपके सही जवाबों पर आपको XP पॉइंट्स मिलेंगे! 🎉`;
}
