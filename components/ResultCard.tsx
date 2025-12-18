import React from 'react';
import { Copy, Check, Download, Lock, CreditCard, Loader2 } from 'lucide-react';
import { GeneratedContent, FormData } from '../types';

interface ResultCardProps {
  content: GeneratedContent;
  imageBase64: string | null;
  formData: FormData;
  onPayForDownload: () => Promise<boolean>;
  isGeneratingImage: boolean;
  hasPaid: boolean;
  isProcessingPayment: boolean;
  onContentChange?: (content: GeneratedContent) => void;
}

// Helper function to get title based on content type
const getTitleForContentType = (contentType: string, productName: string): { main: string; subtitle?: string } => {
  switch (contentType) {
    case 'showcase':
    case 'factual':
      return { main: productName };
    case 'storytelling':
      return { subtitle: 'The Story Behind', main: productName };
    case 'testimonial':
      return { subtitle: 'What They Say About', main: productName };
    case 'educational':
      return { main: `Tips ${productName}` };
    case 'comparison':
      return { subtitle: `${productName} vs Others:`, main: "What's the Difference?" };
    case 'interactive':
      return { main: 'Which Team Are You?' };
    case 'viral':
      return { main: 'Stop! You Have to Try This!' };
    default:
      return { main: productName };
  }
};

export const ResultCard: React.FC<ResultCardProps> = ({
  content,
  imageBase64,
  formData,
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
    link.download = 'generated-poster.png';
    link.click();
  };

  const handleChange = (field: keyof GeneratedContent, value: string) => {
    const updated = { ...editableContent, [field]: value } as GeneratedContent;
    setEditableContent(updated);
    if (onContentChange) {
      onContentChange(updated);
    }
  };

  const titleData = getTitleForContentType(formData.contentType, formData.productName);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Image Section with CSS Overlay */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800">Visual Output</h3>
            {hasPaid && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                <Check className="w-3 h-3" /> Licensed
              </span>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 flex justify-center">
          <div className="aspect-[3/4] w-full max-w-md relative rounded-lg shadow-2xl overflow-hidden">
            {isGeneratingImage ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">Rendering your poster...</p>
                </div>
              </div>
            ) : imageBase64 ? (
              <>
                {/* Full Preview Image - No blur, no watermark */}
                <img 
                  src={`data:image/png;base64,${imageBase64}`} 
                  alt="Generated Poster" 
                  className="w-full h-full object-cover"
                />
                
                {/* CSS Overlay for Title, Price, CTA */}
                <div className="absolute inset-0 flex flex-col pointer-events-none">
                  {/* Top Section - Title */}
                  <div className="flex-shrink-0 pt-8 px-6 text-center">
                    {titleData.subtitle && (
                      <h3 className="text-lg font-medium text-white drop-shadow-lg mb-1" 
                          style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                        {titleData.subtitle}
                      </h3>
                    )}
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-2xl"
                        style={{ 
                          textShadow: '3px 3px 6px rgba(0,0,0,0.6), -1px -1px 0 rgba(0,0,0,0.3)',
                          letterSpacing: '0.02em'
                        }}>
                      {titleData.main}
                    </h1>
                  </div>
                  
                  {/* Middle Section - Features (if any) */}
                  {(formData.feature1 || formData.feature2 || formData.feature3) && (
                    <div className="flex-grow flex items-center justify-center">
                      <div className="flex flex-wrap justify-center gap-2 px-4">
                        {[formData.feature1, formData.feature2, formData.feature3]
                          .filter(Boolean)
                          .map((feature, idx) => (
                            <span 
                              key={idx} 
                              className="bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-sm font-medium shadow-lg"
                            >
                              {feature}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Bottom Section - Price, CTA */}
                  <div className="flex-shrink-0 pb-6 px-6">
                    {/* Tagline */}
                    {formData.promoInfo && (
                      <p className="text-center text-white text-sm mb-2 font-medium"
                         style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
                        ✨ {formData.promoInfo} ✨
                      </p>
                    )}
                    
                    {/* Price Badge */}
                    {formData.priceInfo && (
                      <div className="flex justify-center mb-3">
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-full text-xl font-bold shadow-xl">
                          {formData.priceInfo}
                        </div>
                      </div>
                    )}
                    
                    {/* CTA Button */}
                    <div className="flex justify-center">
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl text-lg font-bold shadow-xl transform hover:scale-105 transition-transform">
                        🛒 Shop Now!
                      </div>
                    </div>
                    
                    {/* Temptation Text */}
                    <p className="text-center text-white text-xs mt-2 opacity-90"
                       style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                      Get it now before it runs out!
                    </p>
                  </div>
                </div>

                {/* Payment Overlay - Only shows if not paid */}
                {!hasPaid && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                    <div className="bg-black/40 backdrop-blur-sm absolute inset-0"></div>
                    <div className="relative z-10 text-center p-6">
                      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-xs">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mb-2">
                          Unlock Download
                        </h4>
                        <p className="text-sm text-slate-600 mb-4">
                          Pay once to download your high-quality poster with commercial license.
                        </p>
                        <button
                          onClick={onPayForDownload}
                          disabled={isProcessingPayment}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
                        >
                          {isProcessingPayment ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5" />
                              Pay Rp 7.500
                            </>
                          )}
                        </button>
                        <p className="text-xs text-slate-400 mt-3">
                          Secure payment via Midtrans
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                <p className="text-slate-500">Waiting for image...</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Download Button - Only enabled after payment */}
        {imageBase64 && (
          <div className="p-4 border-t border-slate-100 flex justify-center">
            <button
              onClick={downloadImage}
              disabled={isProcessingPayment}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
                hasPaid 
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg' 
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
            >
              {hasPaid ? (
                <>
                  <Download className="w-5 h-5" />
                  Download HD Poster
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pay to Download
                </>
              )}
            </button>
          </div>
        )}
        
        {/* Prompt Display */}
        <div className="p-4 bg-slate-50 text-xs text-slate-500 border-t border-slate-200 space-y-2">
          <strong>Prompt:</strong>
          <span className="block text-slate-600 whitespace-pre-line">
            {editableContent.image_prompt}
          </span>
        </div>
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
              {isEditing ? 'Done' : 'Edit Text'}
            </button>
            <button
              onClick={() => copyToClipboard(editableContent.caption, setCopiedCaption)}
              className="text-slate-400 hover:text-indigo-600 transition-colors"
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
