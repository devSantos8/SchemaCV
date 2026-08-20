-- ==============================================================================
-- SCHEMACV - ESQUEMA DE BASE DE DATOS SUPABASE (POSTGRESQL + RLS)
-- ==============================================================================

-- 1. TABLA DE PERFILES DE USUARIO (Vinculada a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  banner_theme TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABLA DE CURRÍCULUMS Y PERFIL BASE
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Mi Currículum',
  target_role TEXT,
  template_id TEXT NOT NULL DEFAULT 'modern-clean',
  is_master BOOLEAN NOT NULL DEFAULT FALSE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLA DE POSTULACIONES (JOB TRACKER)
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'bookmarked',
  location TEXT,
  salary TEXT,
  url TEXT,
  portal TEXT,
  description TEXT,
  notes TEXT,
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  match_analysis JSONB,
  activity JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLA DE EVALUACIONES ATS
CREATE TABLE IF NOT EXISTS public.ats_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  ats_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  match_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ÍNDICES DE ALTO RENDIMIENTO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_is_master ON public.resumes(user_id, is_master);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ats_evaluations_user_id ON public.ats_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_ats_evaluations_job_id ON public.ats_evaluations(job_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) - PRIVACIDAD TOTAL POR USUARIO
-- ==============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_evaluations ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden insertar su propio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Políticas para resumes
CREATE POLICY "Los usuarios pueden ver sus propios currículums"
  ON public.resumes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear currículums"
  ON public.resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden editar sus currículums"
  ON public.resumes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus currículums"
  ON public.resumes FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para job_applications
CREATE POLICY "Los usuarios pueden ver sus postulaciones"
  ON public.job_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear postulaciones"
  ON public.job_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden editar sus postulaciones"
  ON public.job_applications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus postulaciones"
  ON public.job_applications FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para ats_evaluations
CREATE POLICY "Los usuarios pueden ver sus evaluaciones ATS"
  ON public.ats_evaluations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden guardar evaluaciones ATS"
  ON public.ats_evaluations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar evaluaciones ATS"
  ON public.ats_evaluations FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- TRIGGER AUTOMÁTICO: CREAR PERFIL AL REGISTRARSE
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
