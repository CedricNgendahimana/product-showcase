"""
Computer Aid MW - E-Commerce Product Showcase
Flask + PostgreSQL (Render) + Cloudinary
SAFE ON REDEPLOY – IMAGES NEVER LOST
SECURED + PRODUCTION SAFE
"""

import os
import json
import cloudinary
import cloudinary.uploader

from urllib.parse import quote
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import JSON

from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    session,
    jsonify,
)
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
from markupsafe import escape

# =========================
# APP CONFIG
# =========================
app = Flask(__name__)

app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY") or os.urandom(32)

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=bool(os.environ.get("RENDER")),  # True in production
)

# =========================
# DATABASE CONFIG
# =========================
DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
else:
    # Windows-safe SQLite fallback
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    instance_path = os.path.join(BASE_DIR, "instance")

    if not os.path.exists(instance_path):
        os.makedirs(instance_path)

    db_path = os.path.join(instance_path, "products.db")
    DATABASE_URL = f"sqlite:///{db_path.replace('\\', '/')}"

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# =========================
# CLOUDINARY CONFIG
# =========================
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
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

# =========================
# LOGIN MANAGER
# =========================
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
    image_urls = db.Column(JSON, nullable=True)

    created_at = db.Column(db.DateTime, server_default=db.func.now())

# =========================
# HELPERS
# =========================
@login_manager.user_loader
def load_user(user_id):
    return db.session.get(Admin, int(user_id))


def seed_database():
    if not ADMIN_USERNAME or not ADMIN_PASSWORD:
        return

    admin = Admin.query.filter_by(username=ADMIN_USERNAME).first()
    if not admin:
        admin = Admin(username=ADMIN_USERNAME)
        admin.set_password(ADMIN_PASSWORD)
        db.session.add(admin)
        db.session.commit()


def get_cart():
    return session.get("cart", {})


def save_cart(cart):
    session["cart"] = cart
    session.modified = True


@app.context_processor
def inject_cart_count():
    return {"cart_count": len(session.get("cart", {}))}

# =========================
# DB INIT
# =========================
with app.app_context():
    db.create_all()
    seed_database()

# =========================
# PUBLIC ROUTES
# =========================
@app.route("/")
def home():
    products = Product.query.order_by(Product.created_at.desc()).all()
    return render_template("home.html", products=products, categories=CATEGORIES)


@app.route("/about")
def about():
    return render_template("about.html", categories=CATEGORIES)


@app.route("/category/<category>")
def category_page(category):
    if category not in CATEGORIES:
        flash("Category not found", "danger")
        return redirect(url_for("home"))

    products = Product.query.filter_by(category=category)\
        .order_by(Product.created_at.desc()).all()

    return render_template(
        "category.html",
        products=products,
        category=category,
        category_info=CATEGORIES[category],
        categories=CATEGORIES,
    )


@app.route("/search")
def search():
    query = escape(request.args.get("q", "").strip())

    if not query:
        return redirect(url_for("home"))

    products = Product.query.filter(
        func.lower(Product.name).contains(query.lower()) |
        func.lower(Product.description).contains(query.lower())
    ).order_by(Product.created_at.desc()).all()

    return render_template(
        "search_results.html",
        products=products,
        query=query,
        categories=CATEGORIES,
    )


@app.route("/product/<int:id>")
def product_detail(id):
    product = Product.query.get_or_404(id)

    images = [product.image_url]
    if product.image_urls:
        try:
            images = product.image_urls if isinstance(product.image_urls, list) else json.loads(product.image_urls)
        except Exception:
            images = [product.image_url]

    whatsapp_link = None
    if WHATSAPP_NUMBER:
        message = f"Hello! I'm interested in {product.name} (MWK {product.price:,.0f}). Is it available?"
        whatsapp_link = f"https://wa.me/{WHATSAPP_NUMBER}?text={quote(message)}"

    return render_template(
        "product_detail.html",
        product=product,
        images=images,
        whatsapp_link=whatsapp_link,
        categories=CATEGORIES,
    )

# =========================
# CART ROUTES
# =========================
@app.route("/cart")
def view_cart():
    cart = get_cart()
    total = sum(float(item["price"]) for item in cart.values())
    return render_template("cart.html", cart=cart, total=total, categories=CATEGORIES)


@app.route("/cart/add/<int:product_id>", methods=["POST"])
def add_to_cart(product_id):
    product = Product.query.get_or_404(product_id)
    cart = get_cart()

    cart[str(product_id)] = {
        "name": product.name,
        "price": float(product.price),
        "image": product.image_url,
    }

    save_cart(cart)

    if request.headers.get("Accept") == "application/json":
        return jsonify({"status": "success", "cart_count": len(cart)})

    flash("Product added to cart", "success")
    return redirect(request.referrer or url_for("home"))


@app.route("/cart/remove/<int:product_id>", methods=["POST"])
def remove_from_cart(product_id):
    cart = get_cart()
    cart.pop(str(product_id), None)
    save_cart(cart)

    if request.headers.get("Accept") == "application/json":
        total = sum(float(item["price"]) for item in cart.values())
        return jsonify({"status": "success", "cart_count": len(cart), "total": total})

    flash("Product removed from cart", "info")
    return redirect(url_for("view_cart"))

# =========================
# ADMIN AUTH
# =========================
@app.route("/admin/login", methods=["GET", "POST"])
def admin_login():
    if current_user.is_authenticated:
        return redirect(url_for("admin_dashboard"))

    if request.method == "POST":
        username = escape(request.form.get("username", "").strip())
        password = request.form.get("password", "")

        if not username or not password:
            flash("All fields are required", "danger")
            return redirect(request.url)

        admin = Admin.query.filter_by(username=username).first()

        if admin and admin.check_password(password):
            login_user(admin)
            flash("Welcome back!", "success")
            return redirect(url_for("admin_dashboard"))

        flash("Invalid username or password", "danger")

    return render_template("admin/login.html")

# =========================
# ADMIN DASHBOARD
# =========================
@app.route("/admin")
@login_required
def admin_dashboard():
    products = Product.query.order_by(Product.created_at.desc()).all()
    return render_template("admin/dashboard.html", products=products, categories=CATEGORIES)

# =========================
# RUN SERVER
# =========================
if __name__ == "__main__":
    print("Starting Flask server...")
    app.run(debug=True)