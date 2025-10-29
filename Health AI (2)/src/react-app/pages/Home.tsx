import { useAuth } from "@getmocha/users-service/react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Heart, Activity, Brain, Shield, Stethoscope, FileImage } from "lucide-react";

export default function Home() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && user) {
      navigate("/dashboard");
    }
  }, [user, isPending, navigate]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg">
                <Heart className="w-12 h-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Health AI
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Advanced AI for preventive healthcare and medical analysis
            </p>
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              Detect health risks early, get intelligent medical consultations, and receive personalized preventive plans
            </p>
            <button
              onClick={redirectToLogin}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Your Health Journey
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Health AI Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced intelligent technologies for better health and more effective prevention
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileImage className="w-8 h-8" />}
              title="Smart Image Analysis"
              description="Upload lab test images and medical reports for instant AI-powered analysis"
              gradient="from-blue-500 to-cyan-500"
            />
            
            <FeatureCard
              icon={<Stethoscope className="w-8 h-8" />}
              title="Intelligent Health Assistant"
              description="Describe your symptoms and get accurate health risk assessments with high precision"
              gradient="from-indigo-500 to-purple-500"
            />
            
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="Early Prediction"
              description="AI algorithms predict disease risks based on family history and lifestyle patterns"
              gradient="from-purple-500 to-pink-500"
            />
            
            <FeatureCard
              icon={<Activity className="w-8 h-8" />}
              title="Personalized Prevention Plan"
              description="Dietary and exercise recommendations based on your personal and medical data"
              gradient="from-green-500 to-emerald-500"
            />
            
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Advanced Prevention"
              description="Comprehensive system for preventing chronic diseases like diabetes and hypertension"
              gradient="from-orange-500 to-red-500"
            />
            
            <FeatureCard
              icon={<Heart className="w-8 h-8" />}
              title="Regular Monitoring"
              description="Smart reminders for routine checkups and health progress tracking"
              gradient="from-pink-500 to-rose-500"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Your Journey to Better Health Today
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust Health AI for their healthcare needs
          </p>
          <button
            onClick={redirectToLogin}
            className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Sign Up Free Now
          </button>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl blur"></div>
      <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group-hover:border-gray-200">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${gradient} text-white mb-6`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
