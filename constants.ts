import { DisplayStyle, ContentType } from './types';

export const DISPLAY_STYLES = [
  { value: DisplayStyle.MinimalBright, label: "Minimal & Bright" },
  { value: DisplayStyle.ModernDark, label: "Modern & Dark" },
  { value: DisplayStyle.ElegantLuxurious, label: "Elegant & Luxurious" },
  { value: DisplayStyle.Colorful, label: "Colorful & Vibrant" },
  { value: DisplayStyle.Futuristic, label: "Futuristic & Tech" },
  { value: DisplayStyle.NaturalOrganic, label: "Natural & Organic" },
  { value: DisplayStyle.RetroVintage, label: "Retro & Vintage" },
  { value: DisplayStyle.BoldEnergetic, label: "Bold & Energetic" },
];

export const CONTENT_TYPES = [
  { value: ContentType.Showcase, label: "Product Showcase" },
  { value: ContentType.Storytelling, label: "Storytelling" },
  { value: ContentType.Testimonial, label: "Testimonial" },
  { value: ContentType.Educational, label: "Educational / Tips" },
  { value: ContentType.Comparison, label: "Comparison" },
  { value: ContentType.Factual, label: "Factual / Specs" },
  { value: ContentType.Viral, label: "Viral / Catchy" },
  { value: ContentType.Interactive, label: "Interactive" },
];

export const SEASONAL_THEMES = [
  { value: "", label: "None (Standard)" },
  { value: "christmas", label: "Christmas / Natal" },
  { value: "new year", label: "New Year / Tahun Baru" },
  { value: "christmas and new year", label: "Christmas & New Year" },
  { value: "holiday season", label: "Holiday Season / Liburan" },
  { value: "chinese new year", label: "Chinese New Year / Imlek" },
  { value: "ramadan", label: "Ramadan / Lebaran" },
];

export const PLACEHOLDER_IMAGE = "https://picsum.photos/400/600";