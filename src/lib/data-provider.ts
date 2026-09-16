import { connectDB } from "@/lib/mongodb";
import { Village } from "@/models/Village";
import { Service } from "@/models/Service";
import { Notice } from "@/models/Notice";
import { Scheme } from "@/models/Scheme";
import { Project } from "@/models/Project";
import { Form } from "@/models/Form";
import { Representative } from "@/models/Representative";
import { FormSchemaDefinition } from "@/types/form";
import { ALL_CITIZEN_SERVICES, ALL_CITIZEN_SCHEMAS } from "@/data/citizen-services";

export const DEFAULT_VILLAGE_GALLERIES: Record<
  string,
  Array<{ url: string; caption: string; category: string }>
> = {
  gulwanch: [
    {
      url: "/images/gallery/village-karyalay.jpg",
      caption: "ग्रामपंचायत कार्यालय, ई-सेवा व डिजिटल नागरी सुविधा केंद्र",
      category: "प्रशासकीय वास्तू",
    },
    {
      url: "/images/gallery/village-entrance.jpg",
      caption: "गुळवंच गाव मुख्य प्रवेश कमान व स्वागत परिसर",
      category: "प्रवेशद्वार व परिसर",
    },
    {
      url: "/images/gallery/smart-village-street.jpg",
      caption: "गावातील अंतर्गत पक्के सिमेंट रस्ते व सौर पथदिवे",
      category: "पायाभूत सुविधा",
    },
    {
      url: "/images/gallery/village-lake-nature.jpg",
      caption: "जलसंधारण शेततळे, बंधारे व समृद्ध निसर्गरम्य शिवार",
      category: "निसर्ग व शेती",
    },
    {
      url: "/images/gallery/village-panoramic.png",
      caption: "सह्याद्रीच्या कुशीतील निसर्गरम्य गुळवंच गावाचा विहंगम देखावा",
      category: "विहंगम देखावा",
    },
    {
      url: "/images/gallery/village-heritage.jpg",
      caption: "वारली कला व पारंपरिक ग्रामीण संस्कृती",
      category: "ऐतिहासिक वारसा",
    },
  ],
  mazagaon: [
    {
      url: "/images/gallery/historic-chavdi.jpg",
      caption: "माझगाव ऐतिहासिक चावडी, वटवृक्ष व पार कट्टा",
      category: "ऐतिहासिक वारसा",
    },
    {
      url: "/images/gallery/village-karyalay.jpg",
      caption: "माझगाव आदर्श ग्रामपंचायत प्रशासकीय इमारत",
      category: "प्रशासकीय वास्तू",
    },
    {
      url: "/images/gallery/smart-village-street.jpg",
      caption: "स्वच्छ सुंदर गाव अभियान व डांबरी रस्ते",
      category: "पायाभूत सुविधा",
    },
    {
      url: "/images/gallery/village-lake-nature.jpg",
      caption: "जलयुक्त शिवार बंधारा, कृषी तलाव व विहीर",
      category: "निसर्ग व शेती",
    },
    {
      url: "/images/gallery/village-panoramic.png",
      caption: "माझगाव परिसराचे विहंगम निसर्ग दृश्य",
      category: "विहंगम देखावा",
    },
  ],
  komalwadi: [
    {
      url: "/images/gallery/village-karyalay.jpg",
      caption: "कोमलवाडी ग्रामपंचायत कार्यालय व नागरी सेवा केंद्र",
      category: "प्रशासकीय वास्तू",
    },
    {
      url: "/images/gallery/smart-village-street.jpg",
      caption: "डिजिटल कोमलवाडी - मुख्य रस्ते व सौर ऊर्जा व्यवस्था",
      category: "पायाभूत सुविधा",
    },
    {
      url: "/images/gallery/village-lake-nature.jpg",
      caption: "पाणीपुरवठा विहीर, शेततळे व समृद्ध शेती शिवार",
      category: "निसर्ग व शेती",
    },
    {
      url: "/images/gallery/village-panoramic.png",
      caption: "कोमलवाडी गाव व निसर्गरम्य परिसर",
      category: "विहंगम देखावा",
    },
    {
      url: "/images/gallery/village-heritage.jpg",
      caption: "पारंपरिक लोकजीवन व ग्रामसंस्कृती",
      category: "ऐतिहासिक वारसा",
    },
  ],
};

// ==================== DEFAULT OFFLINE / RESILIENT FALLBACK DATA ====================
export const FALLBACK_VILLAGES = [
  {
    _id: "65f000000000000000000001",
    name: "गुळवंच",
    slug: "gulwanch",
    taluka: "सिन्नर",
    district: "नाशिक",
    state: "महाराष्ट्र",
    description: "सिन्नर तालुक्यातील प्रगतशील, डिजिटल आणि आदर्श ग्रामपंचायत गुळवंच. लोकसहभाग आणि पारदर्शक कारभारातून समृद्ध गावाची निर्मिती.",
    phone: "+91 2551 245120",
    email: "grampanchayat.gulwanch@gmail.com",
    address: "मु. पो. गुळवंच, ता. सिन्नर, जि. नाशिक, महाराष्ट्र - ४२२१०३",
    coverImage: "/images/gulwanch-banner.jpg",
    galleryImages: DEFAULT_VILLAGE_GALLERIES.gulwanch,
    primaryColor: "#003625",
    secondaryColor: "#9e4300",
  },
  {
    _id: "65f000000000000000000002",
    name: "माझगाव",
    slug: "mazagaon",
    taluka: "सिन्नर",
    district: "नाशिक",
    state: "महाराष्ट्र",
    description: "सिन्नर तालुक्यातील स्वावलंबी, निसर्गरम्य आणि तंत्रस्नेही ग्रामपंचायत माझगाव. गावच्या सर्वांगीण विकासासाठी कटिबद्ध ग्रामप्रशासन.",
    phone: "+91 2551 245210",
    email: "grampanchayat.mazagaon@gmail.com",
    address: "मु. पो. माझगाव, ता. सिन्नर, जि. नाशिक, महाराष्ट्र - ४२२१०३",
    coverImage: "/images/mazagaon-banner.jpg",
    galleryImages: DEFAULT_VILLAGE_GALLERIES.mazagaon,
    primaryColor: "#003625",
    secondaryColor: "#9e4300",
  },
  {
    _id: "65f000000000000000000003",
    name: "कोमलवाडी",
    slug: "komalwadi",
    taluka: "सिन्नर",
    district: "नाशिक",
    state: "महाराष्ट्र",
    description: "ग्रामपंचायत कोमलवाडी ही संविधानाने प्रदत्त स्थानिक स्वराज्य संस्थेच्या चौकटीत कार्यरत असून ग्रामविकास, जनकल्याण व पारदर्शक प्रशासन या तत्त्वांवर आधारित आहे. 'डिजिटल इंडिया, डिजिटल ग्राम' हेच आमचे स्वप्न आणि ध्येय आहे.",
    phone: "9823978492",
    email: "gpkomalwadi@gmail.com",
    address: "मु. कोमलवाडी, पो. वडांगळी, ता. सिन्नर, जि. नाशिक, महाराष्ट्र - ४२२१०३",
    coverImage: "/images/panoramic-landscape.png",
    galleryImages: DEFAULT_VILLAGE_GALLERIES.komalwadi,
    primaryColor: "#003625",
    secondaryColor: "#9e4300",
  },
];

// Citizen Services & Form Schemas are modularized under @/data/citizen-services
export const FALLBACK_SERVICES = ALL_CITIZEN_SERVICES;
export const FALLBACK_SCHEMAS: Record<string, FormSchemaDefinition> = ALL_CITIZEN_SCHEMAS;

export const FALLBACK_NOTICES = [
  {
    _id: "65f200000000000000000001",
    title: "विशेष ग्रामसभा बैठक आयोजन सूचना",
    content: "ग्रामपंचायतीची विशेष ग्रामसभा पुढील सोमवारी सकाळी ११ वाजता ग्रामपंचायत कार्यालयात आयोजित केली आहे. विकासकामांचा आढावा, पाणी पुरवठा नियोजन व विविध योजनांवर चर्चा होईल. सर्व ग्रामस्थांनी वेळेवर उपस्थित राहावे.",
    publishedAt: new Date(),
    isActive: true,
  },
  {
    _id: "65f200000000000000000002",
    title: "पिण्याच्या पाण्याच्या टाकीची स्वच्छता व पुरवठा नियोजन",
    content: "गावातील मुख्य जलकुंभाच्या स्वच्छतेचे काम हाती घेण्यात आले आहे. त्यामुळे उद्या सकाळी पाणी पुरवठा बंद राहील, संध्याकाळी नेहमीप्रमाणे पुरवठा सुरळीत होईल.",
    publishedAt: new Date(Date.now() - 86400000 * 2),
    isActive: true,
  },
  {
    _id: "65f200000000000000000003",
    title: "नवीन नळ जोडणी व पाणीपट्टी कर भरणा मोहीम",
    content: "जल जीवन मिशन अंतर्गत गावात नवीन नळ जोडणीसाठी विशेष मोहीम राबविण्यात येत आहे. नागरिकांनी आपली चालू वर्षाची पाणीपट्टी भरून सहकार्य करावे.",
    publishedAt: new Date(Date.now() - 86400000 * 4),
    isActive: true,
  },
];

