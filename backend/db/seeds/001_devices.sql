INSERT INTO devices (device_id, device_code, brand)
VALUES
  ('seed-hp-01', 'HP-01', 'HP'),
  ('seed-hp-02', 'HP-02', 'HP'),
  ('seed-hp-03', 'HP-03', 'HP'),
  ('seed-hp-04', 'HP-04', 'HP'),
  ('seed-hp-05', 'HP-05', 'HP'),
  ('seed-hp-06', 'HP-06', 'HP'),
  ('seed-hp-07', 'HP-07', 'HP'),
  ('seed-len-08', 'LEN-08', 'Lenovo'),
  ('seed-len-09', 'LEN-09', 'Lenovo'),
  ('seed-len-10', 'LEN-10', 'Lenovo'),
  ('seed-len-11', 'LEN-11', 'Lenovo'),
  ('seed-len-12', 'LEN-12', 'Lenovo'),
  ('seed-len-13', 'LEN-13', 'Lenovo'),
  ('seed-len-14', 'LEN-14', 'Lenovo'),
  ('seed-len-15', 'LEN-15', 'Lenovo'),
  ('seed-len-16', 'LEN-16', 'Lenovo'),
  ('seed-len-17', 'LEN-17', 'Lenovo'),
  ('seed-acer-18', 'ACER-18', 'Acer'),
  ('seed-acer-19', 'ACER-19', 'Acer'),
  ('seed-acer-20', 'ACER-20', 'Acer'),
  ('seed-acer-21', 'ACER-21', 'Acer'),
  ('seed-acer-22', 'ACER-22', 'Acer'),
  ('seed-acer-23', 'ACER-23', 'Acer'),
  ('seed-acer-24', 'ACER-24', 'Acer'),
  ('seed-acer-25', 'ACER-25', 'Acer')
ON CONFLICT (device_code) DO NOTHING;

