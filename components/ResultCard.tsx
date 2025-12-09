
import React from 'react';
import { Copy, Check, Download, Wand2, Lock, BadgeCheck, CreditCard } from 'lucide-react';
import { GeneratedContent } from '../types';

interface ResultCardProps {
  /**
   * The generated content to display in the result card. This includes the
   * caption, hashtags and image prompt returned by the Gemini service. When
   * the user edits any of these fields in the inline editor, the updated
   * values will be passed back up via the optional `onContentChange` callback.
   */
  content: GeneratedContent;

  /**
   * A base64 encoded PNG string for the generated poster. When null, a
   * placeholder UI is shown prompting the user to purchase or generate the
   * poster. When provided, the image is displayed and can be downloaded.
   */
  imageBase64: string | null;

  /**
   * Handler invoked when the user clicks the primary action button to
   * generate the poster image. This callback will be responsible for
   * triggering payment and image generation in the parent component.
   */
  onGenerateImage: () => void;

  /** Whether the app is currently generating the poster image. */
  isGeneratingImage: boolean;

  /** Whether the user has paid for commercial usage of the generated poster. */
  hasPaid: boolean;

  /** Whether a payment process is currently underway. */
  isProcessingPayment: boolean;

  /**
   * Optional callback fired whenever the user edits the caption, hashtags or
   * image prompt via the inline editor. The updated content object is
   * provided so the parent can persist the changes in its state.
   */
  onContentChange?: (content: GeneratedContent) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  content,
  imageBase64,
  onGenerateImage,
  isGeneratingImage,
  hasPaid,
  isProcessingPayment,
  onContentChange,
}) => {
  const [copiedCaption, setCopiedCaption] = React.useState(false);
  const [copiedHashtags, setCopiedHashtags] = React.useState(false);

  // Local editing state. When the user toggles editing mode, we create a
  // mutable copy of the generated content. Any changes made in the textarea
  // inputs update this state and notify the parent via onContentChange.
  const [isEditing, setIsEditing] = React.useState(false);
  const [editableContent, setEditableContent] = React.useState<GeneratedContent>(content);

  // When the content from props changes (e.g. on new generation), reset the
  // editable copy so that the editor reflects the latest AI output.
  React.useEffect(() => {
    setEditableContent(content);
  }, [content]);

  /**
   * Copy the provided text to the clipboard and briefly display a check
   * indicator. The indicator resets after 2 seconds.
   */
  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Request a download of the generated poster image. When called, a
   * temporary anchor element is created to trigger the browser's download
   * behaviour. If no image is available, the call is ignored.
   */
  const downloadImage = () => {
    if (!imageBase64) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageBase64}`;
    link.download = 'generated-poster.png';
    link.click();
  };

  /**
   * Update a single field on the editable content object. This helper
   * applies the change locally and also notifies the parent via
   * onContentChange, if provided.
   */
  const handleChange = (field: keyof GeneratedContent, value: string) => {
    const updated = { ...editableContent, [field]: value } as GeneratedContent;
    setEditableContent(updated);
    if (onContentChange) {
      onContentChange(updated);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Image Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          {/* Title and optional license badge */}
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-800">Visual Output</h3>
            {hasPaid && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                <BadgeCheck className="w-3 h-3" /> Commercial License
              </span>
            )}
          </div>
          {/* Actions: download button only. Editing for caption/hashtags is handled in the caption section. */}
          <div className="flex items-center gap-2">
            {imageBase64 && (
              <button
                onClick={downloadImage}
                className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center gap-1 font-medium"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            )}
          </div>
        </div>
        <div className="p-4 bg-slate-100 flex justify-center">
             <div className="aspect-[3/4] w-full max-w-md bg-white rounded-lg shadow-sm border border-slate-200 relative flex items-center justify-center overflow-hidden group">
                {imageBase64 ? (
                    <img 
                        src={`data:image/png;base64,${imageBase64}`} 
                        alt="Generated Product" 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="text-center p-6 w-full flex flex-col items-center">
                        <p className="text-slate-500 mb-6">Prompt ready. {hasPaid ? "Generate the final poster?" : "Unlock commercial generation."}</p>
                        
                        <button
                            onClick={onGenerateImage}
                            disabled={isGeneratingImage || isProcessingPayment}
                            className={`inline-flex items-center px-6 py-3 text-white rounded-lg transition-all shadow-md font-medium
                              ${hasPaid 
                                ? 'bg-indigo-600 hover:bg-indigo-700' 
                                : 'bg-slate-900 hover:bg-slate-800'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isGeneratingImage ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Rendering Poster...
                                </>
                            ) : isProcessingPayment ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Opening Payment...
                                </>
                            ) : hasPaid ? (
                                <>
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    Generate Poster
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Pay Rp 7.500 to Generate
                                </>
                            )}
                        </button>
                        
                        {!hasPaid && (
                          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
                            <Lock className="w-3 h-3" />
                            Commercial Use License Required
                          </div>
                        )}
                    </div>
                )}
             </div>
        </div>
        
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
            {/* Toggle edit mode */}
            <button
              onClick={() => setIsEditing((prev) => !prev)}
              className="text-xs px-2 py-1 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
            >
              {isEditing ? 'Done' : 'Edit Text'}
            </button>
            {/* Copy caption */}
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
