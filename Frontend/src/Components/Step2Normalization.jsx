import React, { useState } from 'react';
import axios from 'axios';

const Step2Normalization = ({ onComplete, onContinue, onBack, data, previousData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [normalizationDone, setNormalizationDone] = useState(false);

const API_BASE = "https://aimedicalbackend.onrender.com/api";


  const handleNormalize = async () => {
    if (!previousData?.tests_raw) {
      setError('No test data available for normalization');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE}/normalize-tests`, {
        tests_raw: previousData.tests_raw
      });
      onComplete(response.data);
      setNormalizationDone(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Normalization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 text-center m-2">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
          <span className="text-white text-2xl">🔧</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Data Normalization</h2>
      </div>

      {!normalizationDone && (
        <div className="flex-shrink-0 mb-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
          <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Input from Extraction
          </h3>
          {previousData ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="text-gray-500 text-xs mb-1">Tests Found</div>
                <div className="text-xl font-bold text-gray-800">{previousData.tests_raw?.length || 0}</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="text-gray-500 text-xs mb-1">Confidence</div>
                <div className="text-xl font-bold text-blue-600">{((previousData.confidence || 0) * 100).toFixed(1)}%</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 bg-white rounded-lg border border-blue-200">
              <span className="text-sm">No extraction data available</span>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-4 pb-4">
          {!normalizationDone ? (
            <div className="text-center">
              <button
                onClick={handleNormalize}
                disabled={loading || !previousData?.tests_raw}
                className="w-fit mx-auto bg-gradient-to-r from-orange-500 to-amber-500 
                         text-white py-3 px-6 rounded-xl font-bold text-sm 
                         hover:from-orange-600 hover:to-amber-600 
                         disabled:bg-gray-400 disabled:cursor-not-allowed 
                         transition duration-200 transform hover:scale-105 
                         shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Normalizing Data...</span>
                  </>
                ) : (
                  <span>Normalize Medical Data</span>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <div className="text-gray-500 text-xs mb-1">Tests Processed</div>
                  <div className="text-2xl font-bold text-gray-800">{data?.tests?.length || 0}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-green-200">
                  <div className="text-gray-500 text-xs mb-1">Confidence</div>
                  <div className="text-2xl font-bold text-green-600">{((data?.normalization_confidence || 0) * 100).toFixed(1)}%</div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
                <h4 className="font-bold text-gray-700 text-sm mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Normalized Results
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {data?.tests?.length > 0 ? (
                    data.tests.map((test, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-purple-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-gray-800 capitalize text-sm">{test.name}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            test.status === 'high' ? 'bg-red-100 text-red-700 border border-red-200' :
                            test.status === 'low' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                            'bg-green-100 text-green-700 border border-green-200'
                          }`}>
                            {test.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-semibold">{test.value} {test.unit}</span>
                          <span className="text-gray-400 mx-2">•</span>
                          <span>Ref: {test.ref_range?.low}-{test.ref_range?.high}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 text-sm">No tests available</div>
                  )}
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center space-x-2 text-yellow-700">
                  <span className="font-bold text-sm">Ready for summary generation!</span>
                </div>
                <p className="text-yellow-700 text-xs mt-1">
                  Click "Continue" to generate patient-friendly Summary.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2 text-red-700">
                <span className="font-bold text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 flex justify-between pt-4 border-t border-gray-200 mt-2">
        {normalizationDone ? (
          <>
            <button
              onClick={() => setNormalizationDone(false)}
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
          <>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition duration-200 text-sm font-bold shadow flex items-center space-x-1"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <div className="text-gray-500 text-xs flex items-center">
              Complete normalization to continue
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Step2Normalization;
