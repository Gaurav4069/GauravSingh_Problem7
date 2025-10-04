import React, { useState } from 'react';
import axios from 'axios';

const Step4Complete = ({ onBack, data, previousData, onReset }) => {
  const [inputText, setInputText] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(data);
  const [activeTab, setActiveTab] = useState('text');

const API_BASE = "https://aimedicalbackend.onrender.com/api";


  const handleCompleteProcess = async () => {
    let requestData = {};
    
    if (activeTab === 'text' && inputText.trim()) {
      requestData = { text: inputText };
    } else if (activeTab === 'image' && image) {
      const base64Image = await convertImageToBase64(image);
      requestData = { image: base64Image, type: 'image' };
    } else {
      setError('Please provide text or image input');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE}/process-complete`, requestData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Complete processing failed');
    } finally {
      setLoading(false);
    }
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result.split(',')[1]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setError('');
    } else {
      setError('Please select a valid image file');
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Step 4: Complete Pipeline</h2>
        <p className="text-gray-600">Run all steps together with new input</p>
      </div>

      <div className="mb-8">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`flex-1 py-4 font-medium text-lg ${
              activeTab === 'text'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('text')}
          >
            📝 New Text Input
          </button>
          <button
            className={`flex-1 py-4 font-medium text-lg ${
              activeTab === 'image'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('image')}
          >
            🖼️ New Image Upload
          </button>
        </div>

        {activeTab === 'text' && (
          <div className="space-y-4">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter new medical report text..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        )}

        {activeTab === 'image' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="completeFileInput"
              />
              <label htmlFor="completeFileInput" className="cursor-pointer">
                <div className="text-gray-500">
                  <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Click to upload new medical report image</p>
                </div>
              </label>
            </div>
            {image && <p className="text-green-600"> Selected: {image.name}</p>}
          </div>
        )}

        <button
          onClick={handleCompleteProcess}
          disabled={loading || (activeTab === 'text' && !inputText.trim()) || (activeTab === 'image' && !image)}
          className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 mt-4"
        >
          {loading ? '🚀 Processing Complete Pipeline...' : 'Run Complete Pipeline'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium"> {error}</p>
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2"> Final Summary</h3>
            <p className="text-blue-900">{result.summary}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-3"> Test Results</h3>
            <div className="space-y-3">
              {result.tests?.map((test, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-gray-800 capitalize">
                      {test.name}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      test.status === 'high' ? 'bg-red-100 text-red-800' :
                      test.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {test.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Value: <strong>{test.value} {test.unit}</strong>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Normal range: {test.ref_range?.low} - {test.ref_range?.high} {test.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
        >
          ← Back to Summary
        </button>
        
        <button
          onClick={onReset}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-200"
        >
           Start New Process
        </button>
      </div>
    </div>
  );
};

export default Step4Complete;
