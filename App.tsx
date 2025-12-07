import React, { useState, useEffect } from 'react';
import { UploadedImage, MenuData, AppStep } from './types';
import { extractMenuFromImages } from './services/geminiService';
import { decodeMenuFromHash } from './services/urlBackend';
import PhotoUploader from './components/PhotoUploader';
import MenuEditor from './components/MenuEditor';
import MenuPreview from './components/MenuPreview';
import QRCodeShare from './components/QRCodeShare';
import { Loader2, ChefHat } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('upload');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCustomerView, setIsCustomerView] = useState(false);

  useEffect(() => {
    // Check for menu data in URL (Customer scanning QR code)
    const params = new URLSearchParams(window.location.search);
    const menuHash = params.get('m');
    
    if (menuHash) {
      const decodedMenu = decodeMenuFromHash(menuHash);
      if (decodedMenu) {
        setMenuData(decodedMenu);
        setStep('preview');
        setIsCustomerView(true);
      } else {
        setError("Invalid or expired menu link.");
      }
    }
  }, []);

  const handleProcessImages = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setStep('processing');
      
      const data = await extractMenuFromImages(images);
      setMenuData(data);
      setStep('editor');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to process images. Please try again.");
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveEditor = (data: MenuData) => {
    setMenuData(data);
    setStep('preview');
  };

  const renderContent = () => {
    switch (step) {
      case 'upload':
        return (
          <PhotoUploader 
            images={images} 
            setImages={setImages} 
            onProcess={handleProcessImages}
            isProcessing={isProcessing} 
          />
        );
      
      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
            <div className="relative mb-8">
               <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
               <div className="relative bg-white p-6 rounded-full shadow-xl">
                 <Loader2 size={48} className="text-blue-600 animate-spin" />
               </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Your Menu</h2>
            <p className="text-gray-500 max-w-md">
              Gemini AI is reading your photos, identifying dishes, prices, and organizing categories. This may take a few seconds...
            </p>
          </div>
        );

      case 'editor':
        if (!menuData) return null;
        return (
          <MenuEditor 
            data={menuData} 
            onSave={handleSaveEditor} 
            onCancel={() => setStep('upload')} 
          />
        );

      case 'preview':
        if (!menuData) return null;
        return (
          <MenuPreview 
            data={menuData} 
            readonly={isCustomerView}
            onBack={isCustomerView ? undefined : () => setStep('editor')} 
            onShare={isCustomerView ? undefined : () => setStep('share')} 
          />
        );

      case 'share':
        if (!menuData) return null;
        return (
          <QRCodeShare 
            data={menuData} 
            onBack={() => setStep('preview')} 
          />
        );

      default:
        return null;
    }
  };

  // Logic for showing the "App" header vs the "Menu" header
  const showAppHeader = !isCustomerView && step !== 'preview' && step !== 'share';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {showAppHeader && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2" onClick={() => setStep('upload')} style={{cursor: 'pointer'}}>
              <div className="bg-black text-white p-1.5 rounded-lg">
                <ChefHat size={20} />
              </div>
              <span className="font-serif font-bold text-xl tracking-tight">SnapMenu</span>
            </div>
            {step === 'editor' && (
               <div className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                 Editing Mode
               </div>
            )}
          </div>
        </header>
      )}

      <main className={`max-w-5xl mx-auto ${step !== 'preview' && !isCustomerView ? 'p-6' : ''}`}>
        {error && (
           <div className="mx-6 mt-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="text-red-500">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
               </div>
               <p className="text-red-700 text-sm font-medium">{error}</p>
             </div>
             <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
               </svg>
             </button>
           </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
};

export default App;