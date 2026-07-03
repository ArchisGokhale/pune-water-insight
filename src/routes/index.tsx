import { createFileRoute } from "@tanstack/react-router";
import WaterPlatform from "@/components/WaterPlatform";
import { liveWeatherQuery } from "@/lib/weather-query";
import { liveNewsQuery } from "@/lib/news-query";
import {
  overallFill,
  totalCurrent,
  totalCapacity,
  khadakwaslaComplexFill,
  daysAvailable,
  districtSeasonRain,
  districtRainDeparture,
  securityLabel,
  reservoirs,
} from "@/lib/water-data";

const SITE_URL = "https://pune-water-insight.lovable.app";
const TITLE =
  "Pune Rainfall & Reservoir Live Tracker — Khadakwasla, Panshet, Varasgaon, Temghar Dam Water Levels";
const DESCRIPTION = `Live Pune rainfall, dam water levels and water-security index. Khadakwasla complex ${khadakwaslaComplexFill}% full, all 7 dams at ${overallFill}% (${totalCurrent}/${totalCapacity} TMC), ~${daysAvailable} days of city supply. Season rainfall ${districtSeasonRain} mm (${districtRainDeparture > 0 ? "+" : ""}${districtRainDeparture}% vs normal). Updated hourly for Pune district.`;

const faqs = [
  {
    q: "What is the current water level in Khadakwasla dam?",
    a: `The Khadakwasla drinking-water complex (Khadakwasla, Panshet, Varasgaon, Temghar) is currently at ${khadakwaslaComplexFill}% of live capacity, providing roughly ${daysAvailable} days of PMC + PCMC supply at current draw of ~1,650 MLD.`,
  },
  {
    q: "How much rainfall has Pune received this monsoon?",
    a: `Pune district has received about ${districtSeasonRain} mm of rainfall this monsoon season, a departure of ${districtRainDeparture > 0 ? "+" : ""}${districtRainDeparture}% from the IMD long-period average to date.`,
  },
  {
    q: "What is the total storage in Pune's 7 major dams?",
    a: `Pune's seven major reservoirs — Khadakwasla, Panshet, Varasgaon, Temghar, Pavana, Mulshi and Bhama Askhed — currently hold ${totalCurrent} TMC out of ${totalCapacity} TMC live capacity (${overallFill}% full). Water security status: ${securityLabel}.`,
  },
  {
    q: "Which talukas in Pune district get the most rainfall?",
    a: "Ghat-belt talukas Mulshi, Velhe, Maval and Bhor receive the highest rainfall in Pune district and feed the Khadakwasla, Pavana and Mulshi reservoir systems. Eastern plains (Indapur, Baramati, Daund) are rain-shadow zones and typically run rainfall deficits.",
  },
  {
    q: "How is Pune's drinking water supplied?",
    a: "Pune Municipal Corporation (PMC) draws ~1,450 MLD primarily from the Khadakwasla complex via the Parvati and Warje treatment plants. Pimpri-Chinchwad (PCMC) draws ~520 MLD from Pavana dam. Bhama Askhed supplies eastern PMC wards.",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "Pune rainfall today, Pune dam water level, Khadakwasla water level, Panshet dam storage, Varasgaon dam, Temghar dam, Pavana dam, Mulshi dam, Pune water supply, PMC water cut, Pune monsoon 2026, Pune reservoir status, Pune rain statistics, Maharashtra dam levels, Pune water crisis",
      },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: SITE_URL + "/" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Pune Water Insights Live" },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "geo.region", content: "IN-MH" },
      { name: "geo.placename", content: "Pune" },
      { name: "geo.position", content: "18.5204;73.8567" },
      { name: "ICBM", content: "18.5204, 73.8567" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Pune Water Insights Live",
          alternateName: "Pune Water Intelligence Platform",
          url: SITE_URL,
          description: DESCRIPTION,
          inLanguage: "en-IN",
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Pune Water Insights Live",
          url: SITE_URL,
          logo: `${SITE_URL}/favicon.ico`,
          areaServed: { "@type": "AdministrativeArea", name: "Pune District, Maharashtra, India" },
          founder: { "@type": "Person", name: "Archis Gokhale" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "Pune Reservoir Storage & Rainfall Live Dataset",
          description:
            "Hourly-updated storage levels (TMC and % fill) for seven major Pune reservoirs plus 24-hour and season rainfall totals across 13 talukas of Pune district.",
          url: SITE_URL,
          keywords: [
            "Pune rainfall",
            "Khadakwasla dam",
            "Panshet dam",
            "Varasgaon dam",
            "Temghar dam",
            "Pavana dam",
            "Mulshi dam",
            "Bhama Askhed dam",
            "reservoir storage",
            "water supply Pune",
          ],
          spatialCoverage: {
            "@type": "Place",
            name: "Pune District, Maharashtra, India",
            geo: { "@type": "GeoCoordinates", latitude: 18.5204, longitude: 73.8567 },
          },
          temporalCoverage: `2026-06-01/${new Date().toISOString().slice(0, 10)}`,
          creator: { "@type": "Person", name: "Archis Gokhale" },
          license: "https://creativecommons.org/licenses/by/4.0/",
          variableMeasured: [
            "Reservoir live storage (TMC)",
            "Reservoir fill percentage",
            "Inflow (cusec)",
            "Outflow (cusec)",
            "Catchment rainfall (mm)",
            "Taluka-level rainfall (mm)",
            "Water security index",
          ],
          distribution: reservoirs.map((r) => ({
            "@type": "DataDownload",
            name: `${r.name} dam live storage`,
            encodingFormat: "text/html",
            contentUrl: `${SITE_URL}/#${r.id}`,
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" },
            { "@type": "ListItem", position: 2, name: "Ward Water Supply", item: SITE_URL + "/wards" },
          ],
        }),
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.prefetchQuery(liveWeatherQuery);
    context.queryClient.prefetchQuery(liveNewsQuery);
  },
  component: () => <WaterPlatform />,
});
