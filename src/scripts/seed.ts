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
import { Representative } from "../models/Representative";
import { ALL_CITIZEN_SERVICES, ALL_CITIZEN_SCHEMAS } from "../data/citizen-services";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/gram_panchayat_db";

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Delete all villages other than Komalwadi
  console.log("Cleaning up non-Komalwadi villages from database...");
  const otherVillages = await Village.find({ slug: { $ne: "komalwadi" } });
  const otherVillageIds = otherVillages.map((v) => v._id);

  if (otherVillageIds.length > 0) {
    await Service.deleteMany({ villageId: { $in: otherVillageIds } });
    await Form.deleteMany({ villageId: { $in: otherVillageIds } });
    await Notice.deleteMany({ villageId: { $in: otherVillageIds } });
    await Scheme.deleteMany({ villageId: { $in: otherVillageIds } });
    await Project.deleteMany({ villageId: { $in: otherVillageIds } });
    await Representative.deleteMany({ villageId: { $in: otherVillageIds } });
    await Village.deleteMany({ _id: { $in: otherVillageIds } });
    console.log(`Removed ${otherVillages.length} other villages and associated records.`);
  }

  // Password hash for admin
  const hashedPassword = await bcrypt.hash("Admin@12345", 10);

  // ==================== VILLAGE: KOMALWADI (कोमलवाडी) ====================
  const komalwadiConfig = {
    name: "कोमलवाडी",
    slug: "komalwadi",
    taluka: "सिन्नर",
    district: "नाशिक",
    state: "महाराष्ट्र",
    description: "ग्रामपंचायत कोमलवाडी ही संविधानाने प्रदत्त स्थानिक स्वराज्य संस्थेच्या चौकटीत कार्यरत असून ग्रामविकास, जनकल्याण व पारदर्शक प्रशासन या तत्त्वांवर आधारित आहे. 'डिजिटल इंडिया, डिजिटल ग्राम' हेच आमचे स्वप्न आणि ध्येय आहे.",
    phone: "९८२३९७८४९२",
    email: "gpkomalwadi@gmail.com",
    address: "मु. कोमलवाडी, पो. वडांगळी, ता. सिन्नर, जि. नाशिक, महाराष्ट्र - ४२२१०३",
    coverImage: "/images/panoramic-landscape.webp",
    galleryImages: [
      {
        url: "/images/gallery/village-karyalay.webp",
        caption: "कोमलवाडी ग्रामपंचायत कार्यालय व नागरी सेवा केंद्र",
        category: "प्रशासकीय वास्तू",
      },
      {
        url: "/images/gallery/smart-village-street.webp",
        caption: "डिजिटल कोमलवाडी - मुख्य रस्ते व सौर ऊर्जा व्यवस्था",
        category: "पायाभूत सुविधा",
      },
      {
        url: "/images/gallery/village-lake-nature.webp",
        caption: "पाणीपुरवठा विहीर, शेततळे व समृद्ध शेती शिवार",
        category: "निसर्ग व शेती",
      },
      {
        url: "/images/gallery/village-panoramic.webp",
        caption: "कोमलवाडी गाव व निसर्गरम्य परिसर",
        category: "विहंगम देखावा",
      },
      {
        url: "/images/gallery/village-heritage.webp",
        caption: "पारंपरिक लोकजीवन व ग्रामसंस्कृती",
        category: "ऐतिहासिक वारसा",
      },
    ],
    primaryColor: "#003625",
    secondaryColor: "#9e4300",
  };

  const komalwadiNotices = [
    {
      title: "समृद्ध पंचायत राज अभियानांतर्गत विशेष ग्रामसभा व प्रभात फेरी",
      content: "ग्रामपंचायत कोमलवाडीची विशेष ग्रामसभा पुढील सोमवारी सकाळी ११ वाजता ग्रामपंचायत कार्यालयात आयोजित केली आहे. समृद्ध पंचायत राज अभियान, पाणीपुरवठा व विकासकामांवर चर्चा होईल. सर्व ग्रामस्थांनी वेळेवर उपस्थित राहावे.",
      category: "ग्रामसभा सूचना",
      isImportant: true,
    },
    {
      title: "जलजीवन मिशन अंतर्गत नळ जोडणी व जलकुंभ स्वच्छता",
      content: "गावातील मुख्य जलकुंभाच्या स्वच्छतेचे काम हाती घेण्यात आले आहे. प्रत्येक घराला शुद्ध पाणीपुरवठा करण्यासाठी अंतर्गत नळ जोडणी तपासणी सुरू आहे.",
      category: "पाणीपुरवठा",
      isImportant: false,
    },
    {
      title: "घरगुती ओला व सुका कचरा व्यवस्थापन मोहीम",
      content: "गावात स्वच्छता अभियानाला गती देण्यासाठी मिळकत व नळजोडणी धारकांना घरगुती ओला व सुका कचरा कुंड्यांचे वाटप व वर्गीकरण करण्याचे आवाहन ग्रामपंचायतीमार्फत करण्यात येत आहे.",
      category: "स्वच्छता मोहीम",
      isImportant: false,
    },
    {
      title: "घरपट्टी व पाणीपट्टी कर भरणा सवलत सूचना",
      content: "चालू आर्थिक वर्षातील घरपट्टी व पाणीपट्टी वेळेवर भरून गावाच्या सर्वांगीण विकासात सहकार्य करावे. कर भरणाऱ्या नागरिकांना विहित सवलत दिली जाईल.",
      category: "कर भरणा",
      isImportant: false,
    },
  ];

  const komalwadiSchemes = [
    {
      slug: "pmay-rural-gharkul",
      title: "प्रधानमंत्री आवास योजना (ग्रामीण - PMAY-G)",
      category: "घरकुल व निवारा",
      imageUrl: "/images/schemes/pmay-gharkul.webp",
      description: "ग्रामीण भागातील बेघर व कच्च्या घरात राहणाऱ्या कुटुंबांना पक्के घर बांधणीसाठी ₹ १.२० लाख थेट अनुदान + मनरेगा ९० दिवसांची मजुरी व स्वच्छ भारत शौचालय अनुदान.",
      subsidyDetails: "₹ १.२० लाख थेट बँक खात्यात + ₹ २३,८५० मनरेगा मजुरी + ₹ १२,००० शौचालय अनुदान (एकूण ₹ १.५५ लाख)",
      targetAudience: "ग्रामीण भागातील बेघर, कच्च्या मातीच्या/कुडाच्या घरात राहणारे व आर्थिकदृष्ट्या दुर्बल घटक (BPL/SECC/Awaas+)",
      eligibility: "कुटुंबाकडे संपूर्ण भारतात कुठेही स्वतःचे पक्के घर नसावे. आवास प्लस (Awaas+) किंवा SECC 2011 च्या प्रतीक्षा यादीत नाव समाविष्ट असणे आवश्यक.",
      documentsRequired: "आधार कार्ड (सर्व सदस्यांचे), मनरेगा जॉब कार्ड, ग्रामपंचायत नमुना ८ उतारा / जागेचा मालकी पुरावा, आधार लिंक राष्ट्रीयीकृत बँक पासबुक.",
      applicationProcess: "ग्रामपंचायत कार्यालयात ग्रामसेवक किंवा आपले सरकार केंद्राकडे विहित नमुन्यात अर्ज सादर करावा.",
      isActive: true,
    },
    {
      slug: "magel-tyala-solar-pump-shettale",
      title: "मागेल त्याला सौर कृषी पंप व शेततळे योजना (PM Kusum & Shettale)",
      category: "कृषी व जलसंधारण",
      imageUrl: "/images/schemes/solar-pump-shettale.webp",
      description: "शेतकऱ्यांना शाश्वत सिंचनासाठी सौर कृषी पंप बसविण्यासाठी ९०% ते ९५% शासकीय अनुदान तसेच शेततळे खोदण्यासाठी थेट आर्थिक मदत.",
      subsidyDetails: "सौर पंपासाठी ९०% ते ९५% शासकीय अनुदान + शेततळे अस्तरीकरणासाठी ₹ ७५,०००",
      targetAudience: "अल्प व अत्यल्प भूधारक शेतकरी",
      eligibility: "किमान ०.४० हेक्टर शेतजमीन असलेले शेतकरी. विहीर किंवा बारमाही जलस्रोत उपलब्ध असणे आवश्यक.",
      documentsRequired: "डिजिटल ७/१२ व ८-अ उतारा, आधार कार्ड, बँक पासबुक.",
      applicationProcess: "महावितरण कुसुम पोर्टल किंवा महाडीबीटीवर अर्ज करावा.",
      isActive: true,
    },
    {
      slug: "pm-kisan-namo-shetkari-sanman",
      title: "पीएम किसान व नमो शेतकरी महासन्मान निधी योजना",
      category: "शेतकरी कल्याण",
      imageUrl: "/images/schemes/pm-kisan-farmer.webp",
      description: "शेतकऱ्यांसाठी पीक निविष्ठा खर्च भागवण्यासाठी केंद्र व राज्य शासनातर्फे एकत्रित वार्षिक ₹ १२,००० थेट बँक खात्यात सन्मान निधी.",
      subsidyDetails: "वार्षिक ₹ १२,००० थेट बँक खात्यात (दर चार महिन्यांनी ₹ ४,००० चे ३ समान हप्ते)",
      targetAudience: "महाराष्ट्रातील सर्व जमीनधारक शेतकरी कुटुंब",
      eligibility: "स्वतःच्या नावावर शेतजमीन असणारे शेतकरी ज्यांची ई-केवायसी व आधार संलग्नता पूर्ण आहे.",
      documentsRequired: "आधार कार्ड, ७/१२ व ८-अ उतारा, बँक खाते पासबुक.",
      applicationProcess: "पीएम किसान पोर्टल किंवा आपले सरकार केंद्रावर ई-केवायसी करावी.",
      isActive: true,
    },
  ];

  const komalwadiProjects = [
    {
      title: "जल जीवन मिशन अंतर्गत हर घर नल से जल योजना व मुख्य जलकुंभ विस्तार",
      category: "पाणी पुरवठा",
      description: "गावातील प्रत्येक कुटुंबाला शुद्ध पिण्याच्या पाण्यासाठी अंतर्गत पाईपलाईन व १ लाख लिटर क्षमतेचा जलकुंभ उभारणी काम अंतिम टप्प्यात.",
      status: "ONGOING",
      budget: 8450000,
      startDate: new Date("2025-01-15"),
      completionDate: new Date("2026-10-31"),
      images: ["/images/gallery/village-lake-nature.webp"],
    },
    {
      title: "जिल्हा परिषद डिजिटल प्राथमिक शाळा व क्रीडांगण नूतनीकरण",
      category: "शिक्षण व क्रीडा",
      description: "गावातील शाळेत आधुनिक डिजिटल स्मार्ट क्लासरूम, रंगरंगोटी व लोकसहभागातून ग्रंथालय व क्रीडांगण उभारणी.",
      status: "COMPLETED",
      budget: 450000,
      startDate: new Date("2024-05-01"),
      completionDate: new Date("2024-11-30"),
      images: ["/images/gallery/smart-village-street.webp"],
    },
    {
      title: "गावठाण मुख्य रस्ते सिमेंट काँक्रीटीकरण व सौर पथदिवे बसविणे",
      category: "पायाभूत सुविधा",
      description: "गावातील अंतर्गत पक्के सिमेंट काँक्रीट रस्ते, भूमिगत गटार व रात्रीच्या सुरक्षिततेसाठी ५० सौर पथदिवे लोकार्पण.",
      status: "COMPLETED",
      budget: 1200000,
      startDate: new Date("2024-10-01"),
      completionDate: new Date("2025-04-30"),
      images: ["/images/gallery/smart-village-street.webp"],
    },
    {
      title: "घनकचरा व्यवस्थापन व सेंद्रिय खत निर्मिती शेड",
      category: "स्वच्छ भारत मिशन",
      description: "ओला व सुका कचरा वर्गीकरण करून गावात सेंद्रिय कंपोस्ट खत तयार करण्यासाठी शेड व यंत्रसामग्री उभारणी.",
      status: "PLANNED",
      budget: 550000,
      startDate: new Date("2026-05-01"),
      completionDate: new Date("2026-12-31"),
      images: [],
    },
  ];

  const komalwadiRepresentatives = [
    {
      role: "सरपंच",
      name: "सौ. अलका साहेबराव भोर",
      phone: "९८२३९७८४९२",
      email: "gpkomalwadi@gmail.com",
      isSarpanch: true,
      order: 1,
    },
    {
      role: "उपसरपंच",
      name: "सौ. अमृता शशिकांत अढांगळे",
      phone: "९६२३५४०९३७",
      email: "gpkomalwadi@gmail.com",
      isUpasarpanch: true,
      order: 2,
    },
    {
      role: "ग्रामविकास अधिकारी (ग्रामसेवक / VDO)",
      name: "श्री. राहुल लता मधुकर सदगीर",
      phone: "९९६०३९३९२४",
      email: "gpkomalwadi@gmail.com",
      order: 3,
    },
    {
      role: "ग्रामपंचायत सदस्या",
      name: "सौ. सरला तानाजी बोंबले",
      phone: "९७६४९८६७९४",
      ward: "वार्ड क्र. १",
      order: 4,
    },
    {
      role: "ग्रामपंचायत सदस्या",
      name: "सौ. सविता म्हसू बोऱ्हाडे",
      phone: "९७६७४८७२२४",
      ward: "वार्ड क्र. २",
      order: 5,
    },
    {
      role: "ग्रामपंचायत सदस्या",
      name: "सौ. लक्ष्मीबाई आनंदगीर गोसावी",
      phone: "९७६४९८६७९४",
      ward: "वार्ड क्र. ३",
      order: 6,
    },
    {
      role: "ग्रामपंचायत सदस्या",
      name: "सौ. उज्ज्वला प्रकाश भोर",
      phone: "९८५०३३०३०५",
      ward: "वार्ड क्र. ४",
      order: 7,
    },
    {
      role: "ग्रामपंचायत सदस्य",
      name: "श्री. लहानू संतू घुले",
      phone: "९८५०५००२७२",
      ward: "वार्ड क्र. ५",
      order: 8,
    },
    {
      role: "ग्रामपंचायत सदस्य",
      name: "श्री. गोरख गणपत अढांगळे",
      phone: "९७६३७३२२१३",
      ward: "वार्ड क्र. ६",
      order: 9,
    },
    {
      role: "ग्रामपंचायत सदस्य",
      name: "श्री. नंदकुमार बहिरू घुले",
      phone: "९६५७११६४७१",
      ward: "वार्ड क्र. ७",
      order: 10,
    },
    {
      role: "ग्रामपंचायत शिपाई",
      name: "श्री. ज्ञानेश्वर त्र्यंबक शिंदे",
      phone: "९९६०३९३९२४",
      order: 11,
    },
    {
      role: "पाणीपुरवठा कर्मचारी",
      name: "श्री. योगेश संजय सैद",
      phone: "९९६०३९३९२४",
      order: 12,
    },
  ];

  console.log(`Seeding village: ${komalwadiConfig.name} (${komalwadiConfig.slug})...`);
  const village = await Village.findOneAndUpdate(
    { slug: komalwadiConfig.slug },
    komalwadiConfig,
    { upsert: true, new: true }
  );

  // Create Single Village Admin (Komalwadi exclusive login)
  await User.findOneAndUpdate(
    { email: "admin@panchayat.gov.in" },
    {
      name: "ग्रामपंचायत प्रशासक (कोमलवाडी)",
      email: "admin@panchayat.gov.in",
      passwordHash: hashedPassword,
      role: "VILLAGE_ADMIN",
      villageId: village._id,
      villageSlug: village.slug,
    },
    { upsert: true, new: true }
  );

  // Seed all 10 services and schemas
  for (const sc of ALL_CITIZEN_SERVICES) {
    const schema = ALL_CITIZEN_SCHEMAS[sc.slug];
    const service = await Service.findOneAndUpdate(
      { villageId: village._id, slug: sc.slug },
      {
        villageId: village._id,
        villageSlug: village.slug,
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
  await Notice.insertMany(
    komalwadiNotices.map((n) => ({
      ...n,
      villageId: village._id,
      villageSlug: village.slug,
      publishedAt: new Date(),
      isActive: true,
    })) as any[]
  );

  // Seed Schemes
  await Scheme.deleteMany({ villageId: village._id });
  await Scheme.insertMany(
    komalwadiSchemes.map((s) => ({
      ...s,
      villageId: village._id,
      villageSlug: village.slug,
      isActive: true,
    })) as any[]
  );

  // Seed Projects
  await Project.deleteMany({ villageId: village._id });
  await Project.insertMany(
    komalwadiProjects.map((p) => ({
      ...p,
      villageId: village._id,
      villageSlug: village.slug,
    })) as any[]
  );

  // Seed Representatives
  await Representative.deleteMany({ villageId: village._id });
  await Representative.insertMany(
    komalwadiRepresentatives.map((r) => ({
      ...r,
      villageId: village._id,
      villageSlug: village.slug,
      isActive: true,
    })) as any[]
  );

  console.log("==================================================");
  console.log("Successfully seeded Komalwadi (/komalwadi) exclusively!");
  console.log("All other villages have been deleted from the database.");
  console.log("Super Admin: admin@panchayat.gov.in / Admin@12345");
  console.log("==================================================");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});