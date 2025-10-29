import { Hono } from "hono";
import { cors } from "hono/cors";
import OpenAI from "openai";
import {
  authMiddleware,
  getOAuthRedirectUrl,
  exchangeCodeForSessionToken,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";
import {
  HealthProfileSchema,
  SymptomAnalysisRequestSchema,
} from "@/shared/types";

interface ExtendedEnv extends Env {
  MOCHA_USERS_SERVICE_API_URL: string;
  MOCHA_USERS_SERVICE_API_KEY: string;
  OPENAI_API_KEY: string;
}

const app = new Hono<{ Bindings: ExtendedEnv }>();

app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// Authentication endpoints
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Health profile endpoints
app.get("/api/health-profile", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM health_profiles WHERE user_id = ? ORDER BY created_at DESC LIMIT 1"
  ).bind(user.id).all();

  return c.json(results[0] || null);
});

app.post("/api/health-profile", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  const body = await c.req.json();
  const validatedData = HealthProfileSchema.parse({ ...body, user_id: user.id });

  const { success } = await c.env.DB.prepare(`
    INSERT OR REPLACE INTO health_profiles 
    (user_id, age, gender, height_cm, weight_kg, family_history, chronic_conditions, medications, lifestyle_info, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    validatedData.user_id,
    validatedData.age,
    validatedData.gender,
    validatedData.height_cm,
    validatedData.weight_kg,
    validatedData.family_history,
    validatedData.chronic_conditions,
    validatedData.medications,
    validatedData.lifestyle_info
  ).run();

  return c.json({ success });
});

// Medical test image analysis
app.post("/api/analyze-image", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  const formData = await c.req.formData();
  const imageFile = formData.get("image") as File;
  const testType = formData.get("test_type") as string;
  const testDate = formData.get("test_date") as string;

  if (!imageFile || !testType) {
    return c.json({ error: "Image and test type are required" }, 400);
  }

  // Upload image to R2
  const fileName = `medical-tests/${user.id}/${Date.now()}-${imageFile.name}`;
  await c.env.R2_BUCKET.put(fileName, imageFile, {
    httpMetadata: {
      contentType: imageFile.type,
    },
  });

  // Analyze image with OpenAI Vision
  const openai = new OpenAI({
    apiKey: c.env.OPENAI_API_KEY,
  });

  const imageBuffer = await imageFile.arrayBuffer();
  const base64Image = Buffer.from(imageBuffer).toString('base64');

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `أنت طبيب خبير متخصص في تحليل الفحوصات المخبرية والتقارير الطبية. قم بتحليل الصورة المرفقة واستخرج المعلومات التالية:
        
        1. نوع الفحص
        2. القيم الرئيسية والنتائج
        3. تقييم للمخاطر (منخفض/متوسط/عالي)
        4. التوصيات والإرشادات
        5. ما إذا كان يحتاج لمراجعة طبية عاجلة
        
        يرجى الرد باللغة العربية وبشكل واضح ومفهوم.`
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `هذا فحص من نوع: ${testType}. يرجى تحليل النتائج وإعطاء تقييم شامل.`
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${imageFile.type};base64,${base64Image}`
            }
          }
        ]
      }
    ]
  });

  const analysis = response.choices[0]?.message?.content || "تعذر تحليل الصورة";

  // Save to database
  const { success } = await c.env.DB.prepare(`
    INSERT INTO medical_tests 
    (user_id, test_type, test_date, image_url, original_filename, ai_analysis, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    user.id,
    testType,
    testDate || new Date().toISOString().split('T')[0],
    fileName,
    imageFile.name,
    analysis
  ).run();

  return c.json({ success, analysis });
});

// Symptom consultation
app.post("/api/consultation", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  
  const body = await c.req.json();
  const validatedData = SymptomAnalysisRequestSchema.parse(body);

  // Get user's health profile for context
  const { results: profileResults } = await c.env.DB.prepare(
    "SELECT * FROM health_profiles WHERE user_id = ? ORDER BY created_at DESC LIMIT 1"
  ).bind(user.id).all();

  const profile = profileResults[0];

  const openai = new OpenAI({
    apiKey: c.env.OPENAI_API_KEY,
  });

  const contextInfo = profile ? `
  معلومات المريض:
  - العمر: ${profile.age || 'غير محدد'}
  - الجنس: ${profile.gender || 'غير محدد'}
  - التاريخ المرضي العائلي: ${profile.family_history || 'لا يوجد'}
  - الأمراض المزمنة: ${profile.chronic_conditions || 'لا يوجد'}
  - الأدوية الحالية: ${profile.medications || 'لا يوجد'}
  ` : '';

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `أنت مساعد طبي ذكي متخصص في التشخيص الأولي وتقييم المخاطر الصحية. مهمتك:

        1. تحليل الأعراض المذكورة
        2. تقييم مستوى الخطورة (منخفض/متوسط/عالي/طارئ)
        3. تقديم توصيات أولية
        4. تحديد ما إذا كان يحتاج لمراجعة طبية فورية
        5. اقتراح فحوصات إضافية إن لزم الأمر

        مهم: هذا تقييم أولي وليس بديلاً عن الاستشارة الطبية المباشرة.
        يرجى الرد باللغة العربية بشكل واضح ومطمئن.`
      },
      {
        role: "user",
        content: `${contextInfo}
        
        الأعراض الحالية: ${validatedData.symptoms}
        
        يرجى تحليل هذه الأعراض وتقديم تقييم شامل مع التوصيات المناسبة.`
      }
    ]
  });

  const aiResponse = response.choices[0]?.message?.content || "تعذر تحليل الأعراض";

  // Extract risk level from response
  let riskLevel = "متوسط";
  if (aiResponse.includes("طارئ") || aiResponse.includes("عاجل")) {
    riskLevel = "عالي";
  } else if (aiResponse.includes("منخفض")) {
    riskLevel = "منخفض";
  }

  // Save consultation to database
  const { success } = await c.env.DB.prepare(`
    INSERT INTO consultations 
    (user_id, symptoms, consultation_type, ai_response, risk_level, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    user.id,
    validatedData.symptoms,
    "symptom_analysis",
    aiResponse,
    riskLevel
  ).run();

  return c.json({ success, response: aiResponse, riskLevel });
});

