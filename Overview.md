# Computer Aid MW - E-Commerce Product Showcase

## Overview
A fully functional Flask-based e-commerce product showcase website for Computer Aid MW. Visitors can browse products organized by categories and contact the seller via WhatsApp. Admins can manage products through a secure dashboard with category-based management.

## Key Features
- **Product Categories**: Four organized categories - Laptops, Gaming Consoles, Phones, and Accessories
- **Category Pages**: Dedicated pages for each category with smooth page transitions and animations
- **Public Product Grid**: Responsive card layout with category badges on the homepage
- **Product Details**: Individual product pages with full descriptions and WhatsApp contact
- **WhatsApp Integration**: Pre-filled messages with product name and price for easy seller contact
- **Admin Dashboard**: Secure area to manage products with category selection
- **Image Upload**: Product images stored in static folder with proper file handling
- **Malawian Kwacha Pricing**: All prices displayed in MWK currency
- **Modern UI**: Clean, responsive design with smooth fade-in animations and impressive hover effects
- **SQLite Database**: Automatic seeding with sample products in each category on first run

## Project Structure
```
├── app.py                    # Main Flask application with routes
├── requirements.txt          # Python dependencies
├── products.db              # SQLite database (auto-created)
├── static/
│   ├── css/style.css        # Modern styling with animations
│   ├── js/main.js           # Frontend JavaScript
│   ├── images/
│   │   ├── logo.png         # Company logo
│   │   ├── favicon.ico      # Browser icon
│   │   └── products/        # Product images
├── templates/
│   ├── base.html            # Base template with navigation
│   ├── home.html            # Product grid & category showcase
│   ├── category.html        # Category page with product filtering
│   ├── product_detail.html  # Product detail page
│   └── admin/
│       ├── login.html       # Admin login
│       ├── dashboard.html   # Product management dashboard
│       └── product_form.html # Add/Edit product form with categories
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

## Product Categories
- **Laptops**: High-performance computers, ultrabooks, gaming laptops
- **Gaming Consoles**: PlayStation, Xbox, and other gaming systems
- **Phones**: Smartphones from various manufacturers
- **Accessories**: Keyboards, headphones, docking stations, office equipment

## Technology Stack
- **Backend**: Flask 3.0+, Flask-Login, Flask-SQLAlchemy
- **Database**: SQLite
- **Frontend**: Bootstrap 5, Font Awesome, Custom CSS with animations
- **Authentication**: Werkzeug password hashing
- **Currency**: Malawian Kwacha (MWK)

## Key Routes
- `/` - Homepage with category showcase and latest products
- `/category/<category>` - Category-specific product pages (laptops, consoles, phones, accessories)
- `/product/<id>` - Product detail page with WhatsApp contact
- `/admin/login` - Admin login
- `/admin` - Admin dashboard (requires authentication)
- `/admin/product/add` - Add new product with category selection
- `/admin/product/edit/<id>` - Edit existing product
- `/admin/product/delete/<id>` - Delete product (POST only)

## UI/UX Features
- **Smooth Animations**: Page transitions, fade-in effects, hover animations
- **Responsive Design**: Mobile-first approach with Bootstrap grid
- **Category Navigation**: Quick switching between product categories
- **Product Badges**: Category tags on product cards
- **Modern Color Scheme**: Orange/red (#e94c2b) primary with dark secondary color
- **Interactive Elements**: Smooth transitions on buttons, cards, and navigation

## Sample Products
The database automatically seeds with 10 products:
- 2 Laptops (Gaming Laptop Pro, Business Ultrabook)
- 2 Consoles (PlayStation 5, Xbox Series X)
- 2 Phones (iPhone 15 Pro, Samsung Galaxy S24)
- 4 Accessories (Keyboard, Docking Station, Headphones, Office Chair)

All prices are in Malawian Kwacha (MWK).

## Recent Changes (December 2024)
- Added product categories (Laptops, Consoles, Phones, Accessories)
- Implemented category-based product pages with smooth page transitions
- Changed currency to Malawian Kwacha (MWK)
- Added category selection in admin product form
- Enhanced animations and page transitions
- Updated all pricing displays to use MWK format
- Added category badges and navigation

## User Preferences
- Modern, dynamic UI with smooth animations and impressive transitions
- Computer Aid MW branding (orange/red and black color scheme)
- WhatsApp integration for customer contact
- Category-based product organization
- Malawian Kwacha currency display
