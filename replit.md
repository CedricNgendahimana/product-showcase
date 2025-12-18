# Computer Aid MW - E-Commerce Product Showcase

## Overview
A fully functional Flask-based e-commerce product showcase website for Computer Aid MW. Visitors can browse products and contact the seller via WhatsApp. Admins can manage products through a secure dashboard.

## Features
- **Public Product Grid**: Responsive card layout displaying all products with images, names, and prices
- **Product Details**: Individual product pages with full descriptions and WhatsApp contact button
- **WhatsApp Integration**: Pre-filled message with product name and price for easy seller contact
- **Admin Dashboard**: Secure area for managing products (add, edit, delete)
- **Image Upload**: Product images stored in static folder with proper file handling
- **Modern UI**: Clean, responsive design using Bootstrap 5 with custom CSS
- **SQLite Database**: Automatic seeding with sample products on first run

## Project Structure
```
├── app.py                    # Main Flask application
├── requirements.txt          # Python dependencies
├── products.db              # SQLite database (auto-created)
├── static/
│   ├── css/style.css        # Custom styling
│   ├── js/main.js           # Frontend JavaScript
│   ├── images/
│   │   ├── logo.png         # Company logo
│   │   └── products/        # Product images
│   └── favicon.ico          # Browser icon
├── templates/
│   ├── base.html            # Base template
│   ├── home.html            # Product grid page
│   ├── product_detail.html  # Product detail page
│   └── admin/
│       ├── login.html       # Admin login
│       ├── dashboard.html   # Product management
│       └── product_form.html # Add/Edit product form
└── attached_assets/         # Original logo file
```

## Running the Application
```bash
python app.py
```
The app runs on `http://0.0.0.0:5000`

## Default Admin Credentials
- **Username**: admin
- **Password**: admin123

**Important**: Change these credentials in production!

## Technology Stack
- **Backend**: Flask, Flask-Login, Flask-SQLAlchemy
- **Database**: SQLite
- **Frontend**: Bootstrap 5, Font Awesome, Custom CSS
- **Authentication**: Werkzeug password hashing

## Key Routes
- `/` - Product grid homepage
- `/product/<id>` - Product detail page
- `/admin/login` - Admin login
- `/admin` - Admin dashboard (requires authentication)
- `/admin/product/add` - Add new product
- `/admin/product/edit/<id>` - Edit existing product

## Recent Changes
- December 2024: Initial project setup with full e-commerce functionality

## User Preferences
- Modern, dynamic UI with animations
- Computer Aid MW branding (orange/red and black color scheme)
- WhatsApp integration for customer contact