// Generate preventive plan
app.post("/api/preventive-plan", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Get user's health profile
  const { results: profileResults } = await c.env.DB.prepare(
    "SELECT * FROM health_profiles WHERE user_id = ? ORDER BY created_at DESC LIMIT 1"
  ).bind(user.id).all();

  const profile = profileResults[0];

  if (!profile) {
    return c.json({ error: "يرجى إكمال الملف الصحي أولاً" }, 400);
  }

  const openai = new OpenAI({
    apiKey: c.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `أنت خبير في الطب الوقائي وأسلوب الحياة الصحي. قم بإنشاء خطة وقائية شاملة ومخصصة تتضمن:

        1. توصيات غذائية مفصلة
        2. برنامج رياضي مناسب
        3. تعديلات في نمط الحياة
        4. جدول المتابعة والفحوصات الدورية
        5. نصائح للوقاية من الأمراض المزمنة

        يرجى تقديم خطة عملية وقابلة للتطبيق باللغة العربية.`
      },
      {
        role: "user",
        content: `معلومات المريض:
        - العمر: ${profile.age || 'غير محدد'}
        - الجنس: ${profile.gender || 'غير محدد'}
        - الطول: ${profile.height_cm || 'غير محدد'} سم
        - الوزن: ${profile.weight_kg || 'غير محدد'} كيلو
        - التاريخ المرضي العائلي: ${profile.family_history || 'لا يوجد'}
        - الأمراض المزمنة: ${profile.chronic_conditions || 'لا يوجد'}
        - نمط الحياة: ${profile.lifestyle_info || 'غير محدد'}
        
        يرجى إنشاء خطة وقائية شاملة ومخصصة لهذا الشخص.`
      }
    ]
  });

  const planText = response.choices[0]?.message?.content || "تعذر إنشاء الخطة";

  // Parse the plan into sections (simplified)
  const dietRecommendations = planText.substring(0, planText.length / 3);
  const exerciseRecommendations = planText.substring(planText.length / 3, planText.length * 2 / 3);
  const lifestyleRecommendations = planText.substring(planText.length * 2 / 3);

  // Save plan to database
  const { success } = await c.env.DB.prepare(`
    INSERT INTO preventive_plans 
    (user_id, plan_type, diet_recommendations, exercise_recommendations, lifestyle_recommendations, follow_up_schedule, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    user.id,
    "comprehensive",
    dietRecommendations,
    exerciseRecommendations,
    lifestyleRecommendations,
    "مراجعة كل 3 أشهر"
  ).run();

  return c.json({ success, plan: planText });
});

// Get user's medical history
app.get("/api/medical-history", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { results: tests } = await c.env.DB.prepare(
    "SELECT * FROM medical_tests WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(user.id).all();

  const { results: consultations } = await c.env.DB.prepare(
    "SELECT * FROM consultations WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(user.id).all();

  const { results: plans } = await c.env.DB.prepare(
    "SELECT * FROM preventive_plans WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(user.id).all();

  return c.json({
    tests,
    consultations,
    plans
  });
});

// Serve uploaded images
app.get("/api/files/:filename", async (c) => {
  const filename = c.req.param("filename");
  const object = await c.env.R2_BUCKET.get(filename);
  
  if (!object) {
    return c.json({ error: "File not found" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  return c.body(object.body, { headers });
});

export default app;