export const FALLBACK_SCHEMES = [
  {
    _id: "65f300000000000000000001",
    slug: "pmay-rural-gharkul",
    title: "प्रधानमंत्री आवास योजना (ग्रामीण - PMAY-G)",
    category: "घरकुल व निवारा",
    imageUrl: "/images/schemes/pmay-gharkul.jpg",
    description: "ग्रामीण भागातील बेघर व कच्च्या घरात राहणाऱ्या कुटुंबांना पक्के घर बांधणीसाठी ₹ १.२० लाख थेट अनुदान + मनरेगा ९० दिवसांची मजुरी व स्वच्छ भारत शौचालय अनुदान.",
    subsidyDetails: "₹ १.२० लाख थेट बँक खात्यात + ₹ २३,८५० मनरेगा मजुरी + ₹ १२,००० शौचालय अनुदान (एकूण ₹ १.५५ लाख)",
    targetAudience: "ग्रामीण भागातील बेघर, कच्च्या मातीच्या/कुडाच्या घरात राहणारे व आर्थिकदृष्ट्या दुर्बल घटक (BPL/SECC/Awaas+)",
    eligibility: "कुटुंबाकडे संपूर्ण भारतात कुठेही स्वतःचे पक्के घर नसावे. आवास प्लस (Awaas+) किंवा SECC 2011 च्या प्रतीक्षा यादीत नाव समाविष्ट असणे आवश्यक. कोणताही सदस्य शासकीय सेवेत किंवा आयकरदाता नसावा.",
    documentsRequired: "आधार कार्ड (सर्व सदस्यांचे), मनरेगा जॉब कार्ड, ग्रामपंचायत नमुना ८ उतारा / जागेचा मालकी पुरावा, आधार लिंक राष्ट्रीयीकृत बँक पासबुक, जातीचा दाखला (लागू असल्यास), रेशन कार्ड व २ पासपोर्ट फोटो.",
    applicationProcess: "ग्रामपंचायत कार्यालयात ग्रामसेवक किंवा आपले सरकार केंद्राकडे विहित नमुन्यात अर्ज सादर करावा. ग्रामसभेच्या मंजुरीनंतर जिओ-टॅगिंग होऊन थेट बँक खात्यात हप्ते जमा होतात.",
    benefits: [
      "पक्के घर बांधण्यासाठी ४ टप्प्यांमध्ये थेट बँक खात्यात ₹ १.२० लाख थेट अनुदान (DBT)",
      "मनरेगा योजनेतून स्वतःच्या घराच्या बांधकामासाठी ९० दिवसांची अकुशल मजुरी (₹ २३,८५०)",
      "स्वच्छ भारत मिशन अंतर्गत वैयक्तिक शौचालयासाठी ₹ १२,००० अतिरिक्त अनुदान",
      "उज्ज्वला योजनेअंतर्गत मोफत एलपीजी गॅस जोडणी व जल जीवन मिशन अंतर्गत थेट नळ जोडणी",
    ],
    content: "प्रधानमंत्री आवास योजना ग्रामीण (PMAY-G) ही केंद्र आणि राज्य शासनाची अत्यंत महत्त्वाची योजना असून, 'प्रत्येकाला पक्के घर' हे या योजनेचे मुख्य ध्येय आहे. ग्रामीण भागातील बेघर, मातीच्या अथवा कुडाच्या कच्च्या घरांमध्ये राहणाऱ्या कुटुंबांना सर्व सोयीसुविधांनी युक्त दर्जेदार पक्के घर बांधण्यासाठी आर्थिक साह्य दिले जाते. बांधकामाच्या प्रत्येक टप्प्यावर जिओ-टॅगिंग (Geo-tagging) द्वारे पडताळणी करून थेट लाभ हस्तांतरण (DBT) पद्धतीने रक्कम लाभार्थींच्या बँक खात्यात जमा केली जाते. घराचे किमान क्षेत्रफळ २५ चौरस मीटर (स्वयंपाकघरासह) असणे बंधनकारक आहे.",
    faq: [
      {
        question: "अनुदानाचे हप्ते कोणत्या टप्प्यावर मिळतात?",
        answer: "पहिला हप्ता पायाभरणीच्या वेळी (₹ १५,०००), दुसरा हप्ता लिंटेल पातळीवर (₹ ४५,०००), तिसरा हप्ता स्लॅब झाल्यावर (₹ ४०,०००) आणि चौथा हप्ता काम पूर्ण झाल्यावर व रंगकाम झाल्यावर (₹ २०,०००) थेट बँक खात्यात जमा होतो.",
      },
      {
        question: "स्वतःची जागा नसल्यास काय करावे?",
        answer: "पंडित दीनदयाळ उपाध्याय घरकुल जागा खरेदी अर्थसहाय्य योजनेअंतर्गत भूमिहीन लाभार्थ्यांना जागा खरेदीसाठी ₹ ५०,००० पर्यंतचे अनुदान उपलब्ध करून दिले जाते.",
      },
    ],
    externalLink: "https://pmayg.nic.in",
    isActive: true,
  },
  {
    _id: "65f300000000000000000002",
    slug: "magel-tyala-solar-pump-shettale",
    title: "मागेल त्याला सौर कृषी पंप व शेततळे योजना (PM Kusum & Shettale)",
    category: "कृषी व जलसंधारण",
    imageUrl: "/images/schemes/solar-pump-shettale.jpg",
    description: "शेतकऱ्यांना शाश्वत सिंचनासाठी सौर कृषी पंप बसविण्यासाठी ९०% ते ९५% शासकीय अनुदान तसेच शेततळे खोदण्यासाठी व प्लास्टिक अस्तरीकरणासाठी थेट आर्थिक मदत.",
    subsidyDetails: "सौर पंपासाठी ९०% ते ९५% पर्यंत शासकीय अनुदान (शेतकऱ्याला फक्त ५% ते १०% वाटा) + शेततळे अस्तरीकरणासाठी ₹ ७५,०००",
    targetAudience: "अल्प व अत्यल्प भूधारक शेतकरी, पारंपरिक वीज जोडणी नसलेले शेतकरी व लोडशेडिंगने त्रस्त शेतकरी",
    eligibility: "किमान ०.४० हेक्टर ते ५ एकर शेतजमीन असलेले शेतकरी. विहीर, बोअरवेल, शेततळे किंवा बारमाही जलस्रोत उपलब्ध असणे आवश्यक. २.५ एकरासाठी ३ HP, ५ एकरासाठी ५ HP व ५ एकरापेक्षा जास्त जमिनीसाठी ७.५ HP सौर पंप उपलब्ध.",
    documentsRequired: "डिजिटल ७/१२ व ८-अ उतारा (३ महिन्यांच्या आतील), आधार कार्ड, आधार लिंक बँक पासबुक, जलस्रोत उपलब्धतेचा दाखला, जात प्रमाणपत्र (लागू असल्यास).",
    applicationProcess: "महावितरणच्या कुसुम पोर्टलवर (www.mahadiscom.in/solar) किंवा महाडीबीटी (MahaDBT) पोर्टलवर ऑनलाइन अर्ज सादर करावा.",
    benefits: [
      "दिवसा अखंड आणि मोफत सौर वीज उपलब्ध, रात्री पिकांना पाणी देण्याच्या त्रासातून व वन्यजीवांच्या भीतीतून कायमची मुक्ती",
      "३ एचपी, ५ एचपी व ७.५ एचपी क्षमतेचे आधुनिक डीसी सौर पंप संच ५ वर्षांच्या वॉरंटीसह व मोफत विम्यासह उपलब्ध",
      "शेततळे अस्तरीकरणासाठी (Plastic Inlining) ₹ ७५,००० थेट बँक अनुदान",
      "विहीर, बोअरवेल किंवा शेततळ्यावर सौर पंप बसवून ठिबक व तुषार सिंचनाचा १००% लाभ",
    ],
    content: "महावितरण व महाऊर्जा (MEDA) यांच्या संयुक्त विद्यमाने 'मागेल त्याला सौर कृषी पंप' व 'शेततळे' योजना राज्यभरात अत्यंत प्रभावीपणे राबवली जात आहे. लोडशेडिंग आणि रात्रीच्या वीजपुरवठ्यामुळे शेतकऱ्यांना होणारा त्रास लक्षात घेऊन, शासनाने सौर ऊर्जेवर चालणारे कृषी पंप उपलब्ध करून दिले आहेत. शेतात शेततळे तयार करून पावसाचे पाणी साठवून ठेवल्यास उन्हाळ्यातही पिकांना हमखास पाणी देता येते.",
    faq: [
      {
        question: "सौर पंपासाठी किती स्वहिस्सा भरावा लागतो?",
        answer: "सर्वसाधारण प्रवर्गातील शेतकऱ्यांना १०% आणि अनुसूचित जाती/जमाती प्रवर्गातील शेतकऱ्यांना फक्त ५% स्वहिस्सा भरावा लागतो.",
      },
      {
        question: "सौर पंपाची दुरुस्ती कोण करते?",
        answer: "संबंधित कंत्राटदार कंपनीकडून ५ वर्षांपर्यंत सौर पंपाची मोफत देखभाल व दुरुस्ती केली जाते.",
      },
    ],
    externalLink: "https://www.mahadiscom.in/solar",
    isActive: true,
  },
  {
    _id: "65f300000000000000000003",
    slug: "pm-kisan-namo-shetkari-sanman",
    title: "पीएम किसान व नमो शेतकरी महासन्मान निधी योजना",
    category: "शेतकरी कल्याण",
    imageUrl: "/images/schemes/pm-kisan-farmer.jpg",
    description: "शेतकऱ्यांसाठी पीक निविष्ठा खर्च भागवण्यासाठी केंद्र व राज्य शासनातर्फे एकत्रित वार्षिक ₹ १२,००० थेट बँक खात्यात सन्मान निधी.",
    subsidyDetails: "वार्षिक ₹ १२,००० थेट बँक खात्यात (केंद्र ₹ ६,००० + महाराष्ट्र शासन ₹ ६,००० दर चार महिन्यांनी ₹ ४,००० चे ३ समान हप्ते)",
    targetAudience: "महाराष्ट्रातील सर्व अल्प, अत्यल्प व सर्वसाधारण जमीनधारक शेतकरी कुटुंब",
    eligibility: "स्वतःच्या नावावर शेतजमीन असणारे शेतकरी ज्यांची ई-केवायसी (e-KYC), लँड सीडिंग व बँक खात्याशी आधार संलग्नता पूर्ण आहे.",
    documentsRequired: "आधार कार्ड (मोबाईल लिंक), अद्ययावत ७/१२ व ८-अ उतारा, आधार लिंक बँक खाते पासबुक, शेतजमीन नोंद तपशील.",
    applicationProcess: "आपले सरकार सेवा केंद्र, सीएससी (CSC) किंवा पीएम किसान अधिकृत पोर्टलवर (pmkisan.gov.in) ऑनलाइन नोंदणी व ई-केवायसी करावी.",
    benefits: [
      "दर चार महिन्यांनी ₹ ४,००० (केंद्र ₹ २,००० + राज्य ₹ २,०००) थेट बँक खात्यात जमा",
      "बियाणे, खते, कीटकनाशके व मशागतीचा खर्च भागवण्यासाठी वेळेवर आर्थिक पाठबळ",
      "कोणत्याही मध्यस्थाशिवाय थेट पारदर्शक डीबीटी (Direct Benefit Transfer) प्रणाली",
      "पीएम किसान पोर्टलवर स्वतःच्या अर्जाची स्थिती व हप्ता जमा झाल्याची ऑनलाइन तपासणी सोय",
    ],
    content: "शेतकऱ्यांचे उत्पन्न वाढवण्यासाठी आणि कृषी निविष्ठांचा खर्च भागवण्यासाठी केंद्र सरकारतर्फे 'प्रधानमंत्री किसान सन्मान निधी' (PM-KISAN) आणि महाराष्ट्र शासनातर्फे 'नमो शेतकरी महासन्मान निधी योजना' एकत्रितपणे राबविली जात आहे. या अंतर्गत शेतकऱ्यांना वर्षाला एकूण ₹ १२,००० चा आर्थिक लाभ दर चार महिन्यांच्या समान हप्त्यांमध्ये दिला जातो.",
    faq: [
      {
        question: "हप्ता खात्यात जमा झाला नाही तर काय करावे?",
        answer: "पीएम किसान पोर्टलवर 'Know Your Status' मध्ये जाऊन Land Seeding, e-KYC Status आणि Aadhaar Bank Seeding 'YES' असल्याची खात्री करावी.",
      },
    ],
    externalLink: "https://pmkisan.gov.in",
    isActive: true,
  },
  {
    _id: "65f300000000000000000004",
    slug: "mahatma-phule-karjmukti-yojana",
    title: "महात्मा जोतीराव फुले शेतकरी कर्जमुक्ती योजना",
    category: "शेतकरी कर्जमुक्ती",
    imageUrl: "/images/schemes/karjmukti-debt-relief.jpg",
    description: "शेतकऱ्यांचे ₹ २ लाखांपर्यंतचे थकीत पीक कर्ज थेट माफ तसेच नियमित कर्जफेड करणाऱ्या शेतकऱ्यांना ₹ ५०,००० पर्यंत प्रोत्साहनपर अनुदान.",
    subsidyDetails: "₹ २ लाखांपर्यंत थकीत पीक कर्ज पूर्ण माफी + नियमित कर्जदारांना ₹ ५०,००० पर्यंत प्रोत्साहनपर लाभ",
    targetAudience: "जिल्हा मध्यवर्ती सहकारी बँक (DCCB), राष्ट्रीयीकृत व व्यापारी बँकांकडून पीक कर्ज घेतलेले शेतकरी",
    eligibility: "राष्ट्रीयीकृत किंवा सहकारी बँकांकडून घेतलेले अल्पमुदत पीक कर्ज थकीत असणारे शेतकरी. नियमित कर्जफेड करणाऱ्या शेतकऱ्यांना ५० हजार रुपयांपर्यंत प्रोत्साहनपर लाभ. शासकीय नोकरदार व आयकरदाते वगळता सर्व शेतकरी पात्र.",
    documentsRequired: "आधार कार्ड, संबंधित बँकेचे पीक कर्ज पासबुक, ७/१२ व ८-अ उतारा, विशिष्ट कर्ज खाते ओळख क्रमांक (Loan Account ID).",
    applicationProcess: "बँकांमार्फत प्रसिद्ध केलेल्या यादीनुसार आपले सरकार सेवा केंद्र किंवा बँकेत जाऊन बायोमेट्रिक आधार प्रमाणीकरण करावे.",
    benefits: [
      "थकीत पीक कर्जाच्या विळख्यातून शेतकऱ्यांची संपूर्ण मुक्तता आणि नवीन पीक कर्जासाठी तात्काळ पात्रता",
      "नियमित कर्जफेड करणाऱ्या प्रामाणिक शेतकऱ्यांना ₹ ५०,००० पर्यंतचे थेट प्रोत्साहनपर अनुदान",
      "पारदर्शक आधार प्रमाणीकरणामुळे थेट कर्ज खात्यात रक्कम जमा",
      "शेतकऱ्यांना सावकारी पाशातून मुक्ती व आत्मसन्मानाने शेती करण्याची संधी",
    ],
    content: "नैसर्गिक आपत्ती, दुष्काळ आणि अस्मानी संकटांमुळे हवालदिल झालेल्या महाराष्ट्रातील शेतकऱ्यांना कर्जबाजारीपणाच्या विळख्यातून बाहेर काढण्यासाठी 'महात्मा जोतीराव फुले शेतकरी कर्जमुक्ती योजना' सुरू करण्यात आली. या योजनेच्या माध्यमातून राज्यातील लाखो शेतकऱ्यांचे २ लाख रुपयांपर्यंतचे थकीत पीक कर्ज पूर्णपणे माफ करण्यात आले आहे.",
    faq: [
      {
        question: "आधार प्रमाणीकरण कुठे करावे?",
        answer: "गावातील आपले सरकार सेवा केंद्र किंवा संबंधित बँकेच्या शाखेत जाऊन बायोमेट्रिक अंगठा लावून कर्जखात्याची पडताळणी करावी.",
      },
    ],
    externalLink: "https://mjpsky.maharashtra.gov.in",
    isActive: true,
  },
  {
    _id: "65f300000000000000000005",
    slug: "mahila-bal-kalyan-ladki-bahin",
    title: "मुख्यमंत्री माझी लाडकी बहीण व महिला सक्षमीकरण योजना",
    category: "महिला व बालविकास",
    imageUrl: "/images/schemes/mahila-bal-kalyan.jpg",
    description: "महिलांच्या आर्थिक स्वातंत्र्यासाठी व पोषणासाठी दरमहा ₹ १,५०० थेट बँक खात्यात सहाय्य तसेच महिला बचत गटांना स्वावलंबनासाठी अर्थसहाय्य.",
    subsidyDetails: "दरमहा ₹ १,५०० (वार्षिक ₹ १८,०००) थेट पात्र महिलांच्या बँक खात्यात DBT द्वारे जमा",
    targetAudience: "महाराष्ट्रातील २१ ते ६५ वयोगटातील विवाहित, विधवा, घटस्फोटित, परित्यक्ता व निराधार महिला",
    eligibility: "कुटुंबाचे वार्षिक उत्पन्न ₹ २.५० लाखांपेक्षा कमी असावे (पिवळे किंवा केशरी रेशन कार्डधारक कुटुंबांना उत्पन्न दाखल्याची अट शिथिल). महिला महाराष्ट्राची रहिवासी असावी व बँक खाते आधारशी लिंक असावे.",
    documentsRequired: "आधार कार्ड, अधिवास प्रमाणपत्र / रेशन कार्ड / शाळा सोडल्याचा दाखला, आधार लिंक बँक पासबुक, हमीपत्र व पासपोर्ट फोटो.",
    applicationProcess: "नारी शक्ती दूत ॲप किंवा अंगणवाडी / ग्रामपंचायत कार्यालयात ऑफलाइन अथवा ऑनलाइन अर्ज सादर करावा.",
    benefits: [
      "दरमहा ₹ १,५०० थेट बँक खात्यात जमा, आर्थिक स्वावलंबन व सन्मानाची हमी",
      "महिला बचत गटांना (SHGs) शून्य ते कमी व्याजदराने व्यवसाय कर्ज उपलब्ध",
      "कुटुंबातील महिलांचे आरोग्य, पोषण व मुलांच्या शिक्षणासाठी थेट आर्थिक मदत",
      "अंगणवाडी व महिला बालविकास विभागामार्फत विविध प्रशिक्षण उपक्रमांचा लाभ",
    ],
    content: "महिलांच्या आर्थिक स्वातंत्र्यासाठी, आरोग्य व पोषणात सुधारणा करण्यासाठी आणि कुटुंबातील त्यांची निर्णायक भूमिका बळकट करण्यासाठी 'मुख्यमंत्री माझी लाडकी बहीण योजना' ही क्रांतिकारी योजना सुरू करण्यात आली आहे. या योजनेद्वारे पात्र भगिनींना दरमहा थेट आर्थिक मदत दिली जाते, ज्यामुळे त्या स्वतःच्या व मुलांच्या लहान-मोठ्या गरजा पूर्ण करू शकतात.",
    faq: [
      {
        question: "अर्ज भरण्यासाठी काही शुल्क द्यावे लागते का?",
        answer: "नाही, लाडकी बहीण योजनेचा अर्ज पूर्णपणे विनामूल्य आहे.",
      },
    ],
    externalLink: "https://ladakibahin.maharashtra.gov.in",
    isActive: true,
  },
  {
    _id: "65f300000000000000000006",
    slug: "shabari-ramai-tribal-gharkul",
    title: "शबरी आदिवासी व रमाई अनुसूचित जाती घरकुल योजना",
    category: "घरकुल व सामाजिक न्याय",
    imageUrl: "/images/schemes/shabari-tribal-gharkul.jpg",
    description: "अनुसूचित जमाती (ST) व अनुसूचित जाती (SC) प्रवर्गातील बेघर बांधवांसाठी सर्व सोयीसुविधांनी युक्त पक्के घरकुल अनुदान.",
    subsidyDetails: "₹ १.३० लाख ते ₹ २.५० लाख थेट घरकुल बांधकाम अनुदान + मनरेगा मजुरी व शौचालय सहाय्य",
    targetAudience: "अनुसूचित जमाती (ST - शबरी) व अनुसूचित जाती/नवबौद्ध (SC - रमाई) प्रवर्गातील बेघर व कच्च्या घरात राहणारे बांधव",
    eligibility: "सक्षम प्राधिकाऱ्याने दिलेले अधिकृत जात प्रमाणपत्र असलेले व ग्रामीण भागात कच्च्या झोपडीत राहणारे भूमिहीन अथवा घर नसलेले कुटुंब. वार्षिक उत्पन्न विहित मर्यादेत असणे आवश्यक.",
    documentsRequired: "जातीचा दाखला, आधार कार्ड, जागेचा नमुना ८ / घरठाण मालकी सनद, रेशन कार्ड, बँक पासबुक व जॉब कार्ड.",
    applicationProcess: "ग्रामपंचायतीमार्फत एकात्मिक आदिवासी विकास प्रकल्प (ITDP) किंवा समाजकल्याण विभागाकडे विहित नमुन्यात प्रस्ताव सादर करावा.",
    benefits: [
      "किमान २६९ चौरस फूट क्षेत्रफळाचे पक्के, दर्जेदार व सुरक्षित घरकुल बांधकाम",
      "मनरेगातून बांधकामासाठी ९० दिवसांचे वेतन आणि स्वच्छ भारत मिशन अंतर्गत शौचालयाचे अनुदान",
      "आदिवासी व मागासवर्गीय बांधवांना समाजात सुरक्षितता व सन्मानजनक निवारा",
      "थेट बँक खात्यात टप्प्याटप्प्याने अनुदान वितरण (Geo-tagging DBT)",
    ],
    content: "आदिवासी बांधवांना आणि मागासवर्गीय घटकांना समाजाच्या मुख्य प्रवाहात आणण्यासाठी 'शबरी आदिवासी घरकुल योजना' आणि 'रमाई आवास योजना' अत्यंत प्रभावीपणे कार्यरत आहेत. डोंगराळ व दुर्गम भागात राहणाऱ्या कुटुंबांना निसर्गाच्या प्रतिकूल परिस्थितीशी सामना करण्यासाठी मजबूत व टिकाऊ पक्के घर मिळवून देणे हा या योजनेचा मुख्य उद्देश आहे.",
    faq: [
      {
        question: "घराचे क्षेत्रफळ किती असावे?",
        answer: "किमान २६९ चौरस फूट क्षेत्रफळाचे पक्के बांधकाम करणे आवश्यक आहे.",
      },
    ],
    externalLink: "https://adivasi.maharashtra.gov.in",
    isActive: true,
  },
  {
    _id: "65f300000000000000000007",
    slug: "sanjay-gandhi-niradhar-anudan",
    title: "संजय गांधी निराधार व श्रावणबाळ पेन्शन अनुदान योजना",
    category: "सामाजिक सुरक्षा व पेन्शन",
    imageUrl: "/images/schemes/sanjay-gandhi-niradhar.jpg",
    description: "निराधार वृद्ध, दिव्यांग व्यक्ती, विधवा व दुर्धर आजाराने ग्रस्त नागरिकांसाठी दरमहा थेट सन्मान पेन्शन योजना.",
    subsidyDetails: "दरमहा ₹ १,५०० थेट पेन्शन लाभार्थीच्या बँक खात्यात जमा",
    targetAudience: "६५ वर्षांवरील निराधार वृद्ध, ४०% पेक्षा जास्त अपंगत्व असणारे दिव्यांग, विधवा, घटस्फोटित महिला व अनाथ मुले",
    eligibility: "महाराष्ट्रात सलग १५ वर्षे वास्तव्याचा पुरावा. कुटुंबाचे वार्षिक उत्पन्न ₹ २१,००० ते ₹ ५०,००० पेक्षा कमी असावे. स्वतःची उपजीविकेचे कोणतेही साधन नसलेले नागरिक.",
    documentsRequired: "वयाचा दाखला, तहसीलदार उत्पन्न दाखला, रहिवासी दाखला (१५ वर्षे), दिव्यांग प्रमाणपत्र (लागू असल्यास), आधार कार्ड व बँक पासबुक.",
    applicationProcess: "तहसील कार्यालयातील संजय गांधी योजना शाखेत किंवा ग्रामपंचायतीच्या मदतीने विहित नमुन्यातील अर्ज सादर करावा.",
    benefits: [
      "दरमहा ₹ १,५०० थेट बँक खात्यात जमा, औषधोपचार व मूलभूत गरजांसाठी शाश्वत आधार",
      "वृद्ध व दिव्यांग बांधवांना सन्मानाने जगण्याची हमी",
      "कोणत्याही मध्यस्थाशिवाय थेट खात्यात डीबीटी वितरण",
    ],
    content: "समाजातील दुर्बल, वृद्ध, दिव्यांग आणि असहाय घटकांना मानाने व सन्मानाने जगता यावे यासाठी 'संजय गांधी निराधार अनुदान योजना' ही शासनाची अत्यंत संवेदनशील योजना आहे. कोणताही आधार नसलेल्या वृद्ध आणि विधवा माता-भगिनींना दरमहा मिळणारे निवृत्तीवेतन त्यांच्या औषधोपचार व दैनंदिन उपजीविकेसाठी भक्कम आधार ठरते.",
    faq: [
      {
        question: "पेन्शन कशी मिळते?",
        answer: "दरमहा शासनाकडून थेट लाभार्थीच्या बँक किंवा पोस्ट खात्यात डीबीटी पद्धतीने पेन्शन जमा केली जाते.",
      },
    ],
    externalLink: "https://sjsa.maharashtra.gov.in",
    isActive: true,
  },
  {
    _id: "65f300000000000000000008",
    slug: "jal-jeevan-mission-har-ghar-jal",
    title: "जल जीवन मिशन - हर घर नल से जल योजना",
    category: "पाणीपुरवठा व स्वच्छता",
    imageUrl: "/images/schemes/jal-jeevan-mission.jpg",
    description: "प्रत्येक ग्रामीण कुटुंबाला घरबसल्या शुद्ध, सुरक्षित व मुबलक पिण्याच्या पाण्यासाठी मोफत कार्यान्वित नळ जोडणी (FHTC).",
    subsidyDetails: "प्रत्येक ग्रामीण घराला मोफत नळ जोडणी + शुद्धीकरण पाणीपुरवठा सुविधा",
    targetAudience: "गावातील सर्व नागरिक, वाड्या, वस्त्या, जिल्हा परिषद शाळा व अंगणवाड्या",
    eligibility: "गावातील सर्व कायमस्वरूपी रहिवासी कुटुंबे ज्यांच्या घरी अद्याप वैयक्तिक नळ कनेक्शन नाही.",
    documentsRequired: "ग्रामपंचायत घरपट्टी पावती (नमुना ८), आधार कार्ड, नळ जोडणी मागणी अर्ज.",
    applicationProcess: "ग्रामपंचायत पाणीपुरवठा व स्वच्छता समितीकडे (VWSC) नमुना अर्जासह मागणी करावी. ग्रामपंचायतीच्या जलवाहिनीवरून घरात नळ कनेक्शन जोडले जाते.",
    benefits: [
      "प्रत्येक व्यक्तीला दररोज किमान ५५ लिटर शुद्ध व प्रमाणित पिण्याचे पाणी थेट घरात उपलब्ध",
      "महिलांची दूरवरून पाणी आणण्याच्या त्रासातून व डोक्यावरील हंड्याच्या वजनातून कायमची मुक्ती",
      "पाण्यामुळे होणाऱ्या साथीच्या रोगांना आळा व गावातील आरोग्याचा दर्जा उंचावणे",
      "शाळा व अंगणवाड्यांमध्ये स्वतंत्र पिण्याच्या पाण्याची व हात धुण्याची नळ सुविधा",
    ],
    content: "'जल जीवन मिशन' अंतर्गत ग्रामीण भागातील महिलांना दूरवरून पाणी आणण्याच्या त्रासातून कायमची मुक्ती देण्यात आली आहे. प्रत्येक घरात शुद्ध व सुरक्षित पिण्याचे पाणी थेट नळाद्वारे उपलब्ध करून देऊन गावाचा आरोग्य स्तर उंचावणे हे या मिशनचे प्रमुख उद्दिष्ट आहे.",
    faq: [
      {
        question: "पाण्याची गुणवत्ता कशी तपासली जाते?",
        answer: "ग्रामपंचायतीच्या महिला जलसुरक्षा रक्षक 'Field Test Kit' (FTK) द्वारे नियमितपणे पाण्याच्या गुणवत्तेची तपासणी करतात.",
      },
    ],
    externalLink: "https://jaljeevanmission.gov.in",
    isActive: true,
  },
  {
    _id: "65f300000000000000000009",
    slug: "mgnrega-rozgar-hami-yojana",
    title: "महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार हमी योजना (MGNREGA)",
    category: "रोजगार व हमी",
    imageUrl: "/images/schemes/mgnrega-rozgar.jpg",
    description: "ग्रामीण भागातील अकुशल मजुरी करू इच्छिणाऱ्या प्रौढ व्यक्तींना एका वर्षात किमान १०० दिवसांच्या रोजगाराची कायदेशीर हमी.",
    subsidyDetails: "किमान १०० दिवसांच्या रोजगाराची कायदेशीर हमी + प्रतिदिन विहित शासकीय मजुरी दर थेट बँक खात्यात",
    targetAudience: "गावातील १८ वर्षांवरील अकुशल शारीरिक श्रम करण्यास इच्छुक सर्व नागरिक",
    eligibility: "गावातील स्थानिक रहिवासी असलेले १८ वर्षांवरील प्रौढ नागरिक ज्यांच्याकडे ग्रामपंचायतीचे जॉब कार्ड आहे.",
    documentsRequired: "जॉब कार्ड, आधार कार्ड, राष्ट्रीयीकृत बँक खाते पासबुक, २ पासपोर्ट फोटो.",
    applicationProcess: "ग्रामपंचायतीत नमुना ४ मध्ये काम मागणी अर्ज दाखल करावा. १५ दिवसांत काम उपलब्ध केले जाते.",
    benefits: [
      "एका वर्षात प्रत्येक कुटुंबाला १०० दिवसांच्या अकुशल रोजगाराची कायदेशीर हमी",
      "मागणी केल्यानंतर १५ दिवसांत रोजगार न मिळाल्यास बेरोजगारी भत्ता मिळण्याचा अधिकार",
      "गावात पाणलोट क्षेत्र विकास, फळबाग लागवड, गोठे बांधणी, रस्ते व नाला बांधणीची कामे",
      "मजुरी थेट राष्ट्रीयीकृत बँकेतील खात्यात दर आठवड्याला जमा",
    ],
    content: "महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार हमी कायदा (मनरेगा) ही ग्रामीण भागातील नागरिकांना रोजगाराचा मूलभूत हक्क देणारी ऐतिहासिक योजना आहे. गावातील नागरिकांचे शहरांकडे होणारे स्थलांतर थांबवणे आणि गावातच जलसंधारण, वृक्षलागवड व पायाभूत सुविधा निर्माण करणे हे या योजनेचे दुहेरी उद्दिष्ट आहे.",
    faq: [
      {
        question: "जॉब कार्ड कसे काढावे?",
        answer: "ग्रामपंचायतीत नमुना १ मध्ये अर्ज आणि आधार कार्ड देऊन मोफत जॉब कार्ड तात्काळ मिळवता येते.",
      },
    ],
    externalLink: "https://nrega.nic.in",
    isActive: true,
  },
  {
    _id: "65f300000000000000000010",
    slug: "gopinath-munde-shetkari-vima",
    title: "गोपीनाथ मुंडे शेतकरी अपघात सुरक्षा सानुग्रह अनुदान योजना",
    category: "शेतकरी सामाजिक सुरक्षा",
    imageUrl: "/images/schemes/gopinath-munde-vima.jpg",
    description: "अपघाती मृत्यू किंवा कायमचे अपंगत्व आल्यास खातेदार शेतकऱ्याच्या वारसास ₹ २ लाखांपर्यंतचे थेट आर्थिक सहाय्य.",
    subsidyDetails: "अपघाती मृत्यू किंवा २ अवयव निकामी झाल्यास ₹ २ लाख, १ डोळा/हात/पाय निकामी झाल्यास ₹ १ लाख",
    targetAudience: "महाराष्ट्रातील १० ते ७५ वयोगटातील सर्व खातेदार शेतकरी व त्यांच्या कुटुंबातील सदस्य",
    eligibility: "७/१२ उताऱ्यावर नोंद असलेला खातेदार शेतकरी किंवा त्याच्या कुटुंबातील सदस्य (आई, वडील, पती/पत्नी, मुलगा, अविवाहित मुलगी). शेतीकाम, रस्ता अपघात, वीज पडणे, सर्पदंश, विहिरीत बुडणे यांसारखे अपघात समाविष्ट.",
    documentsRequired: "एफआयआर (FIR) प्रत, पोलिस पंचनामा, शवविच्छेदन अहवाल (Post Mortem), मृत्यू दाखला, ७/१२ व ८-अ उतारा, वारसाचे आधार व बँक पासबुक.",
    applicationProcess: "अपघाताची घटना घडल्यापासून ३० दिवसांच्या आत तालुका कृषी अधिकारी कार्यालयात सर्व कागदपत्रांसह प्रस्ताव दाखल करावा.",
    benefits: [
      "शेतकऱ्याला कोणताही विमा हप्ता न भरता शासनामार्फत संपूर्ण मोफत संरक्षण",
      "अपघाती मृत्यूनंतर शेतकरी कुटुंबाला तात्काळ ₹ २ लाखांचे भक्कम आर्थिक पाठबळ",
      "पारदर्शक पद्धतीने थेट वारसाच्या बँक खात्यात निधी वर्ग",
    ],
    content: "शेतीकाम करताना शेतकऱ्यांना सर्पदंश, वीज पडणे, यंत्रांचा वापर यांसारख्या विविध अनपेक्षित अपघातांना सामोरे जावे लागते. अशा वेळी कुटुंबातील कर्त्या व्यक्तीचा अपघाती मृत्यू झाल्यास कुटुंबाची होणारी वाताहात थांबवण्यासाठी 'गोपीनाथ मुंडे शेतकरी अपघात सुरक्षा योजना' राबविली जाते.",
    faq: [
      {
        question: "प्रस्ताव दाखल करण्याची मुदत किती आहे?",
        answer: "अपघाताची घटना घडल्यापासून ३० दिवसांच्या आत तालुका कृषी अधिकाऱ्यांकडे दावा दाखल करणे बंधनकारक आहे.",
      },
    ],
    externalLink: "https://krishi.maharashtra.gov.in",
    isActive: true,
  },
  {
    _id: "65f300000000000000000011",
    slug: "smart-village-sundar-gaav",
    title: "स्मार्ट ग्राम व आर. आर. (आबा) पाटील सुंदर गाव योजना",
    category: "ग्रामविकास व गौरव पुरस्कार",
    imageUrl: "/images/schemes/smart-village-swachhata.jpg",
    description: "स्वच्छता, पर्यावरण संवर्धन, १००% कर वसुली व डिजिटल ई-प्रशासनात उत्कृष्ट कामगिरी करणाऱ्या गावांना विशेष विकास पारितोषिक.",
    subsidyDetails: "तालुका स्तरावर ₹ १० लाख, जिल्हा स्तरावर ₹ २० लाख ते विभाग स्तरावर ₹ ४० लाखांचे विकास पारितोषिक",
    targetAudience: "गावातील सर्व ग्रामस्थ, महिला बचत गट, युवक व ग्रामपंचायत प्रशासन",
    eligibility: "गावातील १००% हागणदारीमुक्ती, घनकचरा व सांडपाणी व्यवस्थापन, १००% कर वसुली आणि सौर ऊर्जेचा प्रभावी वापर करणारी ग्रामपंचायत.",
    documentsRequired: "ग्रामसभा ठराव, विकासकामांचा अहवाल, ताळेबंद व लेखापरीक्षण अहवाल.",
    applicationProcess: "ग्रामपंचायतीमार्फत विहित निकषांनुसार तालुका स्तरावर मूल्यांकन समितीकडे प्रस्ताव दाखल केला जातो.",
    benefits: [
      "गावाच्या सर्वांगीण विकासासाठी ₹ १० लाख ते ₹ ४० लाखांचा थेट विकास निधी",
      "गावात सिमेंट रस्ते, डिजिटल शाळा, सौर पथदिवे व आधुनिक आरोग्य सुविधांची निर्मिती",
      "लोकसहभागातून गावाला राज्यस्तरावर आदर्श ओळख व गौरव",
    ],
    content: "गावांमध्ये निकोप विकासाची स्पर्धा निर्माण व्हावी, गाव कचरामुक्त, हरित आणि डिजिटल व्हावे यासाठी 'आर. आर. (आबा) पाटील सुंदर गाव योजना' राबवली जाते. लोकसहभाग आणि पारदर्शक कारभारातून गावाला समृद्ध बनवणे हा या योजनेचा आत्मा आहे.",
    faq: [
      {
        question: "गावाचे मूल्यांकन कोण करते?",
        answer: "जिल्हा परिषद व पंचायत समितीच्या तज्ज्ञ समितीमार्फत प्रत्यक्ष गावात येऊन गुणांकन केले जाते.",
      },
    ],
    externalLink: "https://rdd.maharashtra.gov.in",
    isActive: true,
  },
  {
    _id: "65f300000000000000000012",
    slug: "15th-finance-commission-gram-vikas",
    title: "१५ वा वित्त आयोग - आदर्श ग्रामविकास व पायाभूत सुविधा",
    category: "ग्रामविकास व पायाभूत",
    imageUrl: "/images/schemes/gram-vikas-infra.jpg",
    description: "केंद्राच्या १५ व्या वित्त आयोगांतर्गत ५०% अबंध (Untied) व ५०% बंधीत (Tied) निधीतून गावातील पायाभूत विकासकामे व स्वच्छ भारत उपक्रम.",
    subsidyDetails: "केंद्राकडून ग्रामपंचायतीला थेट ५०% बंधित (Tied) व ५०% अबंध (Untied) विकास निधी",
    targetAudience: "गावातील सर्व नागरिक, वॉर्ड व सार्वजनिक पायाभूत सुविधा",
    eligibility: "गावातील सर्व नागरिक व सार्वजनिक पायाभूत सुविधांसाठी उपक्रम.",
    documentsRequired: "ग्रामसभा ठराव, अंदाजपत्रक व तांत्रिक मंजुरी.",
    applicationProcess: "ग्रामसभेत विकास आराखडा (GPDP) तयार करून कामांची निवड केली जाते.",
    benefits: [
      "गावातील मुख्य रस्ते सिमेंट काँक्रीटीकरण व भूमिगत सांडपाणी गटार व्यवस्था",
      "पिण्याच्या पाण्याचे शुद्धीकरण, जलकुंभ देखभाल व २४ तास नळ पाणीपुरवठा",
      "घनकचरा व सांडपाणी व्यवस्थापन (Solid & Liquid Waste Management)",
      "सौर पथदिवे, स्मशानभूमी सुशोभीकरण व शाळा/अंगणवाडी डिजिटल नूतनीकरण",
    ],
    content: "१५ व्या वित्त आयोगांतर्गत थेट ग्रामपंचायतीच्या खात्यात विकास निधी वर्ग केला जातो. गावातील ग्रामसभेत नागरिक स्वतः गावचा विकास आराखडा (GPDP - Gram Panchayat Development Plan) तयार करतात. यामध्ये ५०% निधी पाणीपुरवठा व स्वच्छतेसाठी (Tied) आणि ५०% निधी गावातील इतर आवश्यक मूलभूत गरजांसाठी (Untied) खर्च केला जातो.",
    faq: [
      {
        question: "निधी कसा खर्च केला जातो?",
        answer: "ई-ग्रामस्वराज पोर्टलवर विकास आराखडा अपलोड करून पीएफएमएस (PFMS) द्वारे थेट डिजिटल देयक अदा केले जाते.",
      },
    ],
    externalLink: "https://egramswaraj.gov.in",
    isActive: true,
  },
];

