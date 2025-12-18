"""
Computer Aid MW - E-Commerce Product Showcase
A Flask-based product catalog with admin management and WhatsApp integration.
"""

import os
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

app = Flask(__name__)

app.config['SECRET_KEY'] = os.environ.get('SESSION_SECRET', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///products.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/images/products'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

CATEGORIES = {
    'laptops': {'name': 'Laptops', 'icon': 'fas fa-laptop'},
    'consoles': {'name': 'Gaming Consoles', 'icon': 'fas fa-gamepad'},
    'phones': {'name': 'Phones', 'icon': 'fas fa-mobile-alt'},
    'accessories': {'name': 'Accessories', 'icon': 'fas fa-keyboard'}
}

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'admin_login'
login_manager.login_message_category = 'info'

class Admin(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False, default='accessories')
    image = db.Column(db.String(200), default='default.jpg')
    created_at = db.Column(db.DateTime, server_default=db.func.now())

@login_manager.user_loader
def load_user(user_id):
    return Admin.query.get(int(user_id))

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def seed_database():
    if Admin.query.count() == 0:
        admin = Admin(username='admin')
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print("Default admin created: username='admin', password='admin123'")

    if Product.query.count() == 0:
        sample_products = [
            Product(
                name='Gaming Laptop Pro',
                price=789999,
                description='High-performance gaming laptop with RTX 4060, 16GB RAM, 512GB SSD. Perfect for gaming and content creation. Features a stunning 15.6" 144Hz display.',
                category='laptops',
                image='default.jpg'
            ),
            Product(
                name='Business Ultrabook',
                price=549999,
                description='Ultra-thin and lightweight business laptop with Intel i7, 16GB RAM, 512GB SSD. Perfect for professionals on the go.',
                category='laptops',
                image='default.jpg'
            ),
            Product(
                name='PlayStation 5',
                price=449999,
                description='Next-gen gaming console with stunning graphics, fast SSD, and an amazing library of exclusive games.',
                category='consoles',
                image='default.jpg'
            ),
            Product(
                name='Xbox Series X',
                price=429999,
                description='Premium gaming console featuring 4K gaming, ray tracing, and access to Xbox Game Pass.',
                category='consoles',
                image='default.jpg'
            ),
            Product(
                name='iPhone 15 Pro',
                price=799999,
                description='Latest flagship smartphone with A17 Pro chip, advanced camera system, and titanium design.',
                category='phones',
                image='default.jpg'
            ),
            Product(
                name='Samsung Galaxy S24',
                price=749999,
                description='Cutting-edge Android smartphone with excellent cameras, bright display, and long battery life.',
                category='phones',
                image='default.jpg'
            ),
            Product(
                name='Wireless Mechanical Keyboard',
                price=89999,
                description='Premium wireless mechanical keyboard with RGB backlighting, hot-swappable switches, and long battery life.',
                category='accessories',
                image='default.jpg'
            ),
            Product(
                name='USB-C Docking Station',
                price=54999,
                description='Universal USB-C hub with 12 ports including HDMI 4K, USB 3.0, SD card reader, and 100W power delivery.',
                category='accessories',
                image='default.jpg'
            ),
            Product(
                name='Noise Cancelling Headphones',
                price=169999,
                description='Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio.',
                category='accessories',
                image='default.jpg'
            ),
            Product(
                name='Ergonomic Office Chair',
                price=249999,
                description='Professional ergonomic office chair with lumbar support, adjustable armrests, and breathable mesh back.',
                category='accessories',
                image='default.jpg'
            ),
        ]
        db.session.add_all(sample_products)
        db.session.commit()
        print("Sample products added to database")

@app.route('/')
def home():
    products = Product.query.order_by(Product.created_at.desc()).all()
    return render_template('home.html', products=products, categories=CATEGORIES)

@app.route('/category/<category>')
def category_page(category):
    if category not in CATEGORIES:
        flash('Category not found', 'danger')
        return redirect(url_for('home'))
    
    products = Product.query.filter_by(category=category).order_by(Product.created_at.desc()).all()
    return render_template('category.html', products=products, category=category, category_info=CATEGORIES[category], categories=CATEGORIES)

@app.route('/product/<int:id>')
def product_detail(id):
    from urllib.parse import quote
    product = Product.query.get_or_404(id)
    whatsapp_number = '265999123456'
    message = f"Hi! I'm interested in {product.name} priced at MWK {product.price:,.0f}. Is it available?"
    whatsapp_link = f"https://wa.me/{whatsapp_number}?text={quote(message)}"
    return render_template('product_detail.html', product=product, whatsapp_link=whatsapp_link, categories=CATEGORIES)

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if current_user.is_authenticated:
        return redirect(url_for('admin_dashboard'))
    
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        admin = Admin.query.filter_by(username=username).first()
        
        if admin and admin.check_password(password):
            login_user(admin)
            flash('Welcome back!', 'success')
            return redirect(url_for('admin_dashboard'))
        flash('Invalid username or password', 'danger')
    
    return render_template('admin/login.html')

@app.route('/admin/logout')
@login_required
def admin_logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('home'))

@app.route('/admin')
@login_required
def admin_dashboard():
    products = Product.query.order_by(Product.created_at.desc()).all()
    return render_template('admin/dashboard.html', products=products, categories=CATEGORIES)

@app.route('/admin/product/add', methods=['GET', 'POST'])
@login_required
def admin_add_product():
    if request.method == 'POST':
        name = request.form.get('name')
        price = float(request.form.get('price'))
        description = request.form.get('description')
        category = request.form.get('category', 'accessories')
        
        image_filename = 'default.jpg'
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                unique_filename = f"{os.urandom(8).hex()}_{filename}"
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))
                image_filename = unique_filename
        
        product = Product(name=name, price=price, description=description, category=category, image=image_filename)
        db.session.add(product)
        db.session.commit()
        flash('Product added successfully!', 'success')
        return redirect(url_for('admin_dashboard'))
    
    return render_template('admin/product_form.html', product=None, action='Add', categories=CATEGORIES)

@app.route('/admin/product/edit/<int:id>', methods=['GET', 'POST'])
@login_required
def admin_edit_product(id):
    product = Product.query.get_or_404(id)
    
    if request.method == 'POST':
        product.name = request.form.get('name')
        product.price = float(request.form.get('price'))
        product.description = request.form.get('description')
        product.category = request.form.get('category', 'accessories')
        
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename and allowed_file(file.filename):
                if product.image != 'default.jpg':
                    old_path = os.path.join(app.config['UPLOAD_FOLDER'], product.image)
                    if os.path.exists(old_path):
                        os.remove(old_path)
                
                filename = secure_filename(file.filename)
                unique_filename = f"{os.urandom(8).hex()}_{filename}"
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))
                product.image = unique_filename
        
        db.session.commit()
        flash('Product updated successfully!', 'success')
        return redirect(url_for('admin_dashboard'))
    
    return render_template('admin/product_form.html', product=product, action='Edit', categories=CATEGORIES)

@app.route('/admin/product/delete/<int:id>', methods=['POST'])
@login_required
def admin_delete_product(id):
    product = Product.query.get_or_404(id)
    
    if product.image != 'default.jpg':
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], product.image)
        if os.path.exists(image_path):
            os.remove(image_path)
    
    db.session.delete(product)
    db.session.commit()
    flash('Product deleted successfully!', 'success')
    return redirect(url_for('admin_dashboard'))

@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        seed_database()
    app.run(host='0.0.0.0', port=5000, debug=True)
