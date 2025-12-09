export interface FormData {
  productName: string;
  productDescription: string;
  displayStyle: string;
  contentType: string;
  priceInfo: string;
  promoInfo: string;
  feature1: string;
  feature2: string;
  feature3: string;
  seasonalTheme: string;
  productImage: File | null;
  logoImage: File | null;
}

export interface GeneratedContent {
  image_prompt: string;
  caption: string;
  hashtags: string;
}

export interface AppState {
  isGeneratingText: boolean;
  isGeneratingImage: boolean;
  isProcessingPayment: boolean;
  hasPaid: boolean;
  generatedContent: GeneratedContent | null;
  generatedImageBase64: string | null;
  error: string | null;
}

export enum DisplayStyle {
  MinimalBright = "minimal and bright",
  ModernDark = "modern and dark",
  ElegantLuxurious = "elegant and luxurious",
  Colorful = "colorful",
  Futuristic = "futuristic",
  NaturalOrganic = "natural and organic",
  RetroVintage = "retro and vintage",
  BoldEnergetic = "bold and energetic",
}

export enum ContentType {
  Showcase = "showcase",
  Storytelling = "storytelling",
  Testimonial = "testimonial",
  Educational = "educational",
  Comparison = "comparison",
  Factual = "factual",
  Viral = "viral",
  Interactive = "interactive",
  Custom = "custom",
}

declare global {
  interface Window {
    snap: {
      pay: (token: string, callbacks: {
        onSuccess: (result: any) => void;
        onPending: (result: any) => void;
        onError: (result: any) => void;
        onClose: () => void;
      }) => void;
    };
  }
}