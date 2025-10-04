import React, { useState } from 'react';
import axios from 'axios';

const Step1Extraction = ({ onComplete, onContinue, data }) => {
  const [inputText, setInputText] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('text');
  const [extractionDone, setExtractionDone] = useState(false);

const API_BASE = "https://aimedicalbackend.onrender.com";


   const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleTextExtraction = async () => {
    if (!inputText.trim()) {
      setError('Please enter medical report text');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE}/extract-text`, {
        text: inputText
      });
      onComplete(response.data);
      setExtractionDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Text extraction failed');
    } finally {
      setLoading(false);
    }
  };

const handleImageExtraction = async () => {
    if (!image) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      if (image.size > 10 * 1024 * 1024) { 
        setError('Image size too large. Please select a smaller image (max 10MB).');
        setLoading(false);
        return;
      }

      const compressedImage = await compressImage(image);
      const base64Image = compressedImage.split(',')[1];
      
      const response = await axios.post(`${API_BASE}/extract-text`, {
        image: base64Image,
        type: 'image'
      });
      onComplete(response.data);
      setExtractionDone(true);
    } catch (err) {
      if (err.response?.status === 413) {
        setError('Image size too large. Please try with a smaller image.');
      } else {
        setError(err.response?.data?.error || 'Image processing failed');
      }
    } finally {
      setLoading(false);
    }
  };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (PNG, JPG, JPEG)');
        return;
      }

      if (file.size > 10 * 1024 * 1024) { 
        setError('Image size too large. Please select an image smaller than 10MB.');
        return;
      }

      setImage(file);
      setError('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 text-center m-2">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
          <span className="text-white text-2xl">📄</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Data Extraction</h2>
      </div>

      {!extractionDone && (
        <div className="flex-shrink-0 flex space-x-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-2 mb-4 border border-blue-100">
          <button
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition duration-200 ${
              activeTab === 'text'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-blue-50 shadow'
            }`}
            onClick={() => setActiveTab('text')}
          >
            📝 Text Input
          </button>
          <button
            className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition duration-200 ${
              activeTab === 'image'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-blue-50 shadow'
            }`}
            onClick={() => setActiveTab('image')}
          >
            🖼️ Image Upload
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-4 pb-4">
          {!extractionDone ? (
            <>
              {activeTab === 'text' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Medical Report Text
                    </label>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste medical report text here...
Example: CBC Report - Hemoglobin: 12.5 g/dL, WBC: 8,200 /uL, Platelets: 250,000 /uL"
                      className="w-full h-32 px-3 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm placeholder-gray-400 bg-white shadow-inner"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="text-center">
                    <button
                      onClick={handleTextExtraction}
                      disabled={loading || !inputText.trim()}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-xl font-bold text-sm hover:from-green-600 hover:to-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 mx-auto"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing Text...</span>
                        </>
                      ) : (
                        <span>Extract Medical Data</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'image' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Upload Medical Report Image
                    </label>
                    <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center flex flex-col items-center justify-center hover:border-blue-500 transition duration-200 bg-gradient-to-br from-blue-50 to-cyan-50 min-h-[150px]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="fileInput"
                        disabled={loading}
                      />
                      <label htmlFor="fileInput" className="cursor-pointer">
                        <div className="text-gray-600">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <span className="text-white text-2xl">📁</span>
                          </div>
                          <p className="text-lg font-bold text-gray-700 mb-1">Upload Medical Report</p>
                          <p className="text-sm text-gray-600">Drag & drop or click to browse</p>
                          <p className="text-xs text-gray-500 mt-2">Supports: PNG, JPG, JPEG</p>
                        </div>
                      </label>
                    </div>
                    {image && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                        <div className="flex items-center space-x-2 text-green-700">
                          <span className="text-lg">✅</span>
                          <div>
                            <span className="font-bold text-sm">Selected: </span>
                            <span className="text-sm">{image.name}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <button
                      onClick={handleImageExtraction}
                      disabled={loading || !image}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-xl font-bold text-sm hover:from-green-600 hover:to-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 mx-auto"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing Image...</span>
                        </>
                      ) : (
                        <>
                          <span>🔍</span>
                          <span>Extract from Image</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
           

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-sm">
                  <div className="text-gray-500 text-xs mb-1">Tests Identified</div>
                  <div className="text-2xl font-bold text-gray-800">{data?.tests_raw?.length || 0}</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-sm">
                  <div className="text-gray-500 text-xs mb-1">Confidence</div>
                  <div className="text-2xl font-bold text-green-600">{((data?.confidence || 0) * 100).toFixed(1)}%</div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
                <h4 className="font-bold text-gray-700 text-sm mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Extracted Tests
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {data?.tests_raw?.map((test, idx) => (
                    <div key={idx} className="bg-white p-2 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-blue-500 text-xs">•</span>
                        <span className="text-gray-700 text-sm font-mono">{test}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center space-x-2 text-yellow-700">
                  <span className="font-bold text-sm">Ready for the next step!</span>
                </div>
                <p className="text-yellow-700 text-xs mt-1">
                  Click "Continue" to proceed with data standardization.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2 text-red-700">
                <span className="text-lg">⚠️</span>
                <span className="font-bold text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 flex justify-between pt-4 border-t border-gray-200 mt-2">
        {extractionDone ? (
          <>
            <button
              onClick={() => setExtractionDone(false)}
              className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition duration-200 text-sm font-bold shadow flex items-center space-x-1"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <button
              onClick={onContinue}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition duration-200 text-sm font-bold shadow hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-1"
            >
              <span>Continue</span>
              <span>→</span>
            </button>
          </>
        ) : (
          <div className="w-full text-center text-gray-500 text-xs">
            Complete data extraction to continue
          </div>
        )}
      </div>
    </div>
  );
};

export default Step1Extraction;