export const FALLBACK_PROJECTS = [
  {
    _id: "65f400000000000000000001",
    title: "जिल्हा परिषद प्राथमिक शाळा डिजिटल वर्गखोली नूतनीकरण",
    category: "शिक्षण व पायाभूत सुविधा",
    description: "गावातील जिल्हा परिषद शाळेत आधुनिक डिजिटल स्मार्ट बोर्ड, रंगरंगोटी व लोकसहभागातून ग्रंथालय उभारणी.",
    status: "COMPLETED",
    budget: 350000,
    startDate: new Date("2025-04-01"),
    completionDate: new Date("2025-08-15"),
  },
  {
    _id: "65f400000000000000000002",
    title: "वॉर्ड क्र. २ व ३ मध्ये काँक्रीट रस्ता व बंदिस्त गटार बांधकाम",
    category: "स्वच्छता व रस्ते विकास",
    description: "गावठाण अंतर्गत मुख्य रस्त्याचे सिमेंट काँक्रीटीकरण आणि सांडपाणी निचऱ्यासाठी भूमिगत पाईपलाईन गटार.",
    status: "ONGOING",
    budget: 850000,
    startDate: new Date("2025-11-01"),
    completionDate: new Date("2026-03-30"),
  },
  {
    _id: "65f400000000000000000003",
    title: "सौर ऊर्जा पथदिवे (Solar Street Lights) बसविणे",
    category: "ऊर्जा व ग्रामविकास",
    description: "गावातील सर्व प्रमुख चौक आणि स्मशानभूमी परिसरात ५० सौर पथदिवे बसवून प्रकाश व्यवस्था करणे.",
    status: "COMPLETED",
    budget: 420000,
    startDate: new Date("2025-06-01"),
    completionDate: new Date("2025-09-30"),
  },
];

