import {
  PrismaClient,
  MunicipalityTier,
  UserRole,
  ParcelStatus,
  DocumentUrgency,
  DocumentStatus,
  ProjectStatus,
  InvoiceStatus,
} from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Destructively re-seeding or initializing Garmian Municipal ERP...");

  // Clear existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.documentRoute.deleteMany();
  await prisma.document.deleteMany();
  await prisma.revenueInvoice.deleteMany();
  await prisma.project.deleteMany();
  await prisma.parcel.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.municipality.deleteMany();

  console.log("🏛️ Creating 13 Municipalities of Garmian...");

  const municipalitiesData = [
    {
      code: "GM-HQ",
      nameKrd: "بەڕێوەبەرایەتی گشتی شارەوانییەکانی گەرمیان",
      nameEng: "General Directorate of Municipalities of Garmian",
      tier: MunicipalityTier.HEADQUARTER,
      isHeadquarter: true,
    },
    {
      code: "GM-KLR",
      nameKrd: "سەرۆکایەتی شارەوانی کەلار",
      nameEng: "Kalar Municipality Directorate",
      tier: MunicipalityTier.TIER_1,
      isHeadquarter: false,
    },
    {
      code: "GM-KFR",
      nameKrd: "سەرۆکایەتی شارەوانی کفری",
      nameEng: "Kifri Municipality Directorate",
      tier: MunicipalityTier.TIER_1,
      isHeadquarter: false,
    },
    {
      code: "GM-RZG",
      nameKrd: "شارەوانی ڕزگاری",
      nameEng: "Rizgari Municipality",
      tier: MunicipalityTier.TIER_2,
      isHeadquarter: false,
    },
    {
      code: "GM-BWN",
      nameKrd: "شارەوانی باوەنور",
      nameEng: "Bawanur Municipality",
      tier: MunicipalityTier.TIER_2,
      isHeadquarter: false,
    },
    {
      code: "GM-MYD",
      nameKrd: "شارەوانی مەیدان",
      nameEng: "Maydan Municipality",
      tier: MunicipalityTier.TIER_2,
      isHeadquarter: false,
    },
    {
      code: "GM-SRQ",
      nameKrd: "شارەوانی سەرقەڵا",
      nameEng: "Sarqala Municipality",
      tier: MunicipalityTier.TIER_3,
      isHeadquarter: false,
    },
    {
      code: "GM-NWJ",
      nameKrd: "شارەوانی نەوجول",
      nameEng: "Nawjul Municipality",
      tier: MunicipalityTier.TIER_3,
      isHeadquarter: false,
    },
    {
      code: "GM-STW",
      nameKrd: "شارەوانی شێخ تەویل",
      nameEng: "Sheikh Tawil Municipality",
      tier: MunicipalityTier.TIER_3,
      isHeadquarter: false,
    },
    {
      code: "GM-KOK",
      nameKrd: "شارەوانی کۆکس",
      nameEng: "Koks Municipality",
      tier: MunicipalityTier.TIER_3,
      isHeadquarter: false,
    },
    {
      code: "GM-AWS",
      nameKrd: "شارەوانی ئاوەسپی",
      nameEng: "Awaspi Municipality",
      tier: MunicipalityTier.TIER_3,
      isHeadquarter: false,
    },
    {
      code: "GM-QRT",
      nameKrd: "شارەوانی قۆرەتوو",
      nameEng: "Qoratu Municipality",
      tier: MunicipalityTier.TIER_3,
      isHeadquarter: false,
    },
    {
      code: "GM-BAM",
      nameKrd: "شارەوانی بامۆ",
      nameEng: "Bamo Municipality",
      tier: MunicipalityTier.TIER_3,
      isHeadquarter: false,
    },
  ];

  const createdMunicipalities: Record<string, any> = {};

  for (const mData of municipalitiesData) {
    const created = await prisma.municipality.create({
      data: mData,
    });
    createdMunicipalities[mData.code] = created;
  }

  console.log("🏢 Creating Standard Municipal Departments...");
  const standardDepartments = [
    { name: "بەشی ئەندازە و پڕۆژەکان", code: "ENG" },
    { name: "بەشی زەویوزار، نەخشە و GIS", code: "GIS" },
    { name: "بەشی کارگێڕی و ئەرشیف (EDMS)", code: "ADM" },
    { name: "بەشی دارایی و ژمێریاری", code: "FIN" },
    { name: "بەشی سەرپێچی و زیادەڕۆیی", code: "VIO" },
    { name: "بەشی یاسا و گرێبەستەکان", code: "LAW" },
  ];

  const hqDepts: Record<string, any> = {};
  for (const dept of standardDepartments) {
    const created = await prisma.department.create({
      data: {
        municipalityId: createdMunicipalities["GM-HQ"].id,
        name: dept.name,
        code: dept.code,
      },
    });
    hqDepts[dept.code] = created;
  }

  // Also create departments for Kalar and Kifri
  const kalarDepts: Record<string, any> = {};
  for (const dept of standardDepartments) {
    const created = await prisma.department.create({
      data: {
        municipalityId: createdMunicipalities["GM-KLR"].id,
        name: dept.name,
        code: dept.code,
      },
    });
    kalarDepts[dept.code] = created;
  }

  console.log("👥 Creating Initial Role Accounts...");
  const defaultPasswordHash = await bcrypt.hash("Garmian@2026", 10);

  // 1. Director General (General Directorate HQ)
  const directorGeneral = await prisma.user.create({
    data: {
      fullName: "ئەندازیار بەرزان محەمەد ئەحمەد",
      phone: "07701500001",
      nationalId: "198012345678",
      passwordHash: defaultPasswordHash,
      role: UserRole.DIRECTOR_GENERAL,
      municipalityId: createdMunicipalities["GM-HQ"].id,
      departmentId: hqDepts["ADM"].id,
    },
  });

  // 2. Mayor of Kalar
  const mayorKalar = await prisma.user.create({
    data: {
      fullName: "ئەندازیار هەردی فەریق عەزیز",
      phone: "07701500002",
      nationalId: "198212345679",
      passwordHash: defaultPasswordHash,
      role: UserRole.MAYOR,
      municipalityId: createdMunicipalities["GM-KLR"].id,
      departmentId: kalarDepts["ADM"].id,
    },
  });

  // 3. Mayor of Kifri
  const mayorKifri = await prisma.user.create({
    data: {
      fullName: "عەلی حەسەن ڕەحیم",
      phone: "07701500003",
      nationalId: "198512345680",
      passwordHash: defaultPasswordHash,
      role: UserRole.MAYOR,
      municipalityId: createdMunicipalities["GM-KFR"].id,
    },
  });

  // 4. Head of Land & GIS Department
  const landOfficer = await prisma.user.create({
    data: {
      fullName: "ئەندازیار دانا سەردار جەبار",
      phone: "07701500004",
      nationalId: "199012345681",
      passwordHash: defaultPasswordHash,
      role: UserRole.LAND_OFFICER,
      municipalityId: createdMunicipalities["GM-KLR"].id,
      departmentId: kalarDepts["GIS"].id,
    },
  });

  // 5. Engineering Officer
  const engineerUser = await prisma.user.create({
    data: {
      fullName: "ئەندازیار شوان کامەران قادر",
      phone: "07701500005",
      nationalId: "199212345682",
      passwordHash: defaultPasswordHash,
      role: UserRole.ENGINEER,
      municipalityId: createdMunicipalities["GM-HQ"].id,
      departmentId: hqDepts["ENG"].id,
    },
  });

  // 6. Finance Officer
  const financeOfficer = await prisma.user.create({
    data: {
      fullName: "سەروەت عومەر کەریم",
      phone: "07701500006",
      nationalId: "198812345683",
      passwordHash: defaultPasswordHash,
      role: UserRole.FINANCE_OFFICER,
      municipalityId: createdMunicipalities["GM-HQ"].id,
      departmentId: hqDepts["FIN"].id,
    },
  });

  // 7. General Auditor
  const auditorUser = await prisma.user.create({
    data: {
      fullName: "ئاراس محەمەد نوری",
      phone: "07701500007",
      nationalId: "198612345684",
      passwordHash: defaultPasswordHash,
      role: UserRole.AUDITOR,
      municipalityId: createdMunicipalities["GM-HQ"].id,
    },
  });

  console.log("🗺️ Creating Seed GIS Parcels (Land Registry)...");
  await prisma.parcel.createMany({
    data: [
      {
        municipalityId: createdMunicipalities["GM-KLR"].id,
        zoneNumber: "کەرتی سیروان (باخچەی گشتی)",
        parcelNumber: "105/1",
        areaSqm: 5400.0,
        status: ParcelStatus.VACANT,
        usageType: "سەوزایی و باخچەی گشتی (Public Park)",
        ownerName: "موڵکی گشتی - شارەوانی کەلار",
        coordinatesJson: {
          type: "Polygon",
          coordinates: [
            [
              [45.3080, 34.6280],
              [45.3085, 34.6305],
              [45.3110, 34.6310],
              [45.3115, 34.6290],
              [45.3080, 34.6280],
            ],
          ],
        },
      },
      {
        municipalityId: createdMunicipalities["GM-KLR"].id,
        zoneNumber: "گەڕەکی شەهیدان",
        parcelNumber: "512/8",
        areaSqm: 200.0,
        status: ParcelStatus.ALLOCATED,
        usageType: "نیشتەجێبوون (Residential)",
        ownerName: "محەمەد ئەحمەد ڕەشید",
        ownerNationalId: "198810234511",
        coordinatesJson: {
          type: "Polygon",
          coordinates: [
            [
              [45.3148, 34.6340],
              [45.3150, 34.6358],
              [45.3170, 34.6360],
              [45.3168, 34.6342],
              [45.3148, 34.6340],
            ],
          ],
        },
      },
      {
        municipalityId: createdMunicipalities["GM-KLR"].id,
        zoneNumber: "کەرتی 12 شێروانە",
        parcelNumber: "142/12",
        areaSqm: 250.0,
        status: ParcelStatus.ALLOCATED,
        usageType: "نیشتەجێبوون (Residential)",
        ownerName: "کاروان فەتاح قادر",
        ownerNationalId: "198900456123",
        coordinatesJson: {
          type: "Polygon",
          coordinates: [
            [
              [45.3172, 34.6310],
              [45.3175, 34.6328],
              [45.3195, 34.6330],
              [45.3192, 34.6312],
              [45.3172, 34.6310],
            ],
          ],
        },
      },
      {
        municipalityId: createdMunicipalities["GM-KLR"].id,
        zoneNumber: "شەقامی سەرەکی بازرگانی (بۆلیڤارد)",
        parcelNumber: "88/4",
        areaSqm: 650.0,
        status: ParcelStatus.RESERVED,
        usageType: "بازرگانی (Commercial)",
        ownerName: "کۆمپانیای سیروان بۆ وەبەرهێنان",
        ownerNationalId: "201509981240",
        coordinatesJson: {
          type: "Polygon",
          coordinates: [
            [
              [45.3130, 34.6320],
              [45.3132, 34.6336],
              [45.3150, 34.6338],
              [45.3148, 34.6322],
              [45.3130, 34.6320],
            ],
          ],
        },
      },
      {
        municipalityId: createdMunicipalities["GM-KLR"].id,
        zoneNumber: "کەرتی پیشەسازی و کشتوکاڵی",
        parcelNumber: "312/8",
        areaSqm: 380.0,
        status: ParcelStatus.DISPUTED,
        usageType: "سەرپێچی و زیادەڕۆیی لەسەر موڵکی گشتی",
        ownerName: "سەرپێچیکار - دەستبەسەرداگرتنی نایاسایی",
        ownerNationalId: "198412345688",
        coordinatesJson: {
          type: "Polygon",
          coordinates: [
            [
              [45.3112, 34.6370],
              [45.3115, 34.6388],
              [45.3132, 34.6390],
              [45.3130, 34.6372],
              [45.3112, 34.6370],
            ],
          ],
        },
      },
      {
        municipalityId: createdMunicipalities["GM-KFR"].id,
        zoneNumber: "کەرتی ١ی کفری کۆن",
        parcelNumber: "77/3",
        areaSqm: 220.0,
        status: ParcelStatus.ALLOCATED,
        usageType: "نیشتەجێبوون (Residential)",
        ownerName: "ڕێبوار کەریم مەحمود",
        ownerNationalId: "199103445521",
        coordinatesJson: {
          type: "Polygon",
          coordinates: [
            [
              [44.9590, 34.6945],
              [44.9592, 34.6960],
              [44.9610, 34.6962],
              [44.9608, 34.6947],
              [44.9590, 34.6945],
            ],
          ],
        },
      },
    ],
  });

  console.log("📄 Creating Initial Seed Documents & Routes (EDMS)...");
  await prisma.document.create({
    data: {
      barcode: "GDM-2026-0418",
      subject: "داواکاری تەرخانکردنی زەوی بۆ نەخۆشخانەی فریاکەوتنی کەلار",
      urgency: DocumentUrgency.VERY_URGENT,
      status: DocumentStatus.IN_TRANSIT,
      senderMunicipalityId: createdMunicipalities["GM-KLR"].id,
      currentHolderId: directorGeneral.id,
      routes: {
        create: [
          {
            fromUserId: mayorKalar.id,
            toUserId: directorGeneral.id,
            toMunicipalityId: createdMunicipalities["GM-HQ"].id,
            action: "FORWARD",
            notes: "داواکاری تەرخانکردنی زەوی بەپەلە لە کەرتی شێروانە",
          },
        ],
      },
    },
  });

  await prisma.document.create({
    data: {
      barcode: "GDM-2026-0592",
      subject: "ڕەزامەندی پێشینەی دارایی پڕۆژەی ئاوەڕۆی کفری",
      urgency: DocumentUrgency.URGENT,
      status: DocumentStatus.RECEIVED,
      senderMunicipalityId: createdMunicipalities["GM-KFR"].id,
      currentHolderId: financeOfficer.id,
      routes: {
        create: [
          {
            fromUserId: engineerUser.id,
            toUserId: financeOfficer.id,
            toMunicipalityId: createdMunicipalities["GM-HQ"].id,
            action: "APPROVE",
            notes: "پەسەندکردنی خشتەی بڕەکان و بڕی پێشینەی دووەم",
          },
        ],
      },
    },
  });

  console.log("🏗️ Creating Municipal Projects...");
  await prisma.project.createMany({
    data: [
      {
        municipalityId: createdMunicipalities["GM-KLR"].id,
        title: "قیرتاوکردن و ئاوەڕۆی لوولەیی گەڕەکی شەهیدان - کەلار",
        budget: 485000000.0,
        contractor: "کۆمپانیای گەرمیان بۆ بەڵێندەرایەتی گشتی",
        completionRate: 68.0,
        status: ProjectStatus.ONGOING,
        startDate: new Date("2025-08-01"),
        endDate: new Date("2026-10-30"),
      },
      {
        municipalityId: createdMunicipalities["GM-KFR"].id,
        title: "کۆنکرێتکردنی کۆڵانەکانی گەڕەکی ڕزگاری و ئیسکان - کفری",
        budget: 240000000.0,
        contractor: "کۆمپانیای تەلارساز بۆ بیناکاری",
        completionRate: 92.0,
        status: ProjectStatus.ONGOING,
        startDate: new Date("2025-04-15"),
        endDate: new Date("2026-05-20"),
      },
      {
        municipalityId: createdMunicipalities["GM-RZG"].id,
        title: "نۆژەنکردنەوەی بلواری سەرەکی و سەوزایی - ڕزگاری",
        budget: 120000000.0,
        contractor: "بەڵێندەری ناوخۆیی - دیوانی ڕزگاری",
        completionRate: 45.0,
        status: ProjectStatus.ONGOING,
        startDate: new Date("2025-11-01"),
        endDate: new Date("2026-08-15"),
      },
      {
        municipalityId: createdMunicipalities["GM-BWN"].id,
        title: "دروستکردنی باخچە و پارک لە کەناراوەکانی سیروان - باوەنوور",
        budget: 180000000.0,
        contractor: "تەندەری گشتی بەڕێوەبەرایەتی گشتی",
        completionRate: 15.0,
        status: ProjectStatus.TENDER,
        startDate: new Date("2026-02-01"),
        endDate: new Date("2027-01-15"),
      },
    ],
  });

  console.log("💰 Creating Revenue Invoices...");
  await prisma.revenueInvoice.createMany({
    data: [
      {
        invoiceNumber: "INV-2026-08191",
        municipalityId: createdMunicipalities["GM-KLR"].id,
        payerName: "کۆمپانیای ئاسۆ بۆ بازرگانی گشتی",
        amount: 4500000.0,
        type: "کرێی موڵکی شارەوانی (Commercial Rent)",
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
      },
      {
        invoiceNumber: "INV-2026-08192",
        municipalityId: createdMunicipalities["GM-KLR"].id,
        payerName: "هاوڵاتی ڕێبوار ئەحمەد",
        amount: 850000.0,
        type: "ڕەسمی مۆڵەتی بیناسازی (Building Permit Fee)",
        status: InvoiceStatus.PENDING,
      },
    ],
  });

  console.log("🛡️ Creating Initial Audit Logs...");
  await prisma.auditLog.create({
    data: {
      userId: directorGeneral.id,
      action: "INITIAL_SYSTEM_SETUP",
      entity: "Municipality",
      entityId: createdMunicipalities["GM-HQ"].id,
      changesJson: {
        note: "سیستەمی گشتی بەڕێوەبەرایەتی بە سەرکەوتوویی جێگیرکرا بە ١٣ شارەوانی سەر بە ئیدارەی گەرمیان",
      },
      ipAddress: "127.0.0.1",
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log(`
----------------------------------------------------------------------
  GARMIAN MUNICIPAL ERP & GIS INITIAL SEED SUMMARY:
  • 13 Municipalities (1 Headquarter + 12 Sub-municipalities)
  • Departments (ENG, GIS, ADM, FIN, VIO, LAW)
  • 7 Core Administrative Roles Seeded:
      - DIRECTOR_GENERAL: 07701500001 (Pass: Garmian@2026)
      - MAYOR (Kalar):    07701500002 (Pass: Garmian@2026)
      - MAYOR (Kifri):    07701500003 (Pass: Garmian@2026)
      - LAND_OFFICER:     07701500004 (Pass: Garmian@2026)
      - ENGINEER:         07701500005 (Pass: Garmian@2026)
      - FINANCE_OFFICER:  07701500006 (Pass: Garmian@2026)
      - AUDITOR:          07701500007 (Pass: Garmian@2026)
----------------------------------------------------------------------
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

