
CREATE TABLE health_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  height_cm INTEGER,
  weight_kg REAL,
  family_history TEXT,
  chronic_conditions TEXT,
  medications TEXT,
  lifestyle_info TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medical_tests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  test_type TEXT NOT NULL,
  test_date DATE,
  image_url TEXT,
  original_filename TEXT,
  ai_analysis TEXT,
  key_findings TEXT,
  risk_assessment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE consultations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  symptoms TEXT,
  consultation_type TEXT,
  ai_response TEXT,
  risk_level TEXT,
  recommendations TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE preventive_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  diet_recommendations TEXT,
  exercise_recommendations TEXT,
  lifestyle_recommendations TEXT,
  follow_up_schedule TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_profiles_user_id ON health_profiles(user_id);
CREATE INDEX idx_medical_tests_user_id ON medical_tests(user_id);
CREATE INDEX idx_consultations_user_id ON consultations(user_id);
CREATE INDEX idx_preventive_plans_user_id ON preventive_plans(user_id);
