import { useAuth } from "@getmocha/users-service/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function AuthCallback() {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
        setStatus("success");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "حدث خطأ في تسجيل الدخول");
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                جاري تسجيل الدخول...
              </h2>
              <p className="text-gray-600">
                يرجى الانتظار بينما نقوم بتأكيد هويتك
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                تم تسجيل الدخول بنجاح!
              </h2>
              <p className="text-gray-600">
                سيتم توجيهك إلى لوحة التحكم خلال ثوانٍ...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-6">
                <AlertCircle className="w-16 h-16 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                فشل في تسجيل الدخول
              </h2>
              <p className="text-gray-600 mb-6">
                {error}
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                العودة للصفحة الرئيسية
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
