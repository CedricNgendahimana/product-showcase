"""
Computer Aid MW - E-Commerce Product Showcase
Flask + PostgreSQL (Render) + Cloudinary
SAFE ON REDEPLOY – IMAGES NEVER LOST
"""

import os
import cloudinary
import cloudinary.uploader
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
from urllib.parse import quote

# =========================
# APP CONFIG
# =========================
app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-me")

# =========================
# DATABASE (RENDER POSTGRES)
# =========================
DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("❌ DATABASE_URL is not set")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# =========================
# CLOUDINARY CONFIG
# =========================
CLOUD_NAME = os.environ.get("CLOUDINARY_CLOUD_NAME")
API_KEY = os.environ.get("CLOUDINARY_API_KEY")
API_SECRET = os.environ.get("CLOUDINARY_API_SECRET")

if not all([CLOUD_NAME, API_KEY, API_SECRET]):
    raise RuntimeError("❌ Cloudinary environment variables missing")

cloudinary.config(
    cloud_name=CLOUD_NAME,
    api_key=API_KEY,
    api_secret=API_SECRET,
    secure=True,
)

# =========================
# ENV VARIABLES
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

PLACEHOLDER_IMAGE = "https://via.placeholder.com/600x400?text=No+Image"

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
    __tablename__ = "admin"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Product(db.Model):
    __tablename__ = "product"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False, default="accessories")
    image_url = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

# =========================
# HELPERS
# =========================
@login_manager.user_loader
def load_user(user_id):
    return db.session.get(Admin, int(user_id))


def seed_database():
    """Create admin user ONCE (safe on redeploy)"""
    if not ADMIN_USERNAME or not ADMIN_PASSWORD:
        return

    admin = Admin.query.filter_by(username=ADMIN_USERNAME).first()
    if not admin:
        admin = Admin(username=ADMIN_USERNAME)
        admin.set_password(ADMIN_PASSWORD)
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin user created")

# =========================
# DB INIT
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

    products = Product.query.filter_by(category=category).order_by(
        Product.created_at.desc()
    ).all()

    return render_template(
        "category.html",
        products=products,
        category=category,
        category_info=CATEGORIES[category],
        categories=CATEGORIES,
    )

@app.route("/search")
def search():
    query = request.args.get("q", "").strip()

    if not query:
        return redirect(url_for("home"))

    products = Product.query.filter(
        (Product.name.ilike(f"%{query}%")) |
        (Product.description.ilike(f"%{query}%"))
    ).all()

    return render_template(
        "search_results.html",
        products=products,
        query=query,
        categories=CATEGORIES
    )


@app.route("/product/<int:id>")
def product_detail(id):
    product = Product.query.get_or_404(id)

    image = product.image_url or PLACEHOLDER_IMAGE

    whatsapp_link = None
    if WHATSAPP_NUMBER:
        message = (
            f"Hello! I'm interested in {product.name} "
            f"(MWK {product.price:,.0f}). Is it available?"
        )
        whatsapp_link = f"https://wa.me/{WHATSAPP_NUMBER}?text={quote(message)}"

    return render_template(
        "product_detail.html",
        product=product,
        image=image,
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

        if not file:
            flash("Image is required", "danger")
            return redirect(request.url)

        try:
            upload = cloudinary.uploader.upload(
                file,
                folder="computer_aid_products",
                transformation={"quality": "auto", "fetch_format": "auto"},
            )
        except Exception:
            flash("Image upload failed", "danger")
            return redirect(request.url)

        product = Product(
            name=request.form.get("name"),
            price=float(request.form.get("price")),
            description=request.form.get("description"),
            category=request.form.get("category", "accessories"),
            image_url=upload["secure_url"],
        )

        db.session.add(product)
        db.session.commit()
        flash("Product added successfully!", "success")
        return redirect(url_for("admin_dashboard"))

    return render_template(
        "admin/product_form.html",
        product=None,
        action="Add",
        categories=CATEGORIES,
    )


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
        if file:
            upload = cloudinary.uploader.upload(
                file,
                folder="computer_aid_products",
                transformation={"quality": "auto", "fetch_format": "auto"},
            )
            product.image_url = upload["secure_url"]

        db.session.commit()
        flash("Product updated successfully!", "success")
        return redirect(url_for("admin_dashboard"))

    return render_template(
        "admin/product_form.html",
        product=product,
        action="Edit",
        categories=CATEGORIES,
    )


@app.route("/admin/product/delete/<int:id>", methods=["POST"])
@login_required
def admin_delete_product(id):
    product = Product.query.get_or_404(id)
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