// ==================== RESILIENT DATA RETRIEVAL FUNCTIONS ====================

export async function getVillageBySlug(slug: string) {
  let villageData: any = null;
  try {
    const conn = await connectDB();
    if (conn) {
      const village = await Village.findOne({ slug }).lean();
      if (village) villageData = JSON.parse(JSON.stringify(village));
    }
  } catch (err) {
    console.warn(`[Fallback] MongoDB not reachable for village slug '${slug}'. Using fallback data.`);
  }

  if (!villageData) {
    villageData = FALLBACK_VILLAGES.find(
      (v) => v.slug.toLowerCase() === slug.toLowerCase()
    ) || FALLBACK_VILLAGES[0];
  }

  if (villageData) {
    const defaultGallery =
      DEFAULT_VILLAGE_GALLERIES[villageData.slug] ||
      DEFAULT_VILLAGE_GALLERIES.komalwadi;
    if (!villageData.galleryImages || villageData.galleryImages.length === 0) {
      villageData.galleryImages = defaultGallery;
    }
  }

  return villageData;
}

export async function getAllVillages() {
  let villagesList: any[] = [];
  try {
    const conn = await connectDB();
    if (conn) {
      const villages = await Village.find().sort({ name: 1 }).lean();
      if (villages && villages.length > 0) {
        villagesList = JSON.parse(JSON.stringify(villages));
      }
    }
  } catch (err) {
    console.warn("[Fallback] MongoDB not reachable for getAllVillages. Using fallback villages.");
  }

  if (villagesList.length === 0) {
    villagesList = FALLBACK_VILLAGES;
  }

  return villagesList.map((v) => {
    const defaultGallery =
      DEFAULT_VILLAGE_GALLERIES[v.slug] || DEFAULT_VILLAGE_GALLERIES.komalwadi;
    return {
      ...v,
      galleryImages:
        v.galleryImages && v.galleryImages.length > 0
          ? v.galleryImages
          : defaultGallery,
    };
  });
}

