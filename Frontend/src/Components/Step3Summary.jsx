import React, { useState } from 'react';
import axios from 'axios';

const Step3Summary = ({ onComplete, onContinue, onBack, data, previousData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summaryGenerated, setSummaryGenerated] = useState(false);
const API_BASE = "http://localhost:5000/api";


  const handleGenerateSummary = async () => {
    if (!previousData?.tests) {
      setError('No normalized test data available');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE}/generate-summary`, {
        tests: previousData.tests
      });
      onComplete(response.data);
      setSummaryGenerated(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Summary generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 text-center m-2">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
          <span className="text-white text-2xl">📊</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Clinical Summary</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-4 pb-4">
          {!summaryGenerated ? (
            <div className="space-y-4">
              {previousData && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
                  <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Input from Normalization
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white p-3 rounded-lg border border-blue-200">
                      <div className="text-gray-500 text-xs mb-1">Tests Processed</div>
                      <div className="text-xl font-bold text-gray-800">{previousData?.tests?.length || 0}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-blue-200">
                      <div className="text-gray-500 text-xs mb-1">Confidence</div>
                      <div className="text-xl font-bold text-blue-600">{((previousData?.normalization_confidence || 0) * 100).toFixed(1)}%</div>
                    </div>
                  </div>

                  {previousData?.tests && previousData.tests.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-semibold text-gray-700 text-xs mb-2 flex items-center">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                        Sample Normalized Tests
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {previousData.tests.slice(0, 3).map((test, idx) => (
                          <div key={idx} className="bg-white p-2 rounded border border-green-200">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-800 text-xs capitalize">{test.name}</span>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                test.status === 'high' ? 'bg-red-100 text-red-700' :
                                test.status === 'low' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {test.status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {test.value} {test.unit} 
                              <span className="text-gray-400 mx-1">•</span>
                              Ref: {test.ref_range?.low}-{test.ref_range?.high}
                            </div>
                          </div>
                        ))}
                        {previousData.tests.length > 3 && (
                          <div className="text-center text-gray-500 text-xs">
                            ... and {previousData.tests.length - 3} more tests
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={handleGenerateSummary}
                  disabled={loading || !previousData?.tests}
                  className="w-fit mx-auto bg-gradient-to-r from-purple-500 to-indigo-500 
                           text-white py-3 px-8 rounded-xl font-bold text-sm 
                           hover:from-purple-600 hover:to-indigo-600 
                           disabled:bg-gray-400 disabled:cursor-not-allowed 
                           transition duration-200 transform hover:scale-105 
                           shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating Summary...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">💡</span>
                      <span className="text-base">Generate Patient Summary</span>
                    </>
                  )}
                </button>
              </div>

              {!previousData?.tests && (
                <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-center justify-center space-x-2 text-yellow-700">
                    <span className="font-bold text-sm">No normalized data available</span>
                  </div>
                  <p className="text-yellow-700 text-xs mt-1">
                    Please complete Step 2 (Normalization) first.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
          

              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
                <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Patient Summary
                </h3>
                <p className="text-gray-800 text-sm leading-relaxed bg-white p-3 rounded border border-blue-200">
                  {data?.summary}
                </p>
              </div>

              {data?.explanations && data.explanations.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
                  <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Explanation
                  </h3>
                  <div className="space-y-2">
                    {data.explanations.map((explanation, index) => (
                      <div key={index} className="bg-white p-3 rounded border border-purple-200">
                        <div className="flex items-start space-x-2">
                          <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-purple-600 text-xs">•</span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center space-x-2 text-yellow-700">
                  <span className="font-bold text-sm">Ready for Final Report!</span>
                </div>
                <p className="text-yellow-700 text-xs mt-1">
                  Click "Final Report" to view the complete analysis.
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
        {summaryGenerated ? (
          <>
            <button
              onClick={() => setSummaryGenerated(false)}
              className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition duration-200 text-sm font-bold shadow flex items-center space-x-1"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <button
              onClick={onContinue}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition duration-200 text-sm font-bold shadow hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-1"
            >
              <span>Final Report</span>
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
            {!previousData?.tests && (
              <div className="text-gray-500 text-xs flex items-center">
                Complete normalization to continue
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Step3Summary;