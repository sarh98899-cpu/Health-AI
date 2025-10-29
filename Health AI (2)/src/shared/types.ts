import z from "zod";

export const HealthProfileSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  age: z.number().optional(),
  gender: z.string().optional(),
  height_cm: z.number().optional(),
  weight_kg: z.number().optional(),
  family_history: z.string().optional(),
  chronic_conditions: z.string().optional(),
  medications: z.string().optional(),
  lifestyle_info: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const MedicalTestSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  test_type: z.string(),
  test_date: z.string().optional(),
  image_url: z.string().optional(),
  original_filename: z.string().optional(),
  ai_analysis: z.string().optional(),
  key_findings: z.string().optional(),
  risk_assessment: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const ConsultationSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  symptoms: z.string(),
  consultation_type: z.string(),
  ai_response: z.string().optional(),
  risk_level: z.string().optional(),
  recommendations: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const PreventivePlanSchema = z.object({
  id: z.number().optional(),
  user_id: z.string(),
  plan_type: z.string(),
  diet_recommendations: z.string().optional(),
  exercise_recommendations: z.string().optional(),
  lifestyle_recommendations: z.string().optional(),
  follow_up_schedule: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const SymptomAnalysisRequestSchema = z.object({
  symptoms: z.string().min(1, "يرجى وصف الأعراض"),
  age: z.number().optional(),
  gender: z.string().optional(),
  medical_history: z.string().optional(),
});

export const ImageAnalysisRequestSchema = z.object({
  image_file: z.instanceof(File),
  test_type: z.string(),
  test_date: z.string().optional(),
});

export type HealthProfile = z.infer<typeof HealthProfileSchema>;
export type MedicalTest = z.infer<typeof MedicalTestSchema>;
export type Consultation = z.infer<typeof ConsultationSchema>;
export type PreventivePlan = z.infer<typeof PreventivePlanSchema>;
export type SymptomAnalysisRequest = z.infer<typeof SymptomAnalysisRequestSchema>;
export type ImageAnalysisRequest = z.infer<typeof ImageAnalysisRequestSchema>;