export async function getVillageServices(villageId?: any, villageSlug?: string) {
  try {
    const conn = await connectDB();
    if (conn) {
      const query: any = { isActive: true };
      if (villageId && villageSlug) {
        query.$or = [{ villageId }, { villageSlug }];
      } else if (villageId) {
        query.villageId = villageId;
      } else if (villageSlug) {
        query.villageSlug = villageSlug;
      }

      const services = await Service.find(query).sort({ order: 1, createdAt: -1 }).lean();
      if (services && services.length > 0) {
        const plainServices = JSON.parse(JSON.stringify(services));
        const fallbackMap = new Map(FALLBACK_SERVICES.map((s) => [s.slug, s]));

        const normalizedDbServices = plainServices.map((s: any) => {
          const fallback = fallbackMap.get(s.slug);
          if (fallback) {
            return {
              ...s,
              category: fallback.category,
              name: s.name || fallback.name,
              description: s.description || fallback.description,
              icon: s.icon || fallback.icon,
              actionText: s.actionText || fallback.actionText,
              fee: s.fee || fallback.fee,
            };
          }
          return s;
        });

        const dbSlugs = new Set(normalizedDbServices.map((s: any) => s.slug));
        const missingFallbacks = FALLBACK_SERVICES.filter((f) => !dbSlugs.has(f.slug));
        return [...normalizedDbServices, ...missingFallbacks];
      }
    }
  } catch (err) {
    console.warn("[Fallback] MongoDB not reachable for services. Using fallback services.");
  }

  return FALLBACK_SERVICES;
}

