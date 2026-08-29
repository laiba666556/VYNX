import { useState } from 'react';

function App() {
  const [inputType, setInputType] = useState<'url' | 'message' | 'email'>('url');
  const [content, setContent] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setResult(null);

    try {
         const response = await fetch('/api/scan',  {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_type: inputType, content: content }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Scan failed:', error);
      alert('Failed to connect to backend. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 25) return 'text-green-600';
    if (score <= 50) return 'text-yellow-600';
    if (score <= 75) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">VYNX Threat Scanner</h1>
        <p className="text-gray-500 text-center mb-6">AI-Powered Phishing & Scam Detection</p>

        <div className="flex gap-2 mb-4">
          {(['url', 'message', 'email'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setInputType(type)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium capitalize transition ${
                inputType === type 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={inputType === 'url' ? 'Paste URL here...' : 'Paste message or email content here...'}
          className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none mb-4"
        />

        <button
          onClick={handleScan}
          disabled={loading || !content.trim()}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Analyzing...' : 'Scan for Threats'}
        </button>

        {result && (
          <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Scan Result</h2>
              <span className={`text-3xl font-black ${getScoreColor(result.risk_score)}`}>
                {result.risk_score}/100
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">Verdict</p>
                <p className="font-semibold text-lg">{result.verdict}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Risk Level</p>
                <p className="font-semibold text-lg">{result.risk_level}</p>
              </div>
            </div>

            {result.signals.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Triggered Signals:</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {result.signals.map((signal: string, idx: number) => (
                    <li key={idx}>{signal}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.ai_available && result.ai_explanation && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-800 mb-1">🤖 AI Analysis:</p>
                <p className="text-sm text-blue-700">{result.ai_explanation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;