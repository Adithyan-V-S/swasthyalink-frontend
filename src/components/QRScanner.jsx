import React, { useState, useRef, useEffect } from 'react';

const QRScanner = ({ onScan, onError, onClose, isActive }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setHasPermission(true);
      setIsScanning(true);
      
      // Start scanning for QR codes
      scanForQRCode();
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
      if (onError) {
        onError('Camera access denied or not available');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const scanForQRCode = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simple QR code detection (in a real app, you'd use a library like jsQR)
      // For now, we'll simulate QR detection
      detectQRCode(imageData);
    }

    // Continue scanning
    if (isScanning) {
      requestAnimationFrame(scanForQRCode);
    }
  };

  const detectQRCode = (imageData) => {
    // This is a placeholder for QR code detection
    // In a real implementation, you would use a library like jsQR
    // For demo purposes, we'll simulate detection after a few seconds
    
    // Simulate QR code detection
    setTimeout(() => {
      if (isScanning && Math.random() > 0.95) { // 5% chance per frame
        const mockQRData = 'https://yourapp.com/patient/mock-patient-id-12345';
        if (onScan) {
          onScan(mockQRData);
        }
        setIsScanning(false);
      }
    }, 100);
  };

  const handleManualInput = (qrData) => {
    if (qrData.trim() && onScan) {
      onScan(qrData.trim());
    }
  };

  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Requesting camera permission...</p>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 text-4xl mb-4">📷</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Access Required</h3>
        <p className="text-gray-600 mb-4">
          Please allow camera access to scan QR codes. You can also paste the QR code data manually below.
        </p>
        <ManualQRInput onSubmit={handleManualInput} />
        <button
          onClick={onClose}
          className="mt-4 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
        >
          Close Scanner
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-64 object-cover"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="hidden"
        />
        
        {/* Scanning overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Scanning frame */}
            <div className="w-48 h-48 border-2 border-white rounded-lg relative">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
              
              {/* Scanning line animation */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="w-full h-0.5 bg-blue-500 animate-pulse"></div>
              </div>
            </div>
            
            {/* Instructions */}
            <p className="text-white text-center mt-4 bg-black bg-opacity-50 px-3 py-1 rounded">
              Position QR code within the frame
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
          <button
            onClick={onClose}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Cancel
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-white text-sm">Scanning...</span>
          </div>
        </div>
      </div>

      {/* Manual input option */}
      <div className="mt-4">
        <ManualQRInput onSubmit={handleManualInput} />
      </div>
    </div>
  );
};

const ManualQRInput = ({ onSubmit }) => {
  const [qrData, setQrData] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (qrData.trim()) {
      onSubmit(qrData);
      setQrData('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Or paste QR code data manually:
        </label>
        <input
          type="text"
          value={qrData}
          onChange={(e) => setQrData(e.target.value)}
          placeholder="https://yourapp.com/patient/..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <button
        type="submit"
        disabled={!qrData.trim()}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Process QR Data
      </button>
    </form>
  );
};

export default QRScanner;