export async function getVillageNotices(villageId?: any, limit = 10, villageSlug?: string) {
  try {
    const conn = await connectDB();
    if (conn) {
      let resolvedId = villageId;
      let resolvedSlug = villageSlug;

      if (!resolvedSlug && resolvedId) {
        if (typeof resolvedId === "string" && !resolvedId.match(/^[0-9a-fA-F]{24}$/)) {
          resolvedSlug = resolvedId;
        }
      }

      if (resolvedSlug && !resolvedId) {
        const v = await Village.findOne({ slug: resolvedSlug }).select("_id").lean();
        if (v) resolvedId = v._id;
      } else if (resolvedId && !resolvedSlug && String(resolvedId).match(/^[0-9a-fA-F]{24}$/)) {
        const v = await Village.findById(resolvedId).select("slug").lean();
        if (v) resolvedSlug = v.slug;
      }

      const orConditions: any[] = [];
      if (resolvedId && String(resolvedId).match(/^[0-9a-fA-F]{24}$/)) {
        orConditions.push({ villageId: resolvedId });
      }
      if (resolvedSlug) {
        orConditions.push({ villageSlug: resolvedSlug });
      }

      const query: any = {
        isActive: true,
        ...(orConditions.length > 0 ? { $or: orConditions } : {}),
      };

      const notices = await Notice.find(query)
        .sort({ isImportant: -1, publishedAt: -1 })
        .limit(limit)
        .lean();
      if (notices && notices.length > 0) return JSON.parse(JSON.stringify(notices));
    }
  } catch (err) {
    console.warn("[Fallback] MongoDB not reachable for notices. Using fallback notices.");
  }

  return FALLBACK_NOTICES.slice(0, limit).map((n, idx) => ({
    ...n,
    isImportant: idx === 0,
  }));
}

export function resolveSchemeImage(scheme: any): string {
  if (scheme.imageUrl && scheme.imageUrl.trim().length > 0 && scheme.imageUrl !== "/images/hero-bg.jpg") {
    return scheme.imageUrl;
  }
  const text = `${scheme.title || ""} ${scheme.category || ""} ${scheme.description || ""} ${scheme.slug || ""}`.toLowerCase();

  if (text.includes("कर्जमुक्ती") || text.includes("karjmukti") || text.includes("पीक कर्ज") || text.includes("फुले")) {
    return "/images/schemes/karjmukti-debt-relief.jpg";
  }
  if (text.includes("शबरी") || text.includes("रमाई") || text.includes("shabari") || text.includes("आदिवासी घरकुल")) {
    return "/images/schemes/shabari-tribal-gharkul.jpg";
  }
  if (text.includes("संजय गांधी") || text.includes("निराधार") || text.includes("श्रावणबाळ") || text.includes("पेन्शन") || text.includes("niradhar")) {
    return "/images/schemes/sanjay-gandhi-niradhar.jpg";
  }
  if (text.includes("जल जीवन") || text.includes("नल से जल") || text.includes("jal jeevan") || text.includes("पिण्याचे पाणी") || text.includes("नळ जोडणी")) {
    return "/images/schemes/jal-jeevan-mission.jpg";
  }
  if (text.includes("गोपीनाथ मुंडे") || text.includes("अपघात") || text.includes("विमा") || text.includes("सुरक्षा सानुग्रह") || text.includes("gopinath")) {
    return "/images/schemes/gopinath-munde-vima.jpg";
  }
  if (text.includes("स्मार्ट ग्राम") || text.includes("सुंदर गाव") || text.includes("smart village") || text.includes("आर. आर.")) {
    return "/images/schemes/smart-village-swachhata.jpg";
  }
  if (text.includes("लाडकी बहीण") || text.includes("महिला") || text.includes("बचत गट") || text.includes("कन्या") || text.includes("बाल")) {
    return "/images/schemes/mahila-bal-kalyan.jpg";
  }
  if (text.includes("शेततळे") || text.includes("सौर") || text.includes("पंप") || text.includes("kusum") || text.includes("सिंचन") || text.includes("कृषी व जल")) {
    return "/images/schemes/solar-pump-shettale.jpg";
  }
  if (text.includes("पीएम किसान") || text.includes("नमो शेतकरी") || text.includes("kisan") || text.includes("कृषी सन्मान")) {
    return "/images/schemes/pm-kisan-farmer.jpg";
  }
  if (text.includes("रोजगार") || text.includes("मनरेगा") || text.includes("mgnrega") || text.includes("मजुरी") || text.includes("काम")) {
    return "/images/schemes/mgnrega-rozgar.jpg";
  }
  if (text.includes("घरकुल") || text.includes("आवास") || text.includes("pmay") || text.includes("housing")) {
    return "/images/schemes/pmay-gharkul.jpg";
  }
  return "/images/schemes/gram-vikas-infra.jpg";
}

function normalizeScheme(scheme: any) {
  if (!scheme) return null;
  const parsed = typeof scheme.toObject === "function" ? scheme.toObject() : scheme;
  return {
    ...parsed,
    _id: parsed._id?.toString() || parsed.slug,
    slug: parsed.slug || parsed._id?.toString() || "scheme",
    imageUrl: resolveSchemeImage(parsed),
    subsidyDetails: parsed.subsidyDetails || (Array.isArray(parsed.benefits) && parsed.benefits[0]) || "थेट शासकीय अनुदान व सहाय्य",
    benefits: Array.isArray(parsed.benefits) && parsed.benefits.length > 0
      ? parsed.benefits
      : [
          "थेट बँक खात्यात आर्थिक सहाय्य व अनुदान वितरण",
          "पारदर्शक डिजिटल अर्ज प्रणाली व जलद मंजुरी",
          "स्थानिक ग्रामपंचायत कार्यालयामार्फत प्रत्यक्ष सहकार्य व मार्गदर्शन",
        ],
    content: parsed.content || parsed.description,
  };
}

export async function getVillageSchemes(_villageId?: any, limit = 20, _villageSlug?: string) {
  try {
    const conn = await connectDB();
    if (conn) {
      // Schemes are common to all villages
      const schemes = await Scheme.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      if (schemes && schemes.length > 0) {
        return schemes.map((s: any) => normalizeScheme(s));
      }
    }
  } catch (err) {
    console.warn("[Fallback] MongoDB not reachable for schemes. Using fallback schemes.");
  }

  return FALLBACK_SCHEMES.slice(0, limit).map((s) => normalizeScheme(s));
}

export async function getSchemeBySlug(slug: string) {
  try {
    const conn = await connectDB();
    if (conn) {
      const orConditions: any[] = [{ slug }];
      if (/^[0-9a-fA-F]{24}$/.test(slug)) {
        orConditions.push({ _id: slug });
      }
      const scheme = await Scheme.findOne({
        $or: orConditions,
        isActive: true,
      }).lean();
      if (scheme) return normalizeScheme(scheme);
    }
  } catch (err) {
    console.warn(`[Fallback] MongoDB not reachable for scheme slug '${slug}'.`);
  }

  const fallback = FALLBACK_SCHEMES.find(
    (s) => s.slug === slug || s._id === slug
  );
  return fallback ? normalizeScheme(fallback) : null;
}

export async function getVillageProjects(villageId?: any, limit = 10, villageSlug?: string) {
  try {
    const conn = await connectDB();
    if (conn) {
      const query: any = {};
      if (villageId && villageSlug) {
        query.$or = [{ villageId }, { villageSlug }];
      } else if (villageId) {
        query.villageId = villageId;
      } else if (villageSlug) {
        query.villageSlug = villageSlug;
      }

      const projects = await Project.find(query).sort({ createdAt: -1 }).limit(limit).lean();
      if (projects && projects.length > 0) return JSON.parse(JSON.stringify(projects));
    }
  } catch (err) {
    console.warn("[Fallback] MongoDB not reachable for projects. Using fallback projects.");
  }

  return FALLBACK_PROJECTS.slice(0, limit);
}

// ==================== VILLAGE-SPECIFIC EXTRACTED DATA ====================

export interface VillageRepresentative {
  role: string;
  name: string;
  phone?: string;
  email?: string;
  ward?: string;
  photoUrl?: string;
  isSarpanch?: boolean;
  isUpasarpanch?: boolean;
  isOfficer?: boolean;
  isStaff?: boolean;
}

export interface VillageStats {
  population: string;
  malePopulation?: string;
  femalePopulation?: string;
  households: string;
  literacyRate: string;
  femaleLiteracy?: string;
  area: string;
  schools: string;
  distanceFromTaluka: string;
  distanceFromDistrict: string;
}

export const VILLAGE_DETAILS: Record<
  string,
  {
    stats: VillageStats;
    representatives: VillageRepresentative[];
    visionPoints: string[];
    initiatives: { title: string; date: string; category: string; description: string }[];
  }
