import React, { useRef } from 'react';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { UploadedImage } from '../types';

interface PhotoUploaderProps {
  images: UploadedImage[];
  setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  onProcess: () => void;
  isProcessing: boolean;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ images, setImages, onProcess, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newImages: UploadedImage[] = [];
      
      for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i];
        const reader = new FileReader();
        
        await new Promise<void>((resolve) => {
          reader.onload = (e) => {
            const result = e.target?.result as string;
            // Extract base64 part
            const base64 = result.split(',')[1];
            newImages.push({
              id: Math.random().toString(36).substr(2, 9),
              url: result,
              base64: base64,
              mimeType: file.type
            });
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
      
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Digitize Your Menu</h2>
        <p className="text-gray-500">Take photos of your physical menu to instantly create a mobile-friendly QR code menu.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors group"
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />
          <div className="bg-blue-100 p-3 rounded-full mb-3 group-hover:bg-blue-200 transition-colors">
            <Upload className="text-blue-600" size={24} />
          </div>
          <p className="font-medium text-gray-700">Click to upload photos</p>
          <p className="text-sm text-gray-400 mt-1">Supports multiple pages (JPG, PNG)</p>
        </div>

        {images.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            {images.map(img => (
              <div key={img.id} className="relative group aspect-[3/4] rounded-lg overflow-hidden border border-gray-200">
                <img src={img.url} alt="Menu preview" className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onProcess}
        disabled={images.length === 0 || isProcessing}
        className={`w-full py-4 rounded-xl text-lg font-semibold shadow-lg transition-all ${
          images.length === 0 || isProcessing
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
        }`}
      >
        {isProcessing ? 'Analyzing Menu...' : `Generate Menu (${images.length} pages)`}
      </button>
    </div>
  );
};

export default PhotoUploader;
