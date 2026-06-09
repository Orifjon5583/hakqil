CREATE TABLE agent_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_code varchar(20) NOT NULL,
  brand varchar(80) NOT NULL,
  api_base_url text NOT NULL,
  token text NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_tokens_device_code ON agent_tokens(device_code);
CREATE INDEX idx_agent_tokens_created_at ON agent_tokens(created_at DESC);
