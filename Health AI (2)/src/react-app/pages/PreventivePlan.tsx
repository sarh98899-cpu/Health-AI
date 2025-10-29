import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { Shield, Loader2, AlertCircle, CheckCircle, Heart, Apple, Dumbbell, Calendar } from "lucide-react";

export default function PreventivePlanPage() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
      return;
    }

    if (user) {
      checkProfile();
    }
  }, [user, isPending, navigate]);

  const checkProfile = async () => {
    try {
      const response = await fetch("/api/health-profile");
      if (response.ok) {
        const profile = await response.json();
        setHasProfile(!!profile);
      }
    } catch (error) {
      console.error("Error checking profile:", error);
    }
  };

  const generatePlan = async () => {
    if (!hasProfile) {
      setError("Please complete your health profile first to get a personalized plan");
      return;
    }

    setLoading(true);
    setError(null);
    setPlan(null);

    try {
      const response = await fetch("/api/preventive-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setPlan(data.plan);
      } else {
        setError(data.error || "Error creating preventive plan");
      }
    } catch (error) {
      console.error("Error generating plan:", error);
      setError("Error creating preventive plan");
    } finally {
      setLoading(false);
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
              <Shield className="w-6 h-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Personalized Prevention Plan</h1>
            </div>
            <p className="text-gray-600 mt-2">
              Get a comprehensive prevention plan based on your personal health information
            </p>
          </div>

          <div className="p-6">
            {!plan ? (
              <div className="space-y-6">
                {/* Profile Check */}
                {!hasProfile ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <AlertCircle className="w-6 h-6 text-amber-600 mr-3" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-amber-800">
                          Health Profile Must Be Completed First
                        </h3>
                        <p className="text-amber-700 mt-2">
                          To create a personalized and accurate prevention plan, we need your complete health information.
                          Please complete your health profile first.
                        </p>
                        <button
                          onClick={() => navigate("/profile")}
                          className="mt-4 bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
                        >
                          Complete Health Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Plan Generation */}
                    <div className="text-center py-12">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                        <Shield className="w-12 h-12 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Ready to Create Your Prevention Plan?
                      </h2>
                      <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        We'll analyze your health information and create a comprehensive prevention plan including:
                      </p>
                      
                      <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-green-50 p-6 rounded-lg">
                          <Apple className="w-8 h-8 text-green-600 mx-auto mb-3" />
                          <h3 className="font-semibold text-green-900 mb-2">Nutrition</h3>
                          <p className="text-green-700 text-sm">
                            Personalized diet plan suitable for your health condition
                          </p>
                        </div>
                        
                        <div className="bg-blue-50 p-6 rounded-lg">
                          <Dumbbell className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                          <h3 className="font-semibold text-blue-900 mb-2">Exercise</h3>
                          <p className="text-blue-700 text-sm">
                            Exercise program suitable for your age and health condition
                          </p>
                        </div>
                        
                        <div className="bg-purple-50 p-6 rounded-lg">
                          <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                          <h3 className="font-semibold text-purple-900 mb-2">Follow-up</h3>
                          <p className="text-purple-700 text-sm">
                            Schedule for routine checkups and health monitoring
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={generatePlan}
                        disabled={loading}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Creating Plan...
                          </>
                        ) : (
                          <>
                            <Shield className="w-5 h-5 mr-2" />
                            Create Prevention Plan
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* What to Expect */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    What to Expect in Your Prevention Plan?
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                      <p className="text-gray-700 text-sm">
                        Personalized dietary recommendations based on your health condition and medical history
                      </p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                      <p className="text-gray-700 text-sm">
                        Exercise program suitable for your age and fitness level
                      </p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                      <p className="text-gray-700 text-sm">
                        Lifestyle improvement tips and chronic disease prevention
                      </p>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                      <p className="text-gray-700 text-sm">
                        Schedule for routine checkups and medical follow-ups
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Generated Plan */
              <div className="space-y-6">
                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-green-900">
                      Your Prevention Plan Created Successfully!
                    </h3>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    Comprehensive plan tailored to your health condition and lifestyle
                  </p>
                </div>

                {/* Plan Content */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Your Personalized Prevention Plan
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {plan}
                    </div>
                  </div>
                </div>

                {/* Important Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Important Advice</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        This plan is based on available information and is for guidance purposes. 
                        It is recommended to discuss this plan with your specialist doctor before implementing it.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      setPlan(null);
                      setError(null);
                    }}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Create New Plan
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Back to Dashboard
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
