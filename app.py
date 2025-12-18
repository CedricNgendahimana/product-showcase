"""
Computer Aid MW - E-Commerce Product Showcase
A Flask-based product catalog with admin management and WhatsApp integration.
"""

import os
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import (
    LoginManager,
    UserMixin,
    login_user,
    login_required,
    logout_user,
    current_user,
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from urllib.parse import quote

# =========================
# PATHS & DIRECTORIES
# =========================
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
INSTANCE_DIR = os.path.join(BASE_DIR, "instance")
UPLOAD_DIR = os.path.join(BASE_DIR, "static", "images", "products")

os.makedirs(INSTANCE_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# =========================
# APP CONFIG
# =========================
app = Flask(__name__)
os.makedirs(app.instance_path, exist_ok=True)

app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-me")
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"sqlite:///{os.path.join(INSTANCE_DIR, 'products.db')}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["UPLOAD_FOLDER"] = UPLOAD_DIR
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

# =========================
# ENVIRONMENT VARIABLES
# =========================
ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
WHATSAPP_NUMBER = os.environ.get("WHATSAPP_NUMBER")

# =========================
# DATA
# =========================
CATEGORIES = {
    "laptops": {"name": "Laptops", "icon": "fas fa-laptop"},
    "consoles": {"name": "Gaming Consoles", "icon": "fas fa-gamepad"},
    "phones": {"name": "Phones", "icon": "fas fa-mobile-alt"},
    "accessories": {"name": "Accessories", "icon": "fas fa-keyboard"},
}

# =========================
# EXTENSIONS
# =========================
db = SQLAlchemy(app)

login_manager = LoginManager(app)
login_manager.login_view = "admin_login"
login_manager.login_message_category = "info"

# =========================
# MODELS
# =========================
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
    category = db.Column(db.String(50), nullable=False, default="accessories")
    image = db.Column(db.String(200), default="default.jpg")
    created_at = db.Column(db.DateTime, server_default=db.func.now())

# =========================
# HELPERS
# =========================
@login_manager.user_loader
def load_user(user_id):
    return Admin.query.get(int(user_id))


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def seed_database():
    """Create admin user once using env vars"""
    if Admin.query.count() == 0 and ADMIN_USERNAME and ADMIN_PASSWORD:
        admin = Admin(username=ADMIN_USERNAME)
        admin.set_password(ADMIN_PASSWORD)
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin user created")

# =========================
# DATABASE INITIALIZATION
# =========================
with app.app_context():
    db.create_all()
    seed_database()

# =========================
# ROUTES
# =========================
@app.route("/")
def home():
    products = Product.query.order_by(Product.created_at.desc()).all()
    return render_template("home.html", products=products, categories=CATEGORIES)


@app.route("/category/<category>")
def category_page(category):
    if category not in CATEGORIES:
        flash("Category not found", "danger")
        return redirect(url_for("home"))

    products = (
        Product.query.filter_by(category=category)
        .order_by(Product.created_at.desc())
        .all()
    )

    return render_template(
        "category.html",
        products=products,
        category=category,
        category_info=CATEGORIES[category],
        categories=CATEGORIES,
    )


@app.route("/product/<int:id>")
def product_detail(id):
    product = Product.query.get_or_404(id)

    whatsapp_link = None
    if WHATSAPP_NUMBER:
        message = (
            f"Hi! I'm interested in {product.name} priced at "
            f"MWK {product.price:,.0f}. Is it available?"
        )
        whatsapp_link = f"https://wa.me/{WHATSAPP_NUMBER}?text={quote(message)}"

    return render_template(
        "product_detail.html",
        product=product,
        whatsapp_link=whatsapp_link,
        categories=CATEGORIES,
    )

# =========================
# ADMIN AUTH
# =========================
@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if current_user.is_authenticated:
        return redirect(url_for("admin_dashboard"))

    if request.method == "POST":
        admin = Admin.query.filter_by(
            username=request.form.get("username")
        ).first()

        if admin and admin.check_password(request.form.get("password")):
            login_user(admin)
            flash("Welcome back!", "success")
            return redirect(url_for("admin_dashboard"))

        flash("Invalid username or password", "danger")

    return render_template("admin/login.html")


@app.route("/admin/logout")
@login_required
def admin_logout():
    logout_user()
    flash("Logged out successfully.", "info")
    return redirect(url_for("home"))

# =========================
# ADMIN DASHBOARD
# =========================
@app.route("/admin")
@login_required
def admin_dashboard():
    products = Product.query.order_by(Product.created_at.desc()).all()
    return render_template("admin/dashboard.html", products=products, categories=CATEGORIES)


@app.route("/admin/product/add", methods=["GET", "POST"])
@login_required
def admin_add_product():
    if request.method == "POST":
        file = request.files.get("image")
        image_filename = "default.jpg"

        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            image_filename = f"{os.urandom(8).hex()}_{filename}"
            file.save(os.path.join(app.config["UPLOAD_FOLDER"], image_filename))

        product = Product(
            name=request.form.get("name"),
            price=float(request.form.get("price")),
            description=request.form.get("description"),
            category=request.form.get("category", "accessories"),
            image=image_filename,
        )

        db.session.add(product)
        db.session.commit()
        flash("Product added successfully!", "success")
        return redirect(url_for("admin_dashboard"))

    return render_template("admin/product_form.html", product=None, action="Add", categories=CATEGORIES)


@app.route("/admin/product/edit/<int:id>", methods=["GET", "POST"])
@login_required
def admin_edit_product(id):
    product = Product.query.get_or_404(id)

    if request.method == "POST":
        product.name = request.form.get("name")
        product.price = float(request.form.get("price"))
        product.description = request.form.get("description")
        product.category = request.form.get("category", "accessories")

        file = request.files.get("image")
        if file and file.filename and allowed_file(file.filename):
            if product.image != "default.jpg":
                old = os.path.join(app.config["UPLOAD_FOLDER"], product.image)
                if os.path.exists(old):
                    os.remove(old)

            filename = secure_filename(file.filename)
            product.image = f"{os.urandom(8).hex()}_{filename}"
            file.save(os.path.join(app.config["UPLOAD_FOLDER"], product.image))

        db.session.commit()
        flash("Product updated successfully!", "success")
        return redirect(url_for("admin_dashboard"))

    return render_template("admin/product_form.html", product=product, action="Edit", categories=CATEGORIES)


@app.route("/admin/product/delete/<int:id>", methods=["POST"])
@login_required
def admin_delete_product(id):
    product = Product.query.get_or_404(id)

    if product.image != "default.jpg":
        path = os.path.join(app.config["UPLOAD_FOLDER"], product.image)
        if os.path.exists(path):
            os.remove(path)

    db.session.delete(product)
    db.session.commit()
    flash("Product deleted successfully!", "success")
    return redirect(url_for("admin_dashboard"))

# =========================
# NO CACHE
# =========================
@app.after_request
def add_header(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response
