ALTER TABLE devices
  ALTER COLUMN brand TYPE varchar(80) USING brand::text;

DROP TYPE IF EXISTS device_brand;
