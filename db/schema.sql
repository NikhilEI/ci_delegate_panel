-- Convergence India Delegate Registration - MySQL schema
-- Run this once against an empty database, e.g.:
--   mysql -u <user> -p <database_name> < db/schema.sql

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- Delegate (paid) registrations: Platinum / Gold / Silver passes.
-- One row per checkout (one payment), with `quantity` delegate people
-- attached in delegate_registration_persons.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS delegate_registrations (
  id                    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pass_name             VARCHAR(100)  NOT NULL,
  price_per_delegate    INT UNSIGNED  NOT NULL,
  quantity              INT UNSIGNED  NOT NULL,
  total_amount          INT UNSIGNED  NOT NULL,

  organisation          VARCHAR(150)  NOT NULL,
  address               VARCHAR(255)  NOT NULL,
  city                  VARCHAR(100)  NOT NULL,
  state                 VARCHAR(100)  NOT NULL,
  country               VARCHAR(100)  NOT NULL,
  zipcode               VARCHAR(20)   NOT NULL,
  gst_number            VARCHAR(30)   NULL,
  track_of_interest     VARCHAR(100)  NULL,

  terms_accepted        TINYINT(1)    NOT NULL DEFAULT 0,

  payment_status        ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
  razorpay_order_id     VARCHAR(64)   NULL,
  razorpay_payment_id   VARCHAR(64)   NULL,
  razorpay_signature    VARCHAR(128)  NULL,

  created_at            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_razorpay_order (razorpay_order_id),
  INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- One row per delegate (Delegate 1..N) inside a registration.
CREATE TABLE IF NOT EXISTS delegate_registration_persons (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  registration_id   INT UNSIGNED NOT NULL,
  position          INT UNSIGNED NOT NULL,   -- 1-based delegate index within the registration
  title             VARCHAR(10)  NOT NULL,
  first_name        VARCHAR(50)  NOT NULL,
  last_name         VARCHAR(50)  NOT NULL,
  designation       VARCHAR(100) NOT NULL,
  email             VARCHAR(100) NOT NULL,
  mobile            VARCHAR(20)  NOT NULL,

  CONSTRAINT fk_delegate_registration
    FOREIGN KEY (registration_id) REFERENCES delegate_registrations(id)
    ON DELETE CASCADE,
  INDEX idx_registration (registration_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Visitor registration (free pass), gated by an email/mobile OTP.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visitor_otp_requests (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email        VARCHAR(100) NOT NULL,
  mobile       VARCHAR(20)  NOT NULL,
  otp_code     CHAR(6)      NOT NULL,
  expires_at   TIMESTAMP    NOT NULL,
  verified     TINYINT(1)   NOT NULL DEFAULT 0,
  attempts     INT UNSIGNED NOT NULL DEFAULT 0,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_email_mobile (email, mobile)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS visitor_registrations (
  id                   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title                VARCHAR(10)  NOT NULL,
  first_name           VARCHAR(50)  NOT NULL,
  last_name            VARCHAR(50)  NOT NULL,
  organisation         VARCHAR(150) NOT NULL,
  designation          VARCHAR(100) NOT NULL,
  department           VARCHAR(100) NULL,

  country              VARCHAR(100) NOT NULL,
  country_code         VARCHAR(10)  NOT NULL,
  state                VARCHAR(100) NOT NULL,
  city                 VARCHAR(100) NOT NULL,
  mobile               VARCHAR(20)  NOT NULL,
  email                VARCHAR(100) NOT NULL,

  objective_of_visit   VARCHAR(150) NOT NULL,
  product_interests    JSON         NOT NULL,

  terms_accepted       TINYINT(1)   NOT NULL DEFAULT 0,
  marketing_consent    TINYINT(1)   NOT NULL DEFAULT 0,
  email_verified       TINYINT(1)   NOT NULL DEFAULT 0,

  created_at           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uniq_visitor_email (email),
  UNIQUE KEY uniq_visitor_mobile (mobile)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------------------
-- Admin panel: named admin accounts, an editable delegate-pass catalog, and
-- manual payment override fields layered on top of the automatic Razorpay flow.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(100)  NOT NULL,
  email          VARCHAR(150)  NOT NULL,
  password_hash  VARCHAR(255)  NOT NULL,
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uniq_admin_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pass_types (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug            VARCHAR(60)   NOT NULL,
  name            VARCHAR(100)  NOT NULL,
  price           INT UNSIGNED  NOT NULL,
  badge_class     VARCHAR(60)   NOT NULL DEFAULT 'delegate-pass-platinum',
  base_features   JSON          NOT NULL,
  more_features   JSON          NOT NULL,
  sort_order      INT UNSIGNED  NOT NULL DEFAULT 0,
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uniq_pass_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE delegate_registrations
  ADD COLUMN IF NOT EXISTS payment_notes VARCHAR(500) NULL AFTER razorpay_signature,
  ADD COLUMN IF NOT EXISTS payment_updated_by INT UNSIGNED NULL AFTER payment_notes,
  ADD COLUMN IF NOT EXISTS payment_updated_at TIMESTAMP NULL AFTER payment_updated_by;
