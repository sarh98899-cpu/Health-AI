import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { 
  Heart, 
  FileImage, 
  MessageSquare, 
  Shield, 
  TrendingUp, 
  Calendar,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface DashboardStats {
  totalTests: number;
  totalConsultations: number;
  lastRiskLevel: string;
  hasProfile: boolean;
}

export default function Dashboard() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalTests: 0,
    totalConsultations: 0,
    lastRiskLevel: "Low",
    hasProfile: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
      return;
    }

    if (user) {
      fetchDashboardData();
    }
  }, [user, isPending, navigate]);

  const fetchDashboardData = async () => {
    try {
      const [profileResponse, historyResponse] = await Promise.all([
        fetch("/api/health-profile"),
        fetch("/api/medical-history")
      ]);

      const profile = await profileResponse.json();
      const history = await historyResponse.json();

      setStats({
        totalTests: history.tests?.length || 0,
        totalConsultations: history.consultations?.length || 0,
        lastRiskLevel: history.consultations?.[0]?.risk_level || "Low",
        hasProfile: !!profile
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  const quickActions = [
    {
      title: "Analyze Medical Images",
      description: "Upload your test images for instant analysis",
      icon: FileImage,
      path: "/medical-test",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Smart Consultation",
      description: "Describe your symptoms and get an initial assessment",
      icon: MessageSquare,
      path: "/consultation",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Prevention Plan",
      description: "Get a personalized health plan tailored for you",
      icon: Shield,
      path: "/preventive-plan",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Health Profile",
      description: "Complete your health information for better results",
      icon: Heart,
      path: "/profile",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {user?.google_user_data?.given_name || "User"}
          </h1>
          <p className="text-gray-600">
            Here's an overview of your health and latest updates in your medical profile
          </p>
        </div>

        {/* Profile Completion Alert */}
        {!stats.hasProfile && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-amber-600 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800">
                  Complete Your Health Profile
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  You haven't completed your health profile yet. Complete it for more accurate analysis.
                </p>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700 transition-colors"
              >
                Complete Now
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Medical Tests"
            value={stats.totalTests.toString()}
            icon={FileImage}
            color="text-blue-600"
          />
          <StatCard
            title="Consultations"
            value={stats.totalConsultations.toString()}
            icon={MessageSquare}
            color="text-green-600"
          />
          <StatCard
            title="Last Risk Assessment"
            value={stats.lastRiskLevel}
            icon={TrendingUp}
            color={stats.lastRiskLevel === "High" ? "text-red-600" : stats.lastRiskLevel === "Medium" ? "text-yellow-600" : "text-green-600"}
          />
          <StatCard
            title="Profile Status"
            value={stats.hasProfile ? "Complete" : "Incomplete"}
            icon={stats.hasProfile ? CheckCircle : AlertTriangle}
            color={stats.hasProfile ? "text-green-600" : "text-amber-600"}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <QuickActionCard
                key={action.path}
                title={action.title}
                description={action.description}
                icon={action.icon}
                color={action.color}
                onClick={() => navigate(action.path)}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Recent Activity
          </h2>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activities</p>
            <p className="text-sm mt-2">Start using our services to see your activity here</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon: Icon, color }: {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <Icon className={`w-8 h-8 ${color} mr-3`} />
        <div className="flex-1">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, icon: Icon, color, onClick }: {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow group"
    >
      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${color} text-white mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </button>
  );
}
