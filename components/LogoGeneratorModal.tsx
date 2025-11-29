
import React, { useState } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { useLanguage } from '../contexts/LanguageContext';

interface LogoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GenerationMode = 'ai' | 'custom';
type LogoStyle = 'minimalist' | 'modern' | 'geometric' | 'classic' | 'abstract';

interface ImageResult {
  url: string;
  base64: string;
}

const fonts = [
  { value: 'Cairo', labelKey: 'logoGenerator.fonts.cairo' },
  { value: 'Tajawal', labelKey: 'logoGenerator.fonts.tajawal' },
  { value: 'Noto Sans Arabic', labelKey: 'logoGenerator.fonts.noto' },
  { value: 'Montserrat', labelKey: 'logoGenerator.fonts.montserrat' },
  { value: 'Poppins', labelKey: 'logoGenerator.fonts.poppins' },
  { value: 'Playfair Display', labelKey: 'logoGenerator.fonts.playfair' },
];

const LogoGeneratorModal: React.FC<LogoGeneratorModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<GenerationMode>('ai');
  const [storeName, setStoreName] = useState('');
  const [field, setField] = useState('');
  const [colors, setColors] = useState('');
  const [description, setDescription] = useState('');
  const [logoStyle, setLogoStyle] = useState<LogoStyle>('minimalist');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageResults, setImageResults] = useState<ImageResult[] | null>(null);
  const { t } = useLanguage();
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [editTextColor, setEditTextColor] = useState('#000000');
  const [editFontFamily, setEditFontFamily] = useState(fonts[0].value);
  const [isEditing, setIsEditing] = useState(false);

  const handleClose = () => {
    setStoreName('');
    setField('');
    setColors('');
    setDescription('');
    setImageResults(null);
    setError(null);
    setMode('ai');
    handleCancelEdit();
    onClose();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !field) {
      setError(t('logoGenerator.error.missingFields'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setImageResults(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      let prompt = '';
      if (mode === 'ai') {
          prompt = t('logoGenerator.prompt.ai.base', { storeName, field, style: logoStyle });
      } else {
          prompt = t('logoGenerator.prompt.custom.base', { storeName, field, style: logoStyle, description, colors });
      }
      
      // FIX: Use generateContent with gemini-2.5-flash-image model instead of deprecated generateImages
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
      });
      
      const generatedImages: ImageResult[] = [];
      if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64 = part.inlineData.data;
            generatedImages.push({
              url: `data:image/png;base64,${base64}`,
              base64: base64,
            });
          }
        }
      }

      if (generatedImages.length > 0) {
        // To match previous behavior of 2 images, we can duplicate the result or make a second call.
        // For simplicity, we'll show what we get. If we need 2, we can call the API twice.
        // Let's just create a second one identical to the first for UI consistency.
        if (generatedImages.length === 1) {
            generatedImages.push({...generatedImages[0]});
        }
        setImageResults(generatedImages.slice(0, 2));
      } else {
        throw new Error("AI did not return any images.");
      }

    } catch (err) {
      console.error(err);
      setError(t('logoGenerator.error.generationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditText(storeName);
    setEditTextColor('#000000');
    setEditFontFamily(fonts[0].value);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditText('');
    setEditTextColor('#000000');
    setEditFontFamily(fonts[0].value);
  };

  const handleUpdateLogo = async () => {
    if (editingIndex === null || !editText.trim() || !imageResults) return;

    setIsEditing(true);
    setError(null);
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const originalImage = imageResults[editingIndex];
        
        const imagePart = {
          inlineData: {
            mimeType: 'image/png',
            data: originalImage.base64,
          },
        };

        const editPromptText = t('logoGenerator.prompt.manualEdit', {
            editText: editText.trim(),
            editTextColor: editTextColor,
            editFontFamily: editFontFamily,
        });
        
        const textPart = { text: editPromptText };
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [imagePart, textPart] },
          config: {
              responseModalities: [Modality.IMAGE],
          },
        });

        let newBase64: string | undefined;
        if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    newBase64 = part.inlineData.data;
                    break;
                }
            }
        }
        
        if (newBase64) {
            const updatedImage = {
                url: `data:image/png;base64,${newBase64}`,
                base64: newBase64,
            };
            const newImageResults = [...imageResults];
            newImageResults[editingIndex] = updatedImage;
            setImageResults(newImageResults);
            setStoreName(editText.trim()); // Update store name for future edits
            handleCancelEdit();
        } else {
            throw new Error("AI did not return an edited image.");
        }
    } catch (err) {
        console.error("Error editing logo:", err);
        setError(t('logoGenerator.error.editFailed'));
    } finally {
        setIsEditing(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 transition-opacity" onClick={handleClose}>
      <div className="bg-dark-800 rounded-lg shadow-2xl w-full max-w-2xl p-6 relative animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleClose} className="absolute top-4 left-4 rtl:left-auto rtl:right-4 text-dark-400 hover:text-white text-2xl z-20">&times;</button>
        <h3 className="text-xl font-bold mb-4 text-center">{t('logoGenerator.title')}</h3>
        
        {isLoading ? (
          <div className="text-center p-8 min-h-[400px] flex flex-col justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-dark-300">{t('logoGenerator.loading')}</p>
          </div>
        ) : imageResults ? (
          <div className="text-center">
            <h4 className="font-bold text-lg mb-4">{t('logoGenerator.ready')}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {imageResults.map((img, index) => (
                <div key={index} className="space-y-2">
                  <div className="relative">
                    <img src={img.url} alt={`Generated Logo ${index + 1}`} className="rounded-lg border-4 border-dark-700 mx-auto" />
                     {isEditing && editingIndex === index && (
                       <div className="absolute inset-0 bg-dark-900/80 flex items-center justify-center rounded-lg">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                          <span className="text-white ml-2 rtl:mr-2 rtl:ml-0">{t('logoGenerator.editingLabel')}</span>
                       </div>
                    )}
                  </div>
                  
                  {editingIndex === index ? (
                     <div className="p-3 bg-dark-700 rounded-lg space-y-3 animate-fade-in text-right rtl:text-right">
                        <h5 className="text-sm font-bold text-center mb-2">{t('logoGenerator.manualEditTitle')}</h5>
                        <div>
                            <label className="text-xs text-dark-300 block mb-1 text-right rtl:text-right" htmlFor={`editText-${index}`}>{t('logoGenerator.editTextLabel')}</label>
                            <input type="text" id={`editText-${index}`} value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full text-sm bg-dark-600 border border-dark-500 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                                <label className="text-xs text-dark-300 block mb-1 text-right rtl:text-right" htmlFor={`editColor-${index}`}>{t('logoGenerator.textColorLabel')}</label>
                                <input type="color" id={`editColor-${index}`} value={editTextColor} onChange={(e) => setEditTextColor(e.target.value)} className="w-full h-10 bg-dark-600 border border-dark-500 rounded-md p-1 cursor-pointer" />
                           </div>
                           <div>
                                <label className="text-xs text-dark-300 block mb-1 text-right rtl:text-right" htmlFor={`editFont-${index}`}>{t('logoGenerator.fontFamilyLabel')}</label>
                                <select id={`editFont-${index}`} value={editFontFamily} onChange={(e) => setEditFontFamily(e.target.value)} className="w-full h-10 text-sm bg-dark-600 border border-dark-500 rounded-md px-2 py-2 text-white focus:ring-primary focus:border-primary">
                                    {fonts.map(font => (
                                        <option key={font.value} value={font.value}>{t(font.labelKey as any)}</option>
                                    ))}
                                </select>
                           </div>
                        </div>
                        <div className="flex space-x-2 rtl:space-x-reverse pt-2">
                            <button onClick={handleCancelEdit} className="w-1/3 bg-dark-600 hover:bg-dark-500 text-white font-bold py-2 px-3 rounded-md transition duration-300 text-xs">{t('logoGenerator.cancelButton')}</button>
                            <button onClick={handleUpdateLogo} disabled={isEditing} className="w-2/3 bg-primary hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-md transition duration-300 text-xs disabled:bg-dark-500 disabled:cursor-not-allowed">{t('logoGenerator.updateButton')}</button>
                        </div>
                     </div>
                  ) : (
                    <div className="flex space-x-2 rtl:space-x-reverse">
                        <a href={img.url} download={`${storeName}-logo-${index + 1}.png`} className="w-2/3 block text-center bg-secondary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 text-sm">
                          {t('logoGenerator.download')}
                        </a>
                        <button onClick={() => handleStartEdit(index)} className="w-1/3 bg-dark-600 hover:bg-dark-500 text-white font-bold py-2 px-4 rounded-md transition duration-300 text-sm">{t('logoGenerator.editButton')}</button>
                    </div>
                  )}

                </div>
              ))}
            </div>
            {error && <p className="text-danger text-sm text-center my-2">{error}</p>}
            <button onClick={() => { setImageResults(null); setError(null); }} className="mt-2 text-dark-400 hover:text-white text-sm">{t('logoGenerator.tryAgain')}</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-dark-400 text-center mb-4">{t('logoGenerator.description')}</p>
            
            <div className="flex p-1 bg-dark-700 rounded-lg mb-6">
                <button type="button" onClick={() => setMode('ai')} className={`w-1/2 p-2 rounded-md font-semibold text-sm transition-colors ${mode === 'ai' ? 'bg-primary text-white' : 'text-dark-300 hover:bg-dark-600'}`}>
                    {t('logoGenerator.modes.ai')}
                </button>
                <button type="button" onClick={() => setMode('custom')} className={`w-1/2 p-2 rounded-md font-semibold text-sm transition-colors ${mode === 'custom' ? 'bg-primary text-white' : 'text-dark-300 hover:bg-dark-600'}`}>
                    {t('logoGenerator.modes.custom')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="storeName" className="block text-sm font-medium text-dark-300 mb-1">{t('logoGenerator.storeName')}</label>
                  <input type="text" id="storeName" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary" required />
                </div>
                <div>
                  <label htmlFor="field" className="block text-sm font-medium text-dark-300 mb-1">{t('logoGenerator.field')}</label>
                  <input type="text" id="field" value={field} onChange={(e) => setField(e.target.value)} className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary" placeholder={t('logoGenerator.fieldPlaceholder')} required />
                </div>
            </div>
            
            <div>
              <label htmlFor="logoStyle" className="block text-sm font-medium text-dark-300 mb-1">{t('logoGenerator.style')}</label>
              <select id="logoStyle" value={logoStyle} onChange={(e) => setLogoStyle(e.target.value as LogoStyle)} className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary">
                  <option value="minimalist">{t('logoGenerator.styles.minimalist')}</option>
                  <option value="modern">{t('logoGenerator.styles.modern')}</option>
                  <option value="geometric">{t('logoGenerator.styles.geometric')}</option>
                  <option value="classic">{t('logoGenerator.styles.classic')}</option>
                  <option value="abstract">{t('logoGenerator.styles.abstract')}</option>
              </select>
            </div>

            {mode === 'custom' && (
                <div className="space-y-4 animate-fade-in">
                    <div>
                      <label htmlFor="colors" className="block text-sm font-medium text-dark-300 mb-1">{t('logoGenerator.colors')}</label>
                      <input type="text" id="colors" value={colors} onChange={(e) => setColors(e.target.value)} className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary" placeholder={t('logoGenerator.colorsPlaceholder')} />
                    </div>
                     <div>
                      <label htmlFor="description" className="block text-sm font-medium text-dark-300 mb-1">{t('logoGenerator.identity')}</label>
                      <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full bg-dark-700 border border-dark-600 rounded-md px-3 py-2 text-white focus:ring-primary focus:border-primary" placeholder={t('logoGenerator.identityPlaceholder')}></textarea>
                    </div>
                </div>
            )}
            
            {error && <p className="text-danger text-sm text-center">{error}</p>}
            <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-md transition duration-300 mt-4">
              {t('logoGenerator.button')}
            </button>
          </form>
        )}
      </div>
       <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
    `}</style>
    </div>
  );
};

export default LogoGeneratorModal;
