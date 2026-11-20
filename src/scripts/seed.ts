import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { pool, queryOne, dbQuery } from "../lib/db";
import { ALL_CITIZEN_SERVICES, ALL_CITIZEN_SCHEMAS } from "../data/citizen-services";

dotenv.config({ path: ".env.local" });

async function seedPg() {
  console.log("Connecting to PostgreSQL database: gram_panchayat_db...");

  // Verify connection
  const check = await pool.query("SELECT current_database(), current_user, now();");
  console.log("Connected to PostgreSQL successfully:", check.rows[0]);

  // Clean old data for fresh seed
  console.log("Cleaning existing records for fresh seed...");
  await dbQuery("DELETE FROM applications");
  await dbQuery("DELETE FROM notices");
  await dbQuery("DELETE FROM projects");
  await dbQuery("DELETE FROM schemes");
  await dbQuery("DELETE FROM representatives");
  await dbQuery("DELETE FROM forms");
  await dbQuery("DELETE FROM services");
  await dbQuery("DELETE FROM users");
  await dbQuery("DELETE FROM villages");

  const hashedPassword = await bcrypt.hash("Komalwadi@Admin2026", 10);
  const fallbackHashedPassword = await bcrypt.hash("Admin@12345", 10);

  // 1. SEED VILLAGE: KOMALWADI
  const komalwadi = {
    name: "कोमलवाडी",
    slug: "komalwadi",
    taluka: "सिन्नर",
    district: "नाशिक",
    state: "महाराष्ट्र",
    description:
      "ग्रामपंचायत कोमलवाडी ही संविधानाने प्रदत्त स्थानिक स्वराज्य संस्थेच्या चौकटीत कार्यरत असून ग्रामविकास, जनकल्याण व पारदर्शक प्रशासन या तत्त्वांवर आधारित आहे. 'डिजिटल इंडिया, डिजिटल ग्राम' हेच आमचे स्वप्न आणि ध्येय आहे.",
    phone: "९८२३९७८४९२",
    email: "gpkomalwadi@gmail.com",
    address: "मु. कोमलवाडी, पो. वडांगळी, ता. सिन्नर, जि. नाशिक, महाराष्ट्र - ४२२१०३",
    cover_image: "/images/panoramic-landscape.webp",
    gallery_images: JSON.stringify([
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
    ]),
    primary_color: "#003625",
    secondary_color: "#9e4300",
    population: "१,५९८",
    male_population: "८०७",
    female_population: "७९१",
    households: "२९५",
    area: "५००० चौ.कि.मी.",
    wards: "७",
    literacy_rate: "७२.३%",
    female_literacy: "३३.२%",
    schools: "०४ केंद्रे",
    distance_from_taluka: "१८ कि.मी. (सिन्नर)",
    distance_from_district: "४२ कि.मी. (नाशिक)",
    sarpanch_message:
      "गावातील शेवटच्या घटकापर्यंत शासकीय योजना पोहोचवणे आणि आधुनिक लोकसहभागातून समृद्ध, डिजिटल कोमलवाडी घडवणे हेच आमचे ध्येय आहे.",
    speciality: "डिजिटल आदर्श स्मार्ट ग्राम",
    highlight_notice: "",
    pride_highlights: JSON.stringify([
      {
        title: "तंटामुक्त गाव पुरस्कार प्राप्त",
        description:
          "ग्रामस्थांच्या परस्पर सामंजस्याने, एकोप्याने व शांतताप्रिय सहकार्याने शासनाचा मानाचा तंटामुक्त गाव पुरस्कार कोमलवाडीला प्राप्त झाला आहे.",
        year: "२०२३",
      },
      {
        title: "१००% हागणदारीमुक्त व सुंदर गाव अभियान",
        description:
          "गावात १००% वैयक्तिक शौचालये, सांडपाणी व्यवस्थापन व वृक्षारोपणातून संत गाडगेबाबा ग्रामस्वच्छता अभियानांतर्गत सुंदर गाव सन्मान.",
        year: "२०२४",
      },
      {
        title: "स्मार्ट डिजिटल ई-प्रशासन उपक्रम",
        description:
          "गावातील नागरिकांसाठी सर्व दाखले, कर भरणा व शासकीय सेवा ऑनलाइन उपलब्ध करून देणारी नाशिक जिल्ह्यातील आदर्श डिजिटल ग्रामपंचायत.",
        year: "२०२५",
      },
      {
        title: "MPSC राज्यसेवा परीक्षेत ग्रामकन्येचे उत्तुंग यश",
        description:
          "प्रतिकूल परिस्थितीवर मात करत महाराष्ट्र लोकसेवा आयोगाच्या (MPSC) राज्यसेवा परीक्षेत उपजिल्हाधिकारी पदी निवड होऊन गावाचे नाव राज्यात उंचावले आहे.",
        year: "२०२४",
      },
    ]),
    vision_points: JSON.stringify([
      "गावातील प्रत्येक कुटुंबाला २४ तास शुद्ध व मुबलक पिण्याचे पाणी उपलब्ध करणे.",
      "१००% सांडपाणी व घनकचरा व्यवस्थापनातून गाव कचरामुक्त व हरित करणे.",
      "डिजिटल ई-प्रशासनाच्या माध्यमातून सर्व शासकीय दाखले व सेवा घरबसल्या देणे.",
      "महिला बचत गटांना बळकटी व युवकांसाठी कौशल्य विकास प्रशिक्षण देणे.",
    ]),
  };

  const villageRes = await dbQuery(
    `INSERT INTO villages (
      name, slug, district, taluka, state, description, phone, email, address,
      cover_image, gallery_images, primary_color, secondary_color,
      population, male_population, female_population, households, area, wards,
      literacy_rate, female_literacy, schools, distance_from_taluka, distance_from_district,
      sarpanch_message, speciality, highlight_notice, pride_highlights, vision_points
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9,
      $10, $11, $12, $13,
      $14, $15, $16, $17, $18, $19,
      $20, $21, $22, $23, $24,
      $25, $26, $27, $28, $29
    ) RETURNING id, slug, name`,
    [
      komalwadi.name,
      komalwadi.slug,
      komalwadi.district,
      komalwadi.taluka,
      komalwadi.state,
      komalwadi.description,
      komalwadi.phone,
      komalwadi.email,
      komalwadi.address,
      komalwadi.cover_image,
      komalwadi.gallery_images,
      komalwadi.primary_color,
      komalwadi.secondary_color,
      komalwadi.population,
      komalwadi.male_population,
      komalwadi.female_population,
      komalwadi.households,
      komalwadi.area,
      komalwadi.wards,
      komalwadi.literacy_rate,
      komalwadi.female_literacy,
      komalwadi.schools,
      komalwadi.distance_from_taluka,
      komalwadi.distance_from_district,
      komalwadi.sarpanch_message,
      komalwadi.speciality,
      komalwadi.highlight_notice,
      komalwadi.pride_highlights,
      komalwadi.vision_points,
    ]
  );

  const villageId = villageRes.rows[0].id;
  const villageSlug = villageRes.rows[0].slug;
  console.log(`Created Village: ${komalwadi.name} (ID: ${villageId})`);

  // 2. SEED ADMIN USER
  await dbQuery(
    `INSERT INTO users (name, email, password_hash, role, village_id, village_slug)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      "ग्रामपंचायत प्रशासक (कोमलवाडी)",
      "gpkomalwadi@gmail.com",
      hashedPassword,
      "VILLAGE_ADMIN",
      villageId,
      villageSlug,
    ]
  );
  await dbQuery(
    `INSERT INTO users (name, email, password_hash, role, village_id, village_slug)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      "ग्रामपंचायत प्रशासक (कोमलवाडी)",
      "admin@panchayat.gov.in",
      fallbackHashedPassword,
      "VILLAGE_ADMIN",
      villageId,
      villageSlug,
    ]
  );
  console.log("Created Admin Users: gpkomalwadi@gmail.com (Komalwadi@Admin2026) & admin@panchayat.gov.in");

  // 3. SEED CITIZEN SERVICES & FORMS
  for (const sc of ALL_CITIZEN_SERVICES) {
    const sRes = await dbQuery(
      `INSERT INTO services (village_id, village_slug, name, slug, description, category, icon, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [villageId, villageSlug, sc.name, sc.slug, sc.description, sc.category, sc.icon, true]
    );
    const serviceId = sRes.rows[0].id;

    const schema = ALL_CITIZEN_SCHEMAS[sc.slug];
    if (schema) {
      await dbQuery(
        `INSERT INTO forms (service_id, village_id, version, schema, is_active)
         VALUES ($1, $2, $3, $4, $5)`,
        [serviceId, villageId, 1, JSON.stringify(schema), true]
      );
    }
  }
  console.log(`Seeded ${ALL_CITIZEN_SERVICES.length} citizen services and form schemas.`);

  // 4. SEED NOTICES
  const komalwadiNotices = [
    {
      title: "समृद्ध पंचायत राज अभियानांतर्गत विशेष ग्रामसभा व प्रभात फेरी",
      content:
        "ग्रामपंचायत कोमलवाडीतर्फे समृद्ध पंचायत राज अभियान अंतर्गत विशेष ग्रामसभा व महिला व शाळकरी मुलांच्या उत्स्फूर्त सहभागाने प्रभात फेरी उत्साहात संपन्न झाली.",
      category: "गावामध्ये काय घडत आहे (News / घडामोडी)",
      is_important: true,
    },
    {
      title: "घरगुती कचरा व्यवस्थापनासाठी ओला व सुका कचरा कुंड्यांचे वाटप",
      content:
        "गावात स्वच्छता अभियानाला गती देण्यासाठी मिळकत व नळजोडणी धारकांना घरगुती ओला व सुका कचरा कुंड्यांचे वाटप व वर्गीकरण मोहीम यशस्वीपणे राबवली.",
      category: "गावामध्ये काय घडत आहे (News / घडामोडी)",
      is_important: false,
    },
    {
      title: "जलजीवन मिशन अंतर्गत हर घर नल से जल योजना व मुख्य जलकुंभ स्वच्छता",
      content:
        "गावातील प्रत्येक कुटुंबाला शुद्ध पिण्याच्या पाण्यासाठी अंतर्गत पाईपलाईन व जलकुंभ नूतनीकरणाचे काम ९५% पूर्ण झाले असून वितरण चाचणी सुरू आहे.",
      category: "गावामध्ये काय घडत आहे (News / घडामोडी)",
      is_important: false,
    },
    {
      title: "विशेष ग्रामसभा बैठक आयोजन सूचना",
      content:
        "ग्रामपंचायतीची विशेष ग्रामसभा पुढील सोमवारी सकाळी ११ वाजता ग्रामपंचायत कार्यालयात आयोजित केली आहे. विकासकामांचा आढावा, पाणी पुरवठा नियोजन व विविध योजनांवर चर्चा होईल. सर्व ग्रामस्थांनी वेळेवर उपस्थित राहावे.",
      category: "ग्रामसभा सूचना",
      is_important: true,
    },
    {
      title: "घरपट्टी व पाणीपट्टी कर भरणा सवलत सूचना",
      content:
        "चालू आर्थिक वर्षातील घरपट्टी व पाणीपट्टी वेळेवर भरून गावाच्या सर्वांगीण विकासात सहकार्य करावे. विहित मुदतीत कर भरणाऱ्या नागरिकांना नियमानुसार सवलत दिली जाईल.",
      category: "कर भरणा",
      is_important: false,
    },
  ];

  for (const n of komalwadiNotices) {
    await dbQuery(
      `INSERT INTO notices (village_id, village_slug, title, content, category, is_important, is_active, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [villageId, villageSlug, n.title, n.content, n.category, n.is_important, true]
    );
  }
  console.log(`Seeded ${komalwadiNotices.length} notices.`);

  // 5. SEED SCHEMES
  const komalwadiSchemes = [
    {
      slug: "pmay-rural-gharkul",
      title: "प्रधानमंत्री आवास योजना (ग्रामीण - PMAY-G)",
      category: "घरकुल व निवारा",
      image_url: "/images/schemes/pmay-gharkul.webp",
      description:
        "ग्रामीण भागातील बेघर व कच्च्या घरात राहणाऱ्या कुटुंबांना पक्के घर बांधणीसाठी ₹ १.२० लाख थेट अनुदान + मनरेगा ९० दिवसांची मजुरी व स्वच्छ भारत शौचालय अनुदान.",
      subsidy_details:
        "₹ १.२० लाख थेट बँक खात्यात + ₹ २३,८५० मनरेगा मजुरी + ₹ १२,००० शौचालय अनुदान (एकूण ₹ १.५५ लाख)",
      target_audience:
        "ग्रामीण भागातील बेघर, कच्च्या मातीच्या/कुडाच्या घरात राहणारे व आर्थिकदृष्ट्या दुर्बल घटक (BPL/SECC/Awaas+)",
      eligibility:
        "कुटुंबाकडे संपूर्ण भारतात कुठेही स्वतःचे पक्के घर नसावे. आवास प्लस (Awaas+) किंवा SECC 2011 च्या प्रतीक्षा यादीत नाव समाविष्ट असणे आवश्यक.",
      documents_required:
        "आधार कार्ड (सर्व सदस्यांचे), मनरेगा जॉब कार्ड, ग्रामपंचायत नमुना ८ उतारा / जागेचा मालकी पुरावा, आधार लिंक राष्ट्रीयीकृत बँक पासबुक.",
      application_process:
        "ग्रामपंचायत कार्यालयात ग्रामसेवक किंवा आपले सरकार केंद्राकडे विहित नमुन्यात अर्ज सादर करावा.",
      is_active: true,
    },
    {
      slug: "magel-tyala-solar-pump-shettale",
      title: "मागेल त्याला सौर कृषी पंप व शेततळे योजना (PM Kusum & Shettale)",
      category: "कृषी व जलसंधारण",
      image_url: "/images/schemes/solar-pump-shettale.webp",
      description:
        "शेतकऱ्यांना शाश्वत सिंचनासाठी सौर कृषी पंप बसविण्यासाठी ९०% ते ९५% शासकीय अनुदान तसेच शेततळे खोदण्यासाठी थेट आर्थिक मदत.",
      subsidy_details: "सौर पंपासाठी ९०% ते ९५% शासकीय अनुदान + शेततळे अस्तरीकरणासाठी ₹ ७५,०००",
      target_audience: "अल्प व अत्यल्प भूधारक शेतकरी",
      eligibility:
        "किमान ०.४० हेक्टर शेतजमीन असलेले शेतकरी. विहीर किंवा बारमाही जलस्रोत उपलब्ध असणे आवश्यक.",
      documents_required: "डिजिटल ७/१२ व ८-अ उतारा, आधार कार्ड, बँक पासबुक.",
      application_process: "महावितरण कुसुम पोर्टल किंवा महाडीबीटीवर अर्ज करावा.",
      is_active: true,
    },
    {
      slug: "pm-kisan-namo-shetkari-sanman",
      title: "पीएम किसान व नमो शेतकरी महासन्मान निधी योजना",
      category: "शेतकरी कल्याण",
      image_url: "/images/schemes/pm-kisan-farmer.webp",
      description:
        "शेतकऱ्यांसाठी पीक निविष्ठा खर्च भागवण्यासाठी केंद्र व राज्य शासनातर्फे एकत्रित वार्षिक ₹ १२,००० थेट बँक खात्यात सन्मान निधी.",
      subsidy_details: "वार्षिक ₹ १२,००० थेट बँक खात्यात (दर चार महिन्यांनी ₹ ४,००० चे ३ समान हप्ते)",
      target_audience: "महाराष्ट्रातील सर्व जमीनधारक शेतकरी कुटुंब",
      eligibility: "स्वतःच्या नावावर शेतजमीन असणारे शेतकरी ज्यांची ई-केवायसी व आधार संलग्नता पूर्ण आहे.",
      documents_required: "आधार कार्ड, ७/१२ व ८-अ उतारा, बँक खाते पासबुक.",
      application_process: "पीएम किसान पोर्टल किंवा आपले सरकार केंद्रावर ई-केवायसी करावी.",
      is_active: true,
    },
  ];

  for (const s of komalwadiSchemes) {
    await dbQuery(
      `INSERT INTO schemes (
        village_id, village_slug, title, slug, category, image_url, description,
        subsidy_details, target_audience, eligibility, documents_required, application_process, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        villageId,
        villageSlug,
        s.title,
        s.slug,
        s.category,
        s.image_url,
        s.description,
        s.subsidy_details,
        s.target_audience,
        s.eligibility,
        s.documents_required,
        s.application_process,
        s.is_active,
      ]
    );
  }
  console.log(`Seeded ${komalwadiSchemes.length} schemes.`);

  // 6. SEED PROJECTS
  const komalwadiProjects = [
    {
      title: "जल जीवन मिशन अंतर्गत हर घर नल से जल योजना व मुख्य जलकुंभ विस्तार",
      category: "पाणी पुरवठा",
      description:
        "गावातील प्रत्येक वस्ती आणि वाडीपर्यंत शुद्ध, फिल्टरयुक्त पिण्याचे पाणी पाईपलाईनद्वारे पोहोचविण्यासाठी जलकुंभ आणि मुख्य वितरण वाहिनीचे काम अंतिम टप्प्यात आहे.",
      status: "ONGOING",
      budget: 8450000,
      year: "२०२५ - २०२६",
      agency: "ग्रामीण पाणीपुरवठा विभाग, जि.प. नाशिक",
      location: "कोमलवाडी मुख्य गावठाण व वाड्या",
      start_date: "2025-01-15",
      completion_date: "2026-10-31",
      images: JSON.stringify(["/images/gallery/village-lake-nature.webp"]),
    },
    {
      title: "जिल्हा परिषद डिजिटल प्राथमिक शाळा व क्रीडांगण नूतनीकरण",
      category: "शिक्षण व क्रीडा",
      description:
        "गावातील शाळेत आधुनिक डिजिटल स्मार्ट क्लासरूम, रंगरंगोटी व लोकसहभागातून ग्रंथालय व क्रीडांगण उभारणी.",
      status: "COMPLETED",
      budget: 450000,
      year: "२०२४ - २०२५",
      agency: "शिक्षण विभाग, पंचायत समिती सिन्नर",
      location: "जि. प. प्राथमिक शाळा कोमलवाडी",
      start_date: "2024-05-01",
      completion_date: "2024-11-30",
      images: JSON.stringify(["/images/gallery/smart-village-street.webp"]),
    },
    {
      title: "गावठाण मुख्य रस्ते सिमेंट काँक्रीटीकरण व सौर पथदिवे बसविणे",
      category: "पायाभूत सुविधा",
      description:
        "गावातील अंतर्गत पक्के सिमेंट काँक्रीट रस्ते, भूमिगत गटार व रात्रीच्या सुरक्षिततेसाठी ५० सौर पथदिवे लोकार्पण.",
      status: "COMPLETED",
      budget: 1200000,
      year: "२०२४ - २०२५",
      agency: "ग्रामपंचायत कोमलवाडी व १५ वा वित्त आयोग",
      location: "मुख्य गावठाण परिसर",
      start_date: "2024-10-01",
      completion_date: "2025-04-30",
      images: JSON.stringify(["/images/gallery/smart-village-street.webp"]),
    },
    {
      title: "घनकचरा व्यवस्थापन व सेंद्रिय खत निर्मिती शेड",
      category: "स्वच्छ भारत मिशन",
      description:
        "ओला व सुका कचरा वर्गीकरण करून गावात सेंद्रिय कंपोस्ट खत तयार करण्यासाठी शेड व यंत्रसामग्री उभारणी.",
      status: "PLANNED",
      budget: 550000,
      year: "२०२६ - २०२७",
      agency: "स्वच्छ भारत मिशन (ग्रामीण)",
      location: "कचरा प्रक्रिया प्रकल्प शिवार",
      start_date: "2026-05-01",
      completion_date: "2026-12-31",
      images: JSON.stringify([]),
    },
  ];

  for (const p of komalwadiProjects) {
    await dbQuery(
      `INSERT INTO projects (
        village_id, village_slug, title, category, description, status, budget, year,
        agency, location, start_date, completion_date, images
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        villageId,
        villageSlug,
        p.title,
        p.category,
        p.description,
        p.status,
        p.budget,
        p.year,
        p.agency,
        p.location,
        p.start_date,
        p.completion_date,
        p.images,
      ]
    );
  }
  console.log(`Seeded ${komalwadiProjects.length} development projects.`);

  // 7. SEED REPRESENTATIVES
  const komalwadiRepresentatives = [
    {
      role: "सरपंच",
      name: "सौ. अलका साहेबराव भोर",
      phone: "९८२३९७८४९२",
      email: "gpkomalwadi@gmail.com",
      is_sarpanch: true,
      order_num: 1,
    },
    {
      role: "उपसरपंच",
      name: "सौ. अमृता शशिकांत अढांगळे",
      phone: "९६२३५४०९३७",
      email: "gpkomalwadi@gmail.com",
      is_upasarpanch: true,
      order_num: 2,
    },
    {
      role: "ग्रामविकास अधिकारी (ग्रामसेवक / VDO)",
      name: "श्री. राहुल लता मधुकर सदगीर",
      phone: "९९६०३९३९२४",
      email: "gpkomalwadi@gmail.com",
      order_num: 3,
    },
    {
      role: "ग्रामपंचायत सदस्या",
      name: "सौ. सरला तानाजी बोंबले",
      phone: "९७६४९८६७९४",
      ward: "वार्ड क्र. १",
      order_num: 4,
    },
    {
      role: "ग्रामपंचायत सदस्या",
      name: "सौ. सविता म्हसू बोऱ्हाडे",
      phone: "९७६७४८७२२४",
      ward: "वार्ड क्र. २",
      order_num: 5,
    },
    {
      role: "ग्रामपंचायत सदस्या",
      name: "सौ. लक्ष्मीबाई आनंदगीर गोसावी",
      phone: "९७६४९८६७९४",
      ward: "वार्ड क्र. ३",
      order_num: 6,
    },
    {
      role: "ग्रामपंचायत सदस्या",
      name: "सौ. उज्ज्वला प्रकाश भोर",
      phone: "९८५०३३०३०५",
      ward: "वार्ड क्र. ४",
      order_num: 7,
    },
    {
      role: "ग्रामपंचायत सदस्य",
      name: "श्री. लहानू संतू घुले",
      phone: "९८५०५००२७२",
      ward: "वार्ड क्र. ५",
      order_num: 8,
    },
    {
      role: "ग्रामपंचायत सदस्य",
      name: "श्री. गोरख गणपत अढांगळे",
      phone: "९७६३७३२२१३",
      ward: "वार्ड क्र. ६",
      order_num: 9,
    },
    {
      role: "ग्रामपंचायत सदस्य",
      name: "श्री. नंदकुमार बहिरू घुले",
      phone: "९६५७१एल६४७१",
      ward: "वार्ड क्र. ७",
      order_num: 10,
    },
    {
      role: "ग्रामपंचायत शिपाई",
      name: "श्री. ज्ञानेश्वर त्र्यंबक शिंदे",
      phone: "९९६०३९३९२४",
      order_num: 11,
    },
    {
      role: "पाणीपुरवठा कर्मचारी",
      name: "श्री. योगेश संजय सैद",
      phone: "९९६०३९३९२४",
      order_num: 12,
    },
  ];

  for (const r of komalwadiRepresentatives) {
    await dbQuery(
      `INSERT INTO representatives (
        village_id, village_slug, name, role, phone, email, ward, is_sarpanch, is_upasarpanch, order_num, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        villageId,
        villageSlug,
        r.name,
        r.role,
        r.phone,
        r.email,
        r.ward || null,
        r.is_sarpanch || false,
        r.is_upasarpanch || false,
        r.order_num,
        true,
      ]
    );
  }
  console.log(`Seeded ${komalwadiRepresentatives.length} representatives.`);

  console.log("==================================================");
  console.log("Successfully migrated & seeded PostgreSQL database: gram_panchayat_db!");
  console.log("Super Admin: admin@panchayat.gov.in / Admin@12345");
  console.log("==================================================");

  await pool.end();
}

seedPg().catch((err) => {
  console.error("PostgreSQL Seed error:", err);
  process.exit(1);
});