> = {
  komalwadi: {
    stats: {
      population: "१,५९८",
      malePopulation: "८०७",
      femalePopulation: "७९१ (४९.५%)",
      households: "२९५",
      literacyRate: "७२.३%",
      femaleLiteracy: "३३.२%",
      area: "५००० चौ.कि.मी.",
      schools: "०४ केंद्रे",
      distanceFromTaluka: "१८ कि.मी. (सिन्नर)",
      distanceFromDistrict: "४२ कि.मी. (नाशिक)",
    },
    representatives: [
      {
        role: "सरपंच",
        name: "सौ. अलका साहेबराव भोर",
        phone: "९८२३९७८४९२",
        email: "gpkomalwadi@gmail.com",
        isSarpanch: true,
      },
      {
        role: "उपसरपंच",
        name: "सौ. अमृता शशिकांत अढांगळे",
        phone: "९६२३५४०९३७",
        email: "gpkomalwadi@gmail.com",
        isUpasarpanch: true,
      },
      {
        role: "ग्रामपंचायत सदस्या",
        name: "सौ. सरला तानाजी बोंबले",
        phone: "९७६४९८६७९४",
        ward: "वार्ड क्र. १",
      },
      {
        role: "ग्रामपंचायत सदस्या",
        name: "सौ. सविता म्हसू बोऱ्हाडे",
        phone: "९७६७४८७२२४",
        ward: "वार्ड क्र. २",
      },
      {
        role: "ग्रामपंचायत सदस्या",
        name: "सौ. लक्ष्मीबाई आनंदगीर गोसावी",
        phone: "९७६४९८६७९४",
        ward: "वार्ड क्र. ३",
      },
      {
        role: "ग्रामपंचायत सदस्या",
        name: "सौ. उज्ज्वला प्रकाश भोर",
        phone: "९८५०३३०३०५",
        ward: "वार्ड क्र. ४",
      },
      {
        role: "ग्रामपंचायत सदस्य",
        name: "श्री. लहानू संतू घुले",
        phone: "९८५०५००२७२",
        ward: "वार्ड क्र. ५",
      },
      {
        role: "ग्रामपंचायत सदस्य",
        name: "श्री. गोरख गणपत अढांगळे",
        phone: "९७६३७३२२१३",
        ward: "वार्ड क्र. ६",
      },
      {
        role: "ग्रामपंचायत सदस्य",
        name: "श्री. नंदकुमार बहिरू घुले",
        phone: "९६५७११६४७१",
        ward: "वार्ड क्र. ७",
      },
      {
        role: "ग्रामविकास अधिकारी (ग्रामसेवक / VDO)",
        name: "श्री. राहुल लता मधुकर सदगीर",
        phone: "९९६०३९३९२४",
        email: "gpkomalwadi@gmail.com",
        isOfficer: true,
      },
      {
        role: "ग्रामपंचायत शिपाई",
        name: "श्री. ज्ञानेश्वर त्र्यंबक शिंदे",
        phone: "९९६०३९३९२४",
        isStaff: true,
      },
      {
        role: "पाणीपुरवठा कर्मचारी",
        name: "श्री. योगेश संजय सैद",
        phone: "९९६०३९३९२४",
        isStaff: true,
      },
    ],
    visionPoints: [
      "ग्रामविकास – रस्ते, पाणीपुरवठा, स्वच्छता, वीज, आरोग्य व शिक्षणाच्या मूलभूत सोयीसुविधा उपलब्ध करणे.",
      "लोकसहभाग – गावकऱ्यांचा थेट सहभाग घेऊन पारदर्शक विकासात्मक निर्णय घेणे.",
      "स्वावलंबन व आर्थिक विकास – गावातील साधनसंपत्तीचा योग्य उपयोग करून स्वावलंबन साधणे.",
      "पर्यावरण संवर्धन व स्वच्छता – सांडपाणी, घनकचरा व्यवस्थापन व हरित ग्राम अभियान राबवणे.",
      "स्मार्ट व डिजिटल गाव – ई-गव्हर्नन्स, ऑनलाइन दाखले व पारदर्शक कारभार निर्माण करणे.",
    ],
    initiatives: [
      {
        title: "समृद्ध पंचायत राज अभियानांतर्गत विशेष ग्रामसभा व प्रभात फेरी",
        date: "१७ सप्टेंबर २०२५",
        category: "समारंभ",
        description:
          "ग्रामपंचायत कोमलवाडीतर्फे समृद्ध पंचायत राज अभियान अंतर्गत ग्रामसभा व महिला व शाळकरी मुलांच्या उत्स्फूर्त सहभागाने प्रभात फेरी संपन्न.",
      },
      {
        title: "घरगुती कचरा व्यवस्थापनासाठी ओला व सुका कचरा कुंड्यांचे वाटप",
        date: "१७ सप्टेंबर २०२५",
        category: "नाविन्यपूर्ण उपक्रम",
        description:
          "गावात स्वच्छता अभियानाला चालना देण्यासाठी मिळकत व नळजोडणी धारकांना घरगुती ओला व सुका कचरा कुंड्यांचे वाटप करण्यात आले.",
      },
      {
        title: "जलजीवन मिशन अंतर्गत हर घर नल से जल योजना व मुख्य जलकुंभ स्वच्छता",
        date: "१२ ऑक्टोबर २०२६",
        category: "पाणीपुरवठा",
        description:
          "गावातील प्रत्येक कुटुंबाला शुद्ध पिण्याच्या पाण्यासाठी अंतर्गत पाईपलाईन व जलकुंभ नूतनीकरणाचे काम ९५% पूर्ण.",
      },
    ],
  },
  gulwanch: {
    stats: {
      population: "३,२४०+",
      households: "६८०",
      literacyRate: "७८.५%",
      area: "१२.४ चौ.कि.मी.",
      schools: "०४ केंद्रे",
      distanceFromTaluka: "१४ कि.मी. (सिन्नर)",
      distanceFromDistrict: "३६ कि.मी. (नाशिक)",
    },
    representatives: [
      { role: "सरपंच", name: "मा. सरपंच साहेब", phone: "+91 2551 245120", isSarpanch: true },
      { role: "उपसरपंच", name: "मा. उपसरपंच", isUpasarpanch: true },
      { role: "ग्रामपंचायत सदस्य", name: "मा. सदस्य", ward: "वार्ड क्र. १" },
      { role: "ग्रामपंचायत सदस्य", name: "मा. सदस्य", ward: "वार्ड क्र. २" },
      { role: "ग्रामपंचायत सदस्य", name: "मा. सदस्य", ward: "वार्ड क्र. ३" },
      { role: "ग्रामविकास अधिकारी", name: "मा. ग्रामसेवक / VDO", phone: "+91 2551 245120", isOfficer: true },
    ],
    visionPoints: [
      "पारदर्शक लोकशाही कारभार व ऑनलाइन ई-सेवा कक्ष.",
      "शाश्वत शेती विकास व जलयुक्त शिवार अभियान.",
      "दर्जेदार प्राथमिक शिक्षण व डिजिटल स्मार्ट शाळा.",
    ],
    initiatives: [
      {
        title: "गुळवंच मध्ये भव्य मोफत आरोग्य तपासणी व नेत्रचिकित्सा शिबिर",
        date: "१२ ऑक्टोबर २०२६",
        category: "आरोग्य शिबिर",
        description: "जिल्हा सामान्य रुग्णालय नाशिक व ग्रामपंचायत गुळवंच यांच्या संयुक्त विद्यमाने ३५०+ ग्रामस्थांची तपासणी.",
      },
      {
        title: "गावातील मुख्य रस्त्याचे काँक्रिटीकरण व २५ नवीन सौर पथदिवे लोकार्पण",
        date: "०५ ऑक्टोबर २०२६",
        category: "विकास कार्य",
        description: "ग्रामविकास निधी अंतर्गत अंतर्गत रस्त्यांचे काम पूर्ण होऊन रात्रीच्या सुरक्षिततेसाठी सौर दिवे कार्यान्वित.",
      },
      {
        title: "आगामी छत्रपती शिवाजी महाराज जयंती उत्सव व व्याख्यानमाला नियोजन",
        date: "२८ सप्टेंबर २०२६",
        category: "सांस्कृतिक",
        description: "गावातील युवक मंडळे आणि ग्रामपंचायतीच्या संयुक्त विद्यमाने भव्य सांस्कृतिक व्याख्यानमाला.",
      },
    ],
  },
  mazagaon: {
    stats: {
      population: "२,८५०+",
      households: "५४०",
      literacyRate: "८०.२%",
      area: "१०.२ चौ.कि.मी.",
      schools: "०३ केंद्रे",
      distanceFromTaluka: "१६ कि.मी. (सिन्नर)",
      distanceFromDistrict: "३८ कि.मी. (नाशिक)",
    },
    representatives: [
      { role: "सरपंच", name: "मा. सरपंच साहेब", phone: "+91 2551 245210", isSarpanch: true },
      { role: "उपसरपंच", name: "मा. उपसरपंच", isUpasarpanch: true },
      { role: "ग्रामपंचायत सदस्य", name: "मा. सदस्य", ward: "वार्ड क्र. १" },
      { role: "ग्रामपंचायत सदस्य", name: "मा. सदस्य", ward: "वार्ड क्र. २" },
      { role: "ग्रामपंचायत सदस्य", name: "मा. सदस्य", ward: "वार्ड क्र. ३" },
      { role: "ग्रामविकास अधिकारी", name: "मा. ग्रामसेवक / VDO", phone: "+91 2551 245210", isOfficer: true },
    ],
    visionPoints: [
      "माझगाव ग्रामविकासाची आधुनिक लोकशाही प्रणाली व पारदर्शक डिजिटल सेवा केंद्र.",
      "शेतकरी समृद्धी, जलसंधारण आणि सौर ऊर्जा प्रकल्प.",
    ],
    initiatives: [
      {
        title: "माझगाव मध्ये कृषी यांत्रिकीकरण कार्यशाळा व मार्गदर्शन शिबिर",
        date: "१० ऑक्टोबर २०२६",
        category: "कृषी कार्यशाळा",
        description: "शेतकऱ्यांना आधुनिक ठिबक सिंचन व सौर कृषी पंपाबाबत तज्ज्ञांचे मार्गदर्शन.",
      },
      {
        title: "प्राथमिक आरोग्य उपकेंद्रात मोफत लसीकरण व महिला तपासणी",
        date: "०२ ऑक्टोबर २०२६",
        category: "आरोग्य मोहीम",
        description: "बालके व गरोदर मातांसाठी नियमित आरोग्य तपासणी मोहीम यशस्वीपणे संपन्न.",
      },
      {
        title: "गावात वृक्षारोपण मोहीम व जलसंधारण बंधारे दुरुस्ती",
        date: "२५ सप्टेंबर २०२६",
        category: "पर्यावरण",
        description: "लोकसहभागातून ५०० वृक्षांचे रोपण व जलयुक्त शिवार बंधारे स्वच्छता.",
      },
    ],
  },
};

export function getVillageDetailsData(villageSlug: string) {
  const slug = villageSlug.toLowerCase();
  return VILLAGE_DETAILS[slug] || VILLAGE_DETAILS.komalwadi;
}

export async function getVillageRepresentatives(villageSlug: string) {
  const slug = villageSlug.toLowerCase();
  try {
    const conn = await connectDB();
    if (conn) {
      const reps = await Representative.find({
        villageSlug: slug,
        isActive: true,
      })
        .sort({ order: 1, createdAt: 1 })
        .lean();

      if (reps && reps.length > 0) {
        return reps.map((r: any) => ({
          role: r.role,
          name: r.name,
          phone: r.phone || "",
          email: r.email || "",
          ward: r.ward || "",
          photoUrl: r.photoUrl || "",
          isSarpanch: Boolean(r.isSarpanch || r.role === "सरपंच"),
          isUpasarpanch: Boolean(r.isUpasarpanch || r.role === "उपसरपंच"),
          isOfficer: Boolean(
            r.role.includes("ग्रामसेवक") || r.role.includes("ग्रामविकास अधिकारी")
          ),
          term: r.term || "२०२२ - २०२७",
        }));
      }
    }
  } catch (err) {
    console.warn(`[getVillageRepresentatives] Fallback for ${slug}:`, err);
  }

  const details = getVillageDetailsData(slug);
  return details?.representatives || [];
}

export async function getServiceAndForm(villageId: any, serviceSlug: string) {
  let service: any = null;
  let schema: FormSchemaDefinition | null = null;

  try {
    const conn = await connectDB();
    if (conn && villageId) {
      service = await Service.findOne({ villageId, slug: serviceSlug }).lean();
      if (service) {
        const form = await Form.findOne({ serviceId: service._id, isActive: true })
          .sort({ version: -1 })
          .lean();
        if (form && form.schema) {
          schema = form.schema as FormSchemaDefinition;
        }
      }
    }
  } catch (err) {
    console.warn(`[Fallback] DB query failed for service ${serviceSlug}.`);
  }

  if (!service) {
    service = FALLBACK_SERVICES.find((s) => s.slug === serviceSlug) || null;
  }

  if (!schema && service) {
    schema = FALLBACK_SCHEMAS[serviceSlug] || {
      fields: [
        { name: "applicantName", label: "अर्जदाराचे नाव", type: "text", required: true },
        { name: "aadhaarNo", label: "आधार क्रमांक", type: "text", required: true },
        { name: "mobileNo", label: "मोबाईल नंबर", type: "text", required: true },
        { name: "details", label: "तपशील", type: "textarea", required: true },
      ],
    };
  }

  return { service, schema };
}
