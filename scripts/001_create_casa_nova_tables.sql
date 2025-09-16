-- Criar tabela de usuários (apenas um usuário: casanova)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir usuário casanova
INSERT INTO public.users (username, password_hash) 
VALUES ('casanova', 'casanova') 
ON CONFLICT (username) DO NOTHING;

-- Criar tabela de músicas
CREATE TABLE IF NOT EXISTS public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  artist TEXT NOT NULL,
  key TEXT NOT NULL,
  duration INTEGER NOT NULL, -- em segundos
  bpm INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de shows
CREATE TABLE IF NOT EXISTS public.shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de relacionamento entre shows e músicas
CREATE TABLE IF NOT EXISTS public.show_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id UUID NOT NULL REFERENCES public.shows(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(show_id, song_id),
  UNIQUE(show_id, position)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.show_songs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuários (apenas o próprio usuário pode ver seus dados)
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (username = 'casanova');
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (username = 'casanova');

-- Políticas RLS para músicas
CREATE POLICY "Users can view own songs" ON public.songs FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE username = 'casanova'));
CREATE POLICY "Users can insert own songs" ON public.songs FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE username = 'casanova'));
CREATE POLICY "Users can update own songs" ON public.songs FOR UPDATE USING (user_id IN (SELECT id FROM public.users WHERE username = 'casanova'));
CREATE POLICY "Users can delete own songs" ON public.songs FOR DELETE USING (user_id IN (SELECT id FROM public.users WHERE username = 'casanova'));

-- Políticas RLS para shows
CREATE POLICY "Users can view own shows" ON public.shows FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE username = 'casanova'));
CREATE POLICY "Users can insert own shows" ON public.shows FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE username = 'casanova'));
CREATE POLICY "Users can update own shows" ON public.shows FOR UPDATE USING (user_id IN (SELECT id FROM public.users WHERE username = 'casanova'));
CREATE POLICY "Users can delete own shows" ON public.shows FOR DELETE USING (user_id IN (SELECT id FROM public.users WHERE username = 'casanova'));

-- Políticas RLS para show_songs
CREATE POLICY "Users can view own show_songs" ON public.show_songs FOR SELECT USING (show_id IN (SELECT id FROM public.shows WHERE user_id IN (SELECT id FROM public.users WHERE username = 'casanova')));
CREATE POLICY "Users can insert own show_songs" ON public.show_songs FOR INSERT WITH CHECK (show_id IN (SELECT id FROM public.shows WHERE user_id IN (SELECT id FROM public.users WHERE username = 'casanova')));
CREATE POLICY "Users can update own show_songs" ON public.show_songs FOR UPDATE USING (show_id IN (SELECT id FROM public.shows WHERE user_id IN (SELECT id FROM public.users WHERE username = 'casanova')));
CREATE POLICY "Users can delete own show_songs" ON public.show_songs FOR DELETE USING (show_id IN (SELECT id FROM public.shows WHERE user_id IN (SELECT id FROM public.users WHERE username = 'casanova')));
