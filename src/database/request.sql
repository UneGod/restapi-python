CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(300) NOT NULL,
    password VARCHAR(150) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'manager', 'admin'))
);