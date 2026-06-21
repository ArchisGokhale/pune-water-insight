// Approximate centers for Pune district talukas and reservoir catchments.
export type GeoPoint = { name: string; lat: number; lon: number };

export const talukaPoints: GeoPoint[] = [
  { name: "Haveli", lat: 18.5204, lon: 73.8567 },
  { name: "Mulshi", lat: 18.5167, lon: 73.5 },
  { name: "Maval", lat: 18.75, lon: 73.45 },
  { name: "Bhor", lat: 18.1667, lon: 73.85 },
  { name: "Velhe", lat: 18.3167, lon: 73.55 },
  { name: "Purandar", lat: 18.2833, lon: 74.1 },
  { name: "Baramati", lat: 18.1514, lon: 74.5772 },
  { name: "Indapur", lat: 18.1167, lon: 75.0167 },
  { name: "Shirur", lat: 18.8267, lon: 74.3733 },
  { name: "Ambegaon", lat: 19.1167, lon: 73.7333 },
  { name: "Junnar", lat: 19.2, lon: 73.8833 },
  { name: "Khed", lat: 18.85, lon: 73.9 },
  { name: "Daund", lat: 18.4667, lon: 74.5833 },
];

export const reservoirPoints: GeoPoint[] = [
  { name: "Khadakwasla", lat: 18.4392, lon: 73.7689 },
  { name: "Panshet", lat: 18.3878, lon: 73.6111 },
  { name: "Varasgaon", lat: 18.3833, lon: 73.5333 },
  { name: "Temghar", lat: 18.4333, lon: 73.5167 },
  { name: "Pavana", lat: 18.6833, lon: 73.5 },
  { name: "Mulshi", lat: 18.5167, lon: 73.5 },
  { name: "Bhama Askhed", lat: 18.85, lon: 73.7833 },
];
