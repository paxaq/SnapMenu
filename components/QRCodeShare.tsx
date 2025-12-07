import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { ArrowLeft, Download, ExternalLink, Copy, Check } from 'lucide-react';
import { MenuData } from '../types';
import { generateShareUrl } from '../services/urlBackend';

interface QRCodeShareProps {
  data: MenuData;
  onBack: () => void;
}

const QRCodeShare: React.FC<QRCodeShareProps> = ({ data, onBack }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = generateShareUrl(data);
  
  // Warning if URL is getting dangerously long for a QR code
  const isTooLong = shareUrl.length > 2500;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = document.getElementById("menu-qr-code");
    if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            if (ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                const pngFile = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.download = `${data.restaurantName.replace(/\s+/g, '_')}_Menu_QR.png`;
                downloadLink.href = pngFile;
                downloadLink.click();
            }
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-serif font-bold text-gray-900">Your Menu is Ready!</h2>
        <p className="text-gray-500 max-w-md">Print this QR code to let customers instantly view your digitized menu.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center transform transition-all hover:scale-[1.01]">
        <div className="mb-6 text-center">
             <h3 className="font-bold text-xl text-gray-900">{data.restaurantName}</h3>
             <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mt-1">Scan for Menu</p>
        </div>
        
        <div className="bg-white p-2 rounded-xl border-4 border-gray-900">
            <QRCode 
                id="menu-qr-code"
                value={shareUrl} 
                size={220} 
                level="L" // Lower error correction allows for more data
                fgColor="#000000"
                bgColor="#ffffff"
            />
        </div>
        
        <p className="mt-6 text-sm text-gray-400 font-medium">Powered by SnapMenu</p>
      </div>

      {isTooLong && (
          <div className="text-xs text-amber-600 bg-amber-50 px-4 py-2 rounded-lg max-w-xs text-center">
              ⚠️ Large menu size. Some older QR scanners might have trouble.
          </div>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs pt-4">
         <button 
           onClick={handleDownload}
           className="flex items-center justify-center gap-2 bg-gray-900 text-white py-3.5 rounded-xl font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
         >
            <Download size={18} /> Download QR Code
         </button>

         <div className="flex gap-2">
            <button 
                onClick={() => window.open(shareUrl, '_blank')}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
                <ExternalLink size={18} /> Test Link
            </button>
            <button 
                onClick={handleCopy}
                className="flex items-center justify-center px-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                title="Copy URL"
            >
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
            </button>
         </div>

         <button 
           onClick={onBack}
           className="flex items-center justify-center gap-2 text-gray-500 py-3 rounded-xl font-medium hover:text-gray-900 mt-2"
         >
            <ArrowLeft size={18} /> Back to Editor
         </button>
      </div>
    </div>
  );
};

export default QRCodeShare;