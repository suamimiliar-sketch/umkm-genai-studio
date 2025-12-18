import React from 'react';
import { Copy, Check, Download, Lock, CreditCard, Loader2, BadgeCheck } from 'lucide-react';
import { GeneratedContent } from '../types';

interface ResultCardProps {
  content: GeneratedContent;
  imageBase64: string | null;
  onPayForDownload: () => Promise<boolean>;
  isGeneratingImage: boolean;
  hasPaid: boolean;
  isProcessingPayment: boolean;
  onContentChange?: (content: GeneratedContent) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  content,
  imageBase64,
  onPayForDownload,
  isGeneratingImage,
  hasPaid,
  isProcessingPayment,
  onContentChange,
}) => {
  const [copiedCaption, setCopiedCaption] = React.useState(false);
  const [copiedHashtags, setCopiedHashtags] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editableContent, setEditableContent] = React.useState<GeneratedContent>(content);

  React.useEffect(() => {
    setEditableContent(content);
  }, [content]);

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadImage = async () => {
    if (!imageBase64) return;

    // Check if user has paid, if not trigger payment
    if (!hasPaid) {
      const paymentSuccess = await onPayForDownload();
      if (!paymentSuccess) return;
    }

    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageBase64}`;
    link.download = 'poster-kawan-umkm.png';
    link.click();
  };

  const handleChange = (field: keyof GeneratedContent, value: string) => {
    const updated = { ...editableContent, [field]: value } as GeneratedContent;
    setEditableContent(updated);
    if (onContentChange) {
      onContentChange(updated);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Image Section - Clean display without CSS overlays */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800">Visual Output</h3>
            {hasPaid && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                <BadgeCheck className="w-3 h-3" /> Licensed
              </span>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 flex justify-center">
          <div className="aspect-[3/4] w-full max-w-md relative rounded-lg shadow-2xl overflow-hidden">
            {isGeneratingImage ? (
              // Loading state
              <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">Membuat poster...</p>
                  <p className="text-slate-400 text-sm mt-1">Tunggu sebentar ya</p>
                </div>
              </div>
            ) : imageBase64 ? (
              <>
                {/* Full Preview Image - No CSS overlays, image contains all text */}
                <img 
                  src={`data:image/png;base64,${imageBase64}`} 
                  alt="Generated Poster" 
                  className="w-full h-full object-cover"
                />

                {/* Payment Overlay - Only shows if not paid */}
                {!hasPaid && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 backdrop-blur-sm absolute inset-0"></div>
                    <div className="relative z-10 text-center p-6">
                      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-xs">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2">
                          Buka Akses Download
                        </h4>
                        <p className="text-sm text-slate-600 mb-4">
                          Bayar sekali untuk download poster berkualitas tinggi dengan lisensi komersial.
                        </p>
                        <button
                          onClick={onPayForDownload}
                          disabled={isProcessingPayment}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
                        >
                          {isProcessingPayment ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Memproses...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5" />
                              Bayar Rp 7.500
                            </>
                          )}
                        </button>
                        <p className="text-xs text-slate-400 mt-3">
                          Pembayaran aman via Midtrans
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Waiting for image
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-500">Menunggu gambar...</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Download Button */}
        {imageBase64 && (
          <div className="p-4 border-t border-slate-100 flex justify-center">
            <button
              onClick={downloadImage}
              disabled={isProcessingPayment}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                hasPaid 
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
              }`}
            >
              {hasPaid ? (
                <>
                  <Download className="w-5 h-5" />
                  Download Poster HD
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Bayar untuk Download
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Prompt Display (collapsible) */}
        <details className="border-t border-slate-200">
          <summary className="p-4 bg-slate-50 text-sm text-slate-600 cursor-pointer hover:bg-slate-100">
            <span className="font-medium">Lihat Prompt</span>
          </summary>
          <div className="p-4 bg-slate-50 text-xs text-slate-500 border-t border-slate-100">
            <pre className="whitespace-pre-wrap font-mono">
              {editableContent.image_prompt}
            </pre>
          </div>
        </details>
      </div>

      {/* Caption Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Caption (Bahasa Indonesia)</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing((prev) => !prev)}
              className="text-xs px-2 py-1 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              {isEditing ? 'Selesai' : 'Edit'}
            </button>
            <button
              onClick={() => copyToClipboard(editableContent.caption, setCopiedCaption)}
              className="text-slate-400 hover:text-indigo-600 transition-colors"
              title="Salin caption"
            >
              {copiedCaption ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="p-4">
          {isEditing ? (
            <textarea
              className="w-full border border-slate-200 rounded-md p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[140px]"
              value={editableContent.caption}
              onChange={(e) => handleChange('caption', e.target.value)}
            />
          ) : (
            <p className="text-slate-700 whitespace-pre-line text-sm leading-relaxed">
              {editableContent.caption}
            </p>
          )}
        </div>
      </div>

      {/* Hashtags Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Hashtags</h3>
          <button
            onClick={() => copyToClipboard(editableContent.hashtags, setCopiedHashtags)}
            className="text-slate-400 hover:text-indigo-600 transition-colors"
            title="Salin hashtags"
          >
            {copiedHashtags ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="p-4 bg-slate-50">
          {isEditing ? (
            <textarea
              className="w-full border border-slate-200 rounded-md p-2 text-sm text-indigo-600 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]"
              value={editableContent.hashtags}
              onChange={(e) => handleChange('hashtags', e.target.value)}
            />
          ) : (
            <p className="text-indigo-600 text-sm font-medium">
              {editableContent.hashtags}
            </p>
          )}
        </div>
      </div>

    </div>
  );
};
