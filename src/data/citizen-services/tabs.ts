export interface CitizenTabConfig {
  id: string;
  slug: string;
  label: string;
  shortLabel?: string;
  category: string;
  description: string;
  iconName: string;
  actionDefault: string;
}

export const CITIZEN_TABS: CitizenTabConfig[] = [
  {
    id: "अर्ज",
    slug: "aarz",
    label: "अर्ज",
    shortLabel: "अर्ज",
    category: "अर्ज",
    description: "बांधकाम परवानगी, जन्म-मृत्यू-विवाह नोंदणी, नमुना ८ व फेरफार अधिकृत ऑनलाइन अर्ज.",
    iconName: "FileEdit",
    actionDefault: "अर्ज करा",
  },
  {
    id: "कर भरणा",
    slug: "tax",
    label: "कर भरणा",
    shortLabel: "कर भरणा",
    category: "कर भरणा",
    description: "घरपट्टी, पाणीपट्टी व व्यवसाय कर ऑनलाइन भरणा प्रणाली.",
    iconName: "Receipt",
    actionDefault: "कर भरणा करा",
  },
  {
    id: "स्वयं घोषणापत्र",
    slug: "declarations",
    label: "स्वयं घोषणापत्र",
    shortLabel: "स्वयं घोषणापत्र",
    category: "स्वयं घोषणापत्र",
    description: "शौचालय, हयात दाखला, वीज एनओसी व शिधापत्रिका विभक्त स्वयं घोषणापत्रे व नमुने.",
    iconName: "FileCheck2",
    actionDefault: "घोषणापत्र भरा",
  },
  {
    id: "दाखले",
    slug: "certificates",
    label: "दाखले",
    shortLabel: "दाखले",
    category: "दाखले",
    description: "शासकीय दाखले व प्रमाणपत्रे.",
    iconName: "Award",
    actionDefault: "दाखला मिळवा",
  },
  {
    id: "तक्रार / सूचना",
    slug: "grievances",
    label: "तक्रार / सूचना",
    shortLabel: "तक्रार / सूचना",
    category: "तक्रार / सूचना",
    description: "नागरिक तक्रार निवारण व ग्रामविकास सूचना प्रणाली.",
    iconName: "MessageSquareText",
    actionDefault: "तक्रार नोंदवा",
  },
];

export function getTabBySlugOrId(key?: string): CitizenTabConfig {
  if (!key) return CITIZEN_TABS[0];
  const normalized = key.trim().toLowerCase();
  const found = CITIZEN_TABS.find(
    (t) =>
      t.slug.toLowerCase() === normalized ||
      t.id.toLowerCase() === normalized ||
      t.label.toLowerCase() === normalized
  );
  return found || CITIZEN_TABS[0];
}
