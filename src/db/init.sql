-- Users Table
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  balance NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- Operations Table
CREATE TABLE IF NOT EXISTS operations (
  id VARCHAR(255) PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('addition', 'subtraction', 'multiplication', 'division', 'square_root', 'random_string', 'create_user')),
  cost NUMERIC(10, 2) NOT NULL
);

-- Records Table
CREATE TABLE IF NOT EXISTS records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  user_balance NUMERIC(10, 2) NOT NULL,
  operation_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (operation_id) REFERENCES operations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert some initial data if needed
INSERT INTO operations (id, type, cost) VALUES
('1', 'addition', 1.00),
('2', 'subtraction', 1.00),
('3', 'multiplication', 2.00),
('4', 'division', 2.00),
('5', 'square_root', 3.00),
('6', 'random_string', 4.00),
('7', 'create_user', 5.00)
ON CONFLICT (id) DO NOTHING;
