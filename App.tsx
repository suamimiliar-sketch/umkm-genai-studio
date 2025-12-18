import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { InputGroup } from './components/InputGroup';
import { FileUpload } from './components/FileUpload';
import { ResultCard } from './components/ResultCard';
import { generateMarketingContent, generateVisual } from './services/geminiService';
import { getSnapToken } from './services/paymentService';
import { DISPLAY_STYLES, CONTENT_TYPES, SEASONAL_THEMES } from './constants';
import { FormData, AppState } from './types';

const INITIAL_FORM_STATE: FormData = {
  productName: '',
  productDescription: '',
  displayStyle: '',
  contentType: '',
  priceInfo: '',
  promoInfo: '',
  feature1: '',
  feature2: '',
  feature3: '',
  seasonalTheme: '',
  productImage: null,
  logoImage: null,
};

function App() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_STATE);
  const [appState, setAppState] = useState<AppState>({
    isGeneratingText: false,
    isGeneratingImage: false,
    isProcessingPayment: false,
    hasPaid: false,
    generatedContent: null,
    generatedImageBase64: null,
    error: null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange =
    (field: 'productImage' | 'logoImage') =>
    (file: File | null) => {
      setFormData((prev) => ({ ...prev, [field]: file }));
    };

  // Execute image generation with captured values
  const executeImageGeneration = async (imagePrompt: string, productImage: File | null) => {
    if (!imagePrompt) {
      setAppState((prev) => ({ ...prev, error: 'Image prompt is missing.' }));
      return;
    }

    setAppState((prev) => ({ ...prev, isGeneratingImage: true, error: null }));

    try {
      const base64Image = await generateVisual(imagePrompt, productImage);
      setAppState((prev) => ({
        ...prev,
        isGeneratingImage: false,
        generatedImageBase64: base64Image,
      }));
    } catch (error: any) {
      setAppState((prev) => ({
        ...prev,
        isGeneratingImage: false,
        error: 'Gagal membuat gambar. Silakan coba lagi. ' + (error.message || ''),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Reset state when regenerating
    setAppState((prev) => ({
      ...prev,
      isGeneratingText: true,
      error: null,
      generatedContent: null,
      generatedImageBase64: null,
      hasPaid: false,
    }));

    try {
      // Step 1: Generate Text Content & Prompts
      const content = await generateMarketingContent(formData);
      setAppState((prev) => ({
        ...prev,
        isGeneratingText: false,
        generatedContent: content,
      }));

      // Step 2: Auto-generate image immediately after text generation
      const promptToUse = content.image_prompt;
      const imageToUse = formData.productImage;

      if (promptToUse) {
        await executeImageGeneration(promptToUse, imageToUse);
      }
    } catch (error: any) {
      setAppState((prev) => ({
        ...prev,
        isGeneratingText: false,
        isGeneratingImage: false,
        error: error.message || 'Terjadi kesalahan saat membuat poster.',
      }));
    }
  };

  const handlePaymentForDownload = async () => {
    const productName = formData.productName || 'Lisensi Komersial Poster';
    const amount = 7500;
    const isDev = import.meta.env.MODE !== 'production';

    if (appState.hasPaid) {
      return true;
    }

    setAppState((prev) => ({ ...prev, isProcessingPayment: true, error: null }));

    try {
      const token = await getSnapToken({
        productName,
        amount,
      });

      if (token === 'MOCK_TOKEN_DEMO') {
        if (isDev) {
          return new Promise<boolean>((resolve) => {
            setTimeout(() => {
              let confirmed = false;
              try {
                confirmed = window.confirm(
                  `[SIMULASI PEMBAYARAN MIDTRANS]

Produk: Lisensi Komersial Poster
Item: ${productName}
Harga: Rp ${amount.toLocaleString('id-ID')}

Klik OK untuk simulasi pembayaran berhasil.`
                );
              } catch (e) {
                console.error('Payment confirmation dialog failed:', e);
              }

              if (confirmed) {
                setAppState((prev) => ({
                  ...prev,
                  hasPaid: true,
                  isProcessingPayment: false,
                }));
                resolve(true);
              } else {
                setAppState((prev) => ({ ...prev, isProcessingPayment: false }));
                resolve(false);
              }
            }, 50);
          });
        } else {
          throw new Error(
            'Backend pembayaran mengembalikan token MOCK di production. Periksa konfigurasi Railway & Midtrans.'
          );
        }
      }

      const snap = (window as any).snap;

      if (snap && typeof snap.pay === 'function') {
        return new Promise<boolean>((resolve) => {
          snap.pay(token, {
            onSuccess: (result: any) => {
              console.log('Payment success', result);
              setAppState((prev) => ({
                ...prev,
                hasPaid: true,
                isProcessingPayment: false,
              }));
              resolve(true);
            },
            onPending: (result: any) => {
              console.log('Payment pending', result);
              setAppState((prev) => ({
                ...prev,
                hasPaid: true,
                isProcessingPayment: false,
              }));
              resolve(true);
            },
            onError: (result: any) => {
              console.log('Payment error', result);
              setAppState((prev) => ({
                ...prev,
                isProcessingPayment: false,
                error: 'Pembayaran gagal. Silakan coba lagi.',
              }));
              resolve(false);
            },
            onClose: () => {
              console.log('Snap closed by user');
              setAppState((prev) => ({ ...prev, isProcessingPayment: false }));
              resolve(false);
            },
          });
        });
      } else {
        if (isDev) {
          return new Promise<boolean>((resolve) => {
            const ok = window.confirm(
              `[SIMULASI PEMBAYARAN]

Snap.js tidak ter-load, simulasi pembayaran berhasil?`
            );
            if (ok) {
              setAppState((prev) => ({
                ...prev,
                hasPaid: true,
                isProcessingPayment: false,
              }));
              resolve(true);
            } else {
              setAppState((prev) => ({ ...prev, isProcessingPayment: false }));
              resolve(false);
            }
          });
        } else {
          throw new Error('Midtrans Snap tidak ter-load di production.');
        }
      }
    } catch (e: any) {
      console.error('Payment Error:', e);
      setAppState((prev) => ({
        ...prev,
        isProcessingPayment: false,
        error: 'Tidak dapat memulai pembayaran: ' + (e.message || 'Error tidak diketahui'),
      }));
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://res.cloudinary.com/dkmadqhik/image/upload/v1766057472/logo_decrude_pcscnl.png" 
              alt="Decrude Logo" 
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Kawan UMKM
              </h1>
              <p className="text-xs text-slate-500">
                Generator Poster UMKM
              </p>
            </div>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Powered by Gemini 2.5 Flash
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">Detail Poster</h2>
                <p className="text-sm text-slate-500">
                  Buat poster vertikal untuk media sosial secara instan.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <FileUpload
                  label="Gambar Produk (Wajib)"
                  onChange={handleFileChange('productImage')}
                />

                <InputGroup
                  label="Nama Produk"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  required
                  placeholder="contoh: Juara Dimsum"
                />

                <InputGroup
                  label="Deskripsi (Singkat)"
                  name="productDescription"
                  value={formData.productDescription}
                  onChange={handleInputChange}
                  type="textarea"
                  required
                  placeholder="contoh: Dimsum lezat dengan isian daging ayam premium dan udang segar."
                />

                <div className="mb-4">
                  <InputGroup
                    label="Tema Musiman (Opsional)"
                    name="seasonalTheme"
                    value={formData.seasonalTheme}
                    onChange={handleInputChange}
                    type="select"
                    options={SEASONAL_THEMES}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputGroup
                    label="Gaya Tampilan"
                    name="displayStyle"
                    value={formData.displayStyle}
                    onChange={handleInputChange}
                    type="select"
                    options={DISPLAY_STYLES}
                    required
                  />
                  <InputGroup
                    label="Tipe Konten"
                    name="contentType"
                    value={formData.contentType}
                    onChange={handleInputChange}
                    type="select"
                    options={CONTENT_TYPES}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputGroup
                    label="Harga (Opsional)"
                    name="priceInfo"
                    value={formData.priceInfo}
                    onChange={handleInputChange}
                    placeholder="contoh: 15000"
                  />
                  <InputGroup
                    label="Promo (Opsional)"
                    name="promoInfo"
                    value={formData.promoInfo}
                    onChange={handleInputChange}
                    placeholder="contoh: 10%"
                  />
                </div>

                <div className="space-y-3 mt-4">
                  <p className="text-sm font-medium text-slate-700">
                    Fitur Unggulan (Opsional)
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      name="feature1"
                      value={formData.feature1}
                      onChange={handleInputChange}
                      placeholder="Fitur 1 (contoh: Lezat)"
                      className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm border p-2"
                    />
                    <input
                      name="feature2"
                      value={formData.feature2}
                      onChange={handleInputChange}
                      placeholder="Fitur 2 (contoh: Besar)"
                      className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm border p-2"
                    />
                    <input
                      name="feature3"
                      value={formData.feature3}
                      onChange={handleInputChange}
                      placeholder="Fitur 3 (contoh: Bergizi)"
                      className="w-full rounded-lg border-slate-300 shadow-sm sm:text-sm border p-2"
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    type="submit"
                    disabled={
                      appState.isGeneratingText ||
                      appState.isGeneratingImage ||
                      !formData.productImage ||
                      !formData.productName
                    }
                    className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
                  >
                    {appState.isGeneratingText || appState.isGeneratingImage ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                        {appState.isGeneratingText ? 'Menyiapkan Desain...' : 'Membuat Poster...'}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Buat Poster
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            {appState.error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-red-700">{appState.error}</p>
              </div>
            )}

            {!appState.generatedContent && !appState.isGeneratingText && !appState.isGeneratingImage && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white border border-dashed border-slate-300 rounded-xl text-slate-400">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-full mb-4">
                  <img 
                    src="https://res.cloudinary.com/dkmadqhik/image/upload/v1766057472/logo_decrude_pcscnl.png" 
                    alt="Decrude Logo" 
                    className="w-12 h-12 opacity-50"
                  />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">
                  Siap membuat poster?
                </h3>
                <p className="max-w-sm">
                  Upload gambar produk dan isi detail untuk membuat poster marketing profesional secara instan.
                </p>
              </div>
            )}

            {(appState.generatedContent || appState.isGeneratingText || appState.isGeneratingImage) && (
              <>
                {appState.isGeneratingText ? (
                  <div className="space-y-6 animate-pulse">
                    <div className="aspect-[3/4] bg-slate-200 rounded-xl w-full max-w-md mx-auto"></div>
                    <div className="h-32 bg-slate-200 rounded-xl w-full"></div>
                    <div className="h-16 bg-slate-200 rounded-xl w-full"></div>
                  </div>
                ) : (
                  appState.generatedContent && (
                    <ResultCard
                      content={appState.generatedContent}
                      imageBase64={appState.generatedImageBase64}
                      onPayForDownload={handlePaymentForDownload}
                      isGeneratingImage={appState.isGeneratingImage}
                      hasPaid={appState.hasPaid}
                      isProcessingPayment={appState.isProcessingPayment}
                      onContentChange={(updated) =>
                        setAppState((prev) => ({
                          ...prev,
                          generatedContent: updated,
                        }))
                      }
                    />
                  )
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          © 2024 Kawan UMKM by Decrude. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
