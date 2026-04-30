-- users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  device_id TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- packages
CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  quota INT,
  duration_days INT NOT NULL,
  price INT NOT NULL,
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- user subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  package_id INT REFERENCES packages(id),
  remaining_quota INT,
  expired_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  package_id INT REFERENCES packages(id),
  amount INT NOT NULL,
  qr_code_url TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tryouts
CREATE TABLE IF NOT EXISTS tryouts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- questions
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  tryout_id INT REFERENCES tryouts(id),
  category_id INT REFERENCES categories(id),
  question_text TEXT NOT NULL,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  option_e TEXT,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- user answers
CREATE TABLE IF NOT EXISTS user_answers (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  question_id INT REFERENCES questions(id),
  selected_answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- results
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tryout_id INT REFERENCES tryouts(id),
  score_tiu INT NOT NULL,
  score_twk INT NOT NULL,
  score_tkp INT NOT NULL,
  total_score INT NOT NULL,
  time_used_seconds INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- rankings
CREATE TABLE IF NOT EXISTS rankings (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tryout_id INT REFERENCES tryouts(id),
  total_score INT NOT NULL,
  rank INT NOT NULL,
  time_used_seconds INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tryout_id)
);
