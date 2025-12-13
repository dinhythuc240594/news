"""
Database configuration and schema for News application
Using PostgreSQL
"""
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import enum

Base = declarative_base()


class NewsStatus(enum.Enum):
    """Trạng thái bài viết"""
    DRAFT = "draft"           # Bản nháp
    PENDING = "pending"       # Chờ duyệt
    PUBLISHED = "published"   # Đã xuất bản
    HIDDEN = "hidden"         # Đã ẩn
    REJECTED = "rejected"     # Đã từ chối


class UserRole(enum.Enum):
    """Vai trò người dùng"""
    ADMIN = "admin"           # Quản trị viên
    EDITOR = "editor"         # Biên tập viên
    USER = "user"             # Người dùng thường


class Category(Base):
    """Bảng danh mục tin tức"""
    __tablename__ = 'categories'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    order_display = Column(Integer, default=0)
    parent_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    visible = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    parent = relationship("Category", remote_side=[id], backref="children")
    news = relationship("News", back_populates="category")


class User(Base):
    """Bảng người dùng"""
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), nullable=False, unique=True)
    email = Column(String(100), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.USER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    created_news = relationship("News", foreign_keys="News.created_by", back_populates="creator")
    approved_news = relationship("News", foreign_keys="News.approved_by", back_populates="approver")


class News(Base):
    """Bảng tin tức"""
    __tablename__ = 'news'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True)
    summary = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    thumbnail = Column(String(255), nullable=True)
    images = Column(Text, nullable=True)  # JSON array of image URLs
    
    # Foreign keys
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=False)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    approved_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    
    # Status and visibility
    status = Column(Enum(NewsStatus), default=NewsStatus.DRAFT)
    is_featured = Column(Boolean, default=False)
    is_hot = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    
    # SEO
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)
    meta_keywords = Column(String(255), nullable=True)
    
    # Timestamps
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    category = relationship("Category", back_populates="news")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_news")
    approver = relationship("User", foreign_keys=[approved_by], back_populates="approved_news")


class Tag(Base):
    """Bảng thẻ tag"""
    __tablename__ = 'tags'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False, unique=True)
    slug = Column(String(50), nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class NewsTag(Base):
    """Bảng liên kết nhiều-nhiều giữa News và Tag"""
    __tablename__ = 'news_tags'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    news_id = Column(Integer, ForeignKey('news.id'), nullable=False)
    tag_id = Column(Integer, ForeignKey('tags.id'), nullable=False)


# Database connection
_engine = None
_SessionLocal = None


def get_database_url():
    """Lấy URL kết nối database từ config"""
    from flask import current_app
    try:
        return current_app.config.get('DATABASE_URL', 'postgresql://postgres:123456789@localhost:5432/newsdb')
    except RuntimeError:
        # Nếu không có Flask app context, dùng giá trị mặc định
        import os
        return os.environ.get('DATABASE_URL', 'postgresql://postgres:123456789@localhost:5432/newsdb')


def create_engine_instance():
    """Tạo engine kết nối database"""
    global _engine
    if _engine is None:
        _engine = create_engine(get_database_url())
    return _engine


def get_session():
    """Tạo session để làm việc với database"""
    global _SessionLocal
    if _SessionLocal is None:
        engine = create_engine_instance()
        _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return _SessionLocal()


def init_db():
    """Khởi tạo database - tạo tất cả các bảng"""
    engine = create_engine_instance()
    Base.metadata.create_all(engine)

