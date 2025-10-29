import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { MessageSquare, Send, Loader2, AlertCircle, CheckCircle, Heart } from "lucide-react";

export default function ConsultationPage() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ response: string; riskLevel: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
    }
  }, [user, isPending, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symptoms.trim()) {
      setError("Please describe your symptoms");
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptoms: symptoms.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          response: data.response,
          riskLevel: data.riskLevel
        });
      } else {
        setError(data.error || "Error analyzing symptoms");
      }
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      setError("Error analyzing symptoms");
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
      case "emergency":
        return "bg-red-50 border-red-200 text-red-800";
      case "medium":
      case "moderate":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-green-50 border-green-200 text-green-800";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
      case "emergency":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "medium":
      case "moderate":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  if (isPending) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <MessageSquare className="w-6 h-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Smart Health Consultation</h1>
            </div>
            <p className="text-gray-600 mt-2">
              Describe your symptoms in detail and get an intelligent preliminary health risk assessment and recommendations
            </p>
          </div>

          <div className="p-6">
            {!result ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Symptoms Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symptom Description *
                  </label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={8}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your symptoms in detail... For example:
• When did the symptoms start?
• How severe is the pain or symptoms?
• Are there specific times when symptoms worsen?
• Any factors that improve or worsen the condition?
• Any accompanying symptoms?

The more detailed the information, the more accurate the analysis."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Enter a detailed description of your symptoms for the best analysis
                  </p>
                </div>

                {/* Important Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Heart className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Important Note</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        This is a preliminary consultation powered by AI and is not a substitute for medical examination. 
                        For serious or emergency symptoms, please visit the emergency department immediately.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={analyzing || !symptoms.trim()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Analyze Symptoms
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Results */
              <div className="space-y-6">
                {/* Risk Level Badge */}
                <div className={`border rounded-lg p-4 ${getRiskLevelColor(result.riskLevel)}`}>
                  <div className="flex items-center mb-2">
                    {getRiskIcon(result.riskLevel)}
                    <h3 className="text-lg font-semibold ml-2">
                      Risk Level: {result.riskLevel}
                    </h3>
                  </div>
                  <p className="text-sm">
                    {result.riskLevel.toLowerCase() === "high" || result.riskLevel.toLowerCase() === "emergency"
                      ? "Recommended to see a doctor as soon as possible"
                      : result.riskLevel.toLowerCase() === "medium" || result.riskLevel.toLowerCase() === "moderate"
                      ? "Recommended to monitor symptoms and see a doctor if they persist or worsen"
                      : "Low risk level, but continue monitoring symptoms"
                    }
                  </p>
                </div>

                {/* Analysis Results */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Analysis and Recommendations
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {result.response}
                    </div>
                  </div>
                </div>

                {/* Emergency Warning for High Risk */}
                {(result.riskLevel.toLowerCase() === "high" || result.riskLevel.toLowerCase() === "emergency") && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-6 h-6 text-red-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="text-base font-semibold text-red-800">Important Warning</h4>
                        <p className="text-red-700 mt-1">
                          Based on the symptoms mentioned, it is strongly recommended to see a doctor or visit the emergency department as soon as possible. 
                          Do not delay seeking medical help.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-amber-800">Disclaimer</h4>
                      <p className="text-amber-700 text-sm mt-1">
                        This analysis is provided by AI and is for reference only. 
                        It does not replace direct medical consultation and clinical examination by a qualified physician.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      setResult(null);
                      setSymptoms("");
                      setError(null);
                    }}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    New Consultation
                  </button>
                  <button
                    onClick={() => navigate("/history")}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Medical History
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
