import VillageLayout from "./[villageSlug]/layout";
import VillageHomePage from "./[villageSlug]/page";
import type { Metadata } from "next";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "ग्रामपंचायत कोमलवाडी - अधिकृत ई-प्रशासन व डिजिटल सेवा पोर्टल",
  description: "मु. कोमलवाडी, पो. वडांगळी, ता. सिन्नर, जि. नाशिक - ग्रामस्थांसाठी अधिकृत ग्रामपंचायत सेवा, दाखले, शासकीय योजना, विकासकामे व ऑनलाइन अर्ज पोर्टल.",
};

export default async function RootHomePage() {
  const params = Promise.resolve({ villageSlug: "komalwadi" });

  return (
    <VillageLayout params={params}>
      <VillageHomePage params={params} />
    </VillageLayout>
  );
}
