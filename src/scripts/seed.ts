import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Village } from "../models/Village";
import { Service } from "../models/Service";
import { Form } from "../models/Form";
import { Notice } from "../models/Notice";
import { Scheme } from "../models/Scheme";
import { Project } from "../models/Project";
import { ALL_CITIZEN_SERVICES, ALL_CITIZEN_SCHEMAS } from "../data/citizen-services";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/gram_panchayat_db";

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  // 1. Create Super Admin
  const hashedPassword = await bcrypt.hash("Admin@12345", 10);
  const admin = await User.findOneAndUpdate(
    { email: "admin@panchayat.gov.in" },
    {
      name: "केंद्रीय ग्राम व्यवस्थापक",
      email: "admin@panchayat.gov.in",
      passwordHash: hashedPassword,
      role: "SUPER_ADMIN",
    },
    { upsert: true, new: true }
  );

  // Helper to seed a village with ALL forms
  async function seedVillageData(villageConfig: any, notices: any[], schemes: any[], projects: any[]) {
    console.log(`Seeding village: ${villageConfig.name} (${villageConfig.slug})...`);
    
    const village = await Village.findOneAndUpdate(
      { slug: villageConfig.slug },
      villageConfig,
      { upsert: true, new: true }
    );

    // Link admin
    await User.findByIdAndUpdate(admin._id, {
      $addToSet: { assignedVillages: village._id },
    });

    // Seed all services and schemas from @/data/citizen-services
    for (const sc of ALL_CITIZEN_SERVICES) {
      const schema = ALL_CITIZEN_SCHEMAS[sc.slug];
      const service = await Service.findOneAndUpdate(
        { villageId: village._id, slug: sc.slug },
        {
          villageId: village._id,
          name: sc.name,
          slug: sc.slug,
          description: sc.description,
          category: sc.category,
          icon: sc.icon,
          isActive: true,
        },
        { upsert: true, new: true }
      );

      await Form.findOneAndUpdate(
        { serviceId: service._id, version: 1 },
        {
          serviceId: service._id,
          villageId: village._id,
          version: 1,
          schema: schema,
          isActive: true,
        },
        { upsert: true, new: true }
      );
    }

    // Seed Notices
    await Notice.deleteMany({ villageId: village._id });
    await Notice.create(
      notices.map((n) => ({
        ...n,
        villageId: village._id,
        publishedAt: new Date(),
        isActive: true,
      }))
    );

    // Seed Schemes
    await Scheme.deleteMany({ villageId: village._id });
    await Scheme.create(
      schemes.map((s) => ({
        ...s,
        villageId: village._id,
        isActive: true,
      }))
    );

    // Seed Projects
    await Project.deleteMany({ villageId: village._id });
    await Project.create(
      projects.map((p) => ({
        ...p,
        villageId: village._id,
      }))
    );

    console.log(`Seeded ${villageConfig.name} with all 10 forms successfully.`);
    return village;
  }

  // ==================== VILLAGE 1: GULWANCH (गुळवंच) ====================
  const gulwanchConfig = {
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
    primaryColor: "#047857",
    secondaryColor: "#d97706",
  };

  const gulwanchNotices = [
    {
      title: "विशेष ग्रामसभा बैठक आयोजन सूचना",
      content: "गुळवंच ग्रामपंचायतीची विशेष ग्रामसभा पुढील सोमवारी सकाळी ११ वाजता ग्रामपंचायत कार्यालयात आयोजित केली आहे. विकासकामांचा आढावा, पाणी पुरवठा नियोजन व विविध योजनांवर चर्चा होईल.",
    },
    {
      title: "पिण्याच्या पाण्याच्या टाकीची स्वच्छता व पुरवठा नियोजन",
      content: "गावातील मुख्य जलकुंभाच्या स्वच्छतेचे काम हाती घेण्यात आले आहे. त्यामुळे उद्या सकाळी पाणी पुरवठा बंद राहील, संध्याकाळी नेहमीप्रमाणे पुरवठा सुरळीत होईल.",
    },
    {
      title: "मुख्यमंत्री समृद्ध पंचायतराज अभियान आढावा",
      content: "गुळवंच ग्रामपंचायतीची मुख्यमंत्री समृद्ध पंचायतराज अभियानांतर्गत तपासणी होणार असून गावातील स्वच्छता मोहिमेत सर्वांनी सक्रिय सहभाग नोंदवावा.",
    },
    {
      title: "मोफत आरोग्य तपासणी व नेत्र तपासणी शिबिर",
      content: "प्राथमिक आरोग्य उपकेंद्र गुळवंच येथे रविवार रोजी सकाळी ९ ते दुपारी ३ या वेळेत सर्व ग्रामस्थांसाठी मोफत तपासणी शिबिर आयोजित केले आहे.",
    },
  ];

  const gulwanchSchemes = [
    {
      title: "महात्मा जोतीराव फुले शेतकरी कर्जमुक्ती योजना",
      category: "शेतकरी",
      description: "शेतकऱ्यांसाठी पीक कर्जमुक्ती व प्रोत्साहनपर आर्थिक सहाय्य योजना.",
      eligibility: "अल्प व अत्यल्प भूधारक शेतकरी ज्यांचे पीक कर्ज थकीत किंवा नियमित परतफेड झाले आहे.",
      documentsRequired: "आधार कार्ड, ७/१२ व ८-अ उतारा, बँक पासबुक, पीक कर्ज खाते तपशील.",
      applicationProcess: "ग्रामपंचायतमधील संगणक परिचालक (आपले सरकार सेवा केंद्र) यांच्याकडे ऑनलाइन नोंदणी करा.",
    },
    {
      title: "पंतप्रधान आवास योजना (ग्रामीण - PMAY)",
      category: "घरकुल",
      description: "ग्रामीण भागातील बेघर व कच्च्या घरात राहणाऱ्या कुटुंबांसाठी पक्के घर बांधणीसाठी १.२० लाख रुपये थेट बँक खात्यात अनुदान.",
      eligibility: "दारिद्र्य रेषेखालील कुटुंब, स्वतःचे पक्के घर नसलेले लाभार्थी.",
      documentsRequired: "आधार कार्ड, जॉब कार्ड, जागेचा नमुना ८ दाखला, राष्ट्रीयीकृत बँक पासबुक.",
      applicationProcess: "ग्रामपंचायत कार्यालयात विहित नमुन्यातील अर्जासोबत कागदपत्रे जोडून सादर करा.",
    },
    {
      title: "मागेल त्याला शेततळे योजना",
      category: "कृषी व जलसंधारण",
      description: "शेतकऱ्यांना दुष्काळात शाश्वत पाणी उपलब्ध व्हावे यासाठी शेततळे खोदण्यासाठी थेट शासकीय अनुदान.",
      eligibility: "किमान ०.६० हेक्टर जमीनधारक शेतकरी.",
      documentsRequired: "७/१२, ८-अ उतारा, आधार कार्ड, बँक खाते तपशील.",
      applicationProcess: "महाडीबीटी (MahaDBT) पोर्टलवर ऑनलाइन अर्ज करून पोचपावती ग्रामपंचायतीत सादर करा.",
    },
    {
      title: "संजय गांधी निराधार अनुदान योजना",
      category: "सामाजिक सुरक्षा",
      description: "निराधार, वृद्ध, दिव्यांग आणि विधवा महिलांसाठी दरमहा आर्थिक पेन्शन योजना.",
      eligibility: "वार्षिक उत्पन्न २१,००० रु. पेक्षा कमी असणारे निराधार व्यक्ती.",
      documentsRequired: "तहसीलदार उत्पन्न दाखला, रहिवासी दाखला, वयाचा पुरावा, बँक पासबुक.",
      applicationProcess: "सेतू केंद्र किंवा ग्रामपंचायतीमार्फत तहसील कार्यालयात अर्ज सादर करणे.",
    },
  ];

  const gulwanchProjects = [
    {
      title: "जिल्हा परिषद प्राथमिक शाळा डिजिटल वर्गखोली नूतनीकरण",
      category: "शिक्षण व पायाभूत सुविधा",
      description: "गावातील जिल्हा परिषद शाळेत आधुनिक डिजिटल स्मार्ट बोर्ड, रंगरंगोटी व लोकसहभागातून ग्रंथालय उभारणी.",
      status: "COMPLETED",
      budget: 350000,
      startDate: new Date("2025-04-01"),
      completionDate: new Date("2025-08-15"),
      images: [],
    },
    {
      title: "वॉर्ड क्र. २ व ३ मध्ये काँक्रीट रस्ता व बंदिस्त गटार बांधकाम",
      category: "स्वच्छता व रस्ते विकास",
      description: "गावठाण अंतर्गत मुख्य रस्त्याचे सिमेंट काँक्रीटीकरण आणि सांडपाणी निचऱ्यासाठी भूमिगत पाईपलाईन गटार.",
      status: "ONGOING",
      budget: 850000,
      startDate: new Date("2025-11-01"),
      completionDate: new Date("2026-03-30"),
      images: [],
    },
    {
      title: "सौर ऊर्जा पथदिवे (Solar Street Lights) बसविणे",
      category: "ऊर्जा व ग्रामविकास",
      description: "गावातील सर्व प्रमुख चौक आणि स्मशानभूमी परिसरात ५० सौर पथदिवे बसवून प्रकाश व्यवस्था करणे.",
      status: "COMPLETED",
      budget: 420000,
      startDate: new Date("2025-06-01"),
      completionDate: new Date("2025-09-30"),
      images: [],
    },
    {
      title: "जल जीवन मिशन अंतर्गत नवीन जलकुंभ व नळ पाईपलाईन विस्तार",
      category: "पाणी पुरवठा",
      description: "प्रत्येक घराला शुद्ध पिण्याचे पाणी मिळावे म्हणून १ लाख लिटर क्षमतेचा जलकुंभ व उपनगरात पाईपलाईन जोडणी.",
      status: "PLANNED",
      budget: 1500000,
      startDate: new Date("2026-04-01"),
      completionDate: new Date("2026-12-31"),
      images: [],
    },
  ];

  await seedVillageData(gulwanchConfig, gulwanchNotices, gulwanchSchemes, gulwanchProjects);

  // ==================== VILLAGE 2: MAZAGAON (माझगाव) ====================
  const mazagaonConfig = {
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
    primaryColor: "#1e3a8a",
    secondaryColor: "#0284c7",
  };

  const mazagaonNotices = [
    {
      title: "मासिक ग्रामपंचायत सभा सूचना",
      content: "माझगाव ग्रामपंचायतीची मासिक सभा पुढील शुक्रवारी दुपारी २ वाजता आयोजित केली आहे. ग्रामस्थांनी आपल्या समस्या व सूचना मांडाव्यात.",
    },
    {
      title: "घरपट्टी व पाणीपट्टी कर भरणा सवलत मोहीम",
      content: "चालू आर्थिक वर्षातील घरपट्टी व पाणीपट्टी ३१ मार्च पूर्वी भरणाऱ्या करदात्यांना ५% सवलत देण्यात येत आहे. ग्रामपंचायत कार्यालयात कर जमा करावा.",
    },
    {
      title: "कृषी अवजारे व खत वाटप योजना नोंदणी",
      content: "पंचायत समिती सिन्नर अंतर्गत अनुदानावर शेती अवजारे मिळवण्यासाठी पात्र शेतकऱ्यांनी ग्रामपंचायतीत नावनोंदणी करावी.",
    },
  ];

  const mazagaonSchemes = [
    {
      title: "पंतप्रधान कृषी सन्मान निधी योजना (PM Kisan)",
      category: "शेतकरी",
      description: "शेतकऱ्यांच्या बँक खात्यात दरवर्षी ६,००० रुपये थेट आर्थिक सहाय्य तीन समान हप्त्यांमध्ये.",
      eligibility: "स्वतःच्या नावावर शेती असणारे सर्व भूधारक शेतकरी (e-KYC पूर्ण असणे आवश्यक).",
      documentsRequired: "आधार कार्ड, ७/१२ उतारा, बँक पासबुक, मोबाईल क्रमांक.",
      applicationProcess: "आपले सरकार केंद्रावर बायोमेट्रिक e-KYC करून नोंदणी करावी.",
    },
    {
      title: "मुख्यमंत्री माझी लाडकी बहीण योजना",
      category: "महिला कल्याण",
      description: "२१ ते ६५ वयोगटातील पात्र महिलांना दरमहा १,५०० रुपये थेट बँक खात्यात आर्थिक सहाय्य.",
      eligibility: "महाराष्ट्रातील रहिवासी, कौटुंबिक वार्षिक उत्पन्न २.५ लाख रुपयांपेक्षा कमी असलेल्या महिला.",
      documentsRequired: "आधार कार्ड, अधिवास / रहिवासी दाखला, उत्पन्न दाखला / पिवळे-केशरी रेशन कार्ड, बँक पासबुक.",
      applicationProcess: "नारीशक्ती दूत ॲप किंवा ग्रामपंचायत मदत कक्षातून अर्ज भरा.",
    },
    {
      title: "शबरी आदिवासी घरकुल योजना",
      category: "घरकुल",
      description: "अनुसूचित जमाती प्रवर्गातील बेघर व कच्च्या घरात राहणाऱ्या बांधवांसाठी पक्के घरकुल अनुदान.",
      eligibility: "अनुसूचित जमाती (ST) प्रवर्गातील दारिद्र्य रेषेखालील कुटुंब.",
      documentsRequired: "जातीचा दाखला, आधार कार्ड, जागेचा दाखला, रेशन कार्ड.",
      applicationProcess: "ग्रामपंचायतीमार्फत प्रकल्प अधिकारी एकात्मिक आदिवासी विकास प्रकल्पाकडे प्रस्ताव सादर करणे.",
    },
  ];

  const mazagaonProjects = [
    {
      title: "ग्रामपंचायत नवीन प्रशासकीय भवन व सेवा केंद्र बांधकाम",
      category: "प्रशासकीय सुविधा",
      description: "सर्व आधुनिक संगणकीय प्रणालीने सुसज्ज नवीन ग्रामपंचायत कार्यालय व नागरिक प्रतीक्षा कक्ष.",
      status: "COMPLETED",
      budget: 1200000,
      startDate: new Date("2024-10-01"),
      completionDate: new Date("2025-06-30"),
      images: [],
    },
    {
      title: "गावातील अंतर्गत रस्ते खडीकरण व डांबरीकरण",
      category: "रस्ते विकास",
      description: "मुख्य रस्त्यापासून पाड्यांकडे जाणाऱ्या २.५ किमी लांबीच्या रस्त्याचे मजबुतीकरण व डांबरीकरण.",
      status: "ONGOING",
      budget: 950000,
      startDate: new Date("2025-10-15"),
      completionDate: new Date("2026-05-30"),
      images: [],
    },
    {
      title: "घनकचरा व्यवस्थापन व सेंद्रिय खत निर्मिती शेड",
      category: "स्वच्छ भारत मिशन",
      description: "गावातील ओला व सुका कचरा वर्गीकरण करून सेंद्रिय खत तयार करण्यासाठी कम्पोस्ट शेडची उभारणी.",
      status: "PLANNED",
      budget: 450000,
      startDate: new Date("2026-03-01"),
      completionDate: new Date("2026-08-30"),
      images: [],
    },
  ];

  await seedVillageData(mazagaonConfig, mazagaonNotices, mazagaonSchemes, mazagaonProjects);

  console.log("==================================================");
  console.log("Successfully seeded both independent villages with all Aarz forms:");
  console.log("1. Gulwanch (/gulwanch) - 10 Online Application Forms from Marathi screenshots");
  console.log("2. Mazagaon (/mazagaon) - 10 Online Application Forms from Marathi screenshots");
  console.log("Super Admin: admin@panchayat.gov.in / Admin@12345");
  console.log("==================================================");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});