create database dairy;
use dairy;

-- Users Table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    contact VARCHAR(20),
    role ENUM('admin', 'staff') DEFAULT 'staff',
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cow Categories Table
CREATE TABLE cow_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100),
    description TEXT
);

-- Cows Table
CREATE TABLE cows (
    cow_id INT AUTO_INCREMENT PRIMARY KEY,
    cow_control_number VARCHAR(50) UNIQUE NOT NULL,
    category_id INT,
    cow_type VARCHAR(100), -- e.g., Jersey, HF
    gender ENUM('Male', 'Female'),
    dob DATE,
    image_url TEXT,
    status ENUM('active', 'sold', 'sick') DEFAULT 'active',
    user_id INT, -- who added it
    FOREIGN KEY (category_id) REFERENCES cow_categories(category_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Milk Collection Table
CREATE TABLE milk_collection (
    collection_id INT AUTO_INCREMENT PRIMARY KEY,
    cow_id INT,
    date DATE NOT NULL,
    morning_liters DECIMAL(5,2),
    evening_liters DECIMAL(5,2),
    total DECIMAL(5,2) GENERATED ALWAYS AS (morning_liters + evening_liters) STORED,
    price_per_liter DECIMAL(5,2),
    user_id INT,
    FOREIGN KEY (cow_id) REFERENCES cows(cow_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Feed Monitoring Table
CREATE TABLE feed_monitoring (
    feed_id INT AUTO_INCREMENT PRIMARY KEY,
    cow_id INT,
    date DATE NOT NULL,
    food_item VARCHAR(100),
    quantity VARCHAR(50), -- e.g., "3kg"
    time_given TIME,
    remarks TEXT,
    user_id INT,
    FOREIGN KEY (cow_id) REFERENCES cows(cow_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Vaccine Monitoring Table
CREATE TABLE vaccine_monitoring (
    vaccine_id INT AUTO_INCREMENT PRIMARY KEY,
    cow_id INT,
    date_given DATE NOT NULL,
    vaccine_name VARCHAR(100),
    remarks TEXT,
    user_id INT,
    FOREIGN KEY (cow_id) REFERENCES cows(cow_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Milk Sales Table
CREATE TABLE milk_sales (
    sale_id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    liters_sold DECIMAL(6,2),
    price_per_liter DECIMAL(5,2),
    total DECIMAL(10,2),
    customer_name VARCHAR(100),
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Cow Sale Table
CREATE TABLE cow_sales (
    cow_sale_id INT AUTO_INCREMENT PRIMARY KEY,
    cow_id INT,
    date DATE NOT NULL,
    amount DECIMAL(10,2),
    customer_name VARCHAR(100),
    customer_contact VARCHAR(20),
    remarks TEXT,
    user_id INT,
    FOREIGN KEY (cow_id) REFERENCES cows(cow_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);