import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Layout from "@/react-app/components/Layout";
import { 
  History, 
  FileImage, 
  MessageSquare, 
  Shield, 
  Eye
} from "lucide-react";
import type { MedicalTest, Consultation, PreventivePlan } from "@/shared/types";

interface MedicalHistoryData {
  tests: MedicalTest[];
  consultations: Consultation[];
  plans: PreventivePlan[];
}

export default function MedicalHistoryPage() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<MedicalHistoryData>({
    tests: [],
    consultations: [],
    plans: []
  });
  const [activeTab, setActiveTab] = useState<"tests" | "consultations" | "plans">("tests");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    if (!isPending && !user) {
      navigate("/");
      return;
    }

    if (user) {
      fetchHistory();
    }
  }, [user, isPending, navigate]);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/medical-history");
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "عالي":
      case "طارئ":
        return "bg-red-100 text-red-800 border-red-200";
      case "متوسط":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const tabs = [
    { id: "tests", name: "الفحوصات الطبية", icon: FileImage, count: history.tests.length },
    { id: "consultations", name: "الاستشارات", icon: MessageSquare, count: history.consultations.length },
    { id: "plans", name: "الخطط الوقائية", icon: Shield, count: history.plans.length },
  ];

  if (isPending || loading) {
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
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <History className="w-6 h-6 text-blue-600 ml-3" />
                <h1 className="text-2xl font-bold text-gray-900">التاريخ الطبي</h1>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="text-right">
                  <p className="text-sm text-gray-600">إجمالي السجلات</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {history.tests.length + history.consultations.length + history.plans.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 space-x-reverse px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 ml-2" />
                      {tab.name}
                      <span className="mr-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                        {tab.count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Medical Tests Tab */}
            {activeTab === "tests" && (
              <div className="space-y-4">
                {history.tests.length === 0 ? (
                  <EmptyState
                    icon={FileImage}
                    title="لا توجد فحوصات طبية"
                    description="لم تقم برفع أي صور للفحوصات الطبية بعد"
                    actionText="رفع فحص جديد"
                    onAction={() => navigate("/medical-test")}
                  />
                ) : (
                  history.tests.map((test) => (
                    <div
                      key={test.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => setSelectedItem(test)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileImage className="w-5 h-5 text-blue-600 ml-3" />
                          <div>
                            <h3 className="font-medium text-gray-900">{test.test_type}</h3>
                            <p className="text-sm text-gray-600">
                              تاريخ الفحص: {test.test_date ? new Date(test.test_date).toLocaleDateString('ar-SA') : 'غير محدد'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 ml-3">
                            {formatDate(test.created_at!)}
                          </span>
                          <Eye className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Consultations Tab */}
            {activeTab === "consultations" && (
              <div className="space-y-4">
                {history.consultations.length === 0 ? (
                  <EmptyState
                    icon={MessageSquare}
                    title="لا توجد استشارات"
                    description="لم تقم بإجراء أي استشارات صحية ذكية بعد"
                    actionText="بدء استشارة جديدة"
                    onAction={() => navigate("/consultation")}
                  />
                ) : (
                  history.consultations.map((consultation) => (
                    <div
                      key={consultation.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => setSelectedItem(consultation)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MessageSquare className="w-5 h-5 text-green-600 ml-3" />
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="font-medium text-gray-900 ml-3">استشارة صحية</h3>
                              {consultation.risk_level && (
                                <span className={`px-2 py-1 rounded-full text-xs border ${getRiskLevelColor(consultation.risk_level)}`}>
                                  {consultation.risk_level}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 truncate max-w-md">
                              {consultation.symptoms}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 ml-3">
                            {formatDate(consultation.created_at!)}
                          </span>
                          <Eye className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Plans Tab */}
            {activeTab === "plans" && (
              <div className="space-y-4">
                {history.plans.length === 0 ? (
                  <EmptyState
                    icon={Shield}
                    title="لا توجد خطط وقائية"
                    description="لم تقم بإنشاء أي خطط وقائية مخصصة بعد"
                    actionText="إنشاء خطة وقائية"
                    onAction={() => navigate("/preventive-plan")}
                  />
                ) : (
                  history.plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => setSelectedItem(plan)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Shield className="w-5 h-5 text-purple-600 ml-3" />
                          <div>
                            <h3 className="font-medium text-gray-900">خطة وقائية شاملة</h3>
                            <p className="text-sm text-gray-600">
                              نوع الخطة: {plan.plan_type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 ml-3">
                            {formatDate(plan.created_at!)}
                          </span>
                          <Eye className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedItem.test_type || selectedItem.plan_type || "تفاصيل الاستشارة"}
                  </h2>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-right">
                  {selectedItem.ai_analysis || selectedItem.ai_response || selectedItem.diet_recommendations || "لا توجد تفاصيل متاحة"}
                </div>
                
                {selectedItem.created_at && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 text-right">
                      تاريخ الإنشاء: {formatDate(selectedItem.created_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function EmptyState({ icon: Icon, title, description, actionText, onAction }: {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
}) {
  return (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <button
        onClick={onAction}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        {actionText}
      </button>
    </div>
  );
}
