"""
Database configuration and schema for News application
Using PostgreSQL
"""
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, TypeDecorator
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import enum

Base = declarative_base()

DEFAULT_CATEGORIES = [
    {
        'name': 'Công Nghệ',
        'slug': 'dien-thoai',
        'icon': 'phone',
        'order_display': 1,
        'parent_id': None,
    },
    {
        'name': 'Kinh tế',
        'slug': 'kinh-te',
        'icon': 'economy',
        'order_display': 2,
        'parent_id': None,
    },
    {
        'name': 'Thể thao',
        'slug': 'the-thao',
        'icon': 'sports',
        'order_display': 3,
        'parent_id': None,
    },
    {
        'name': 'Giải trí',
        'slug': 'giai-tri',
        'icon': 'entertainment',
        'order_display': 4,
        'parent_id': None,
    },
    {
        'name': 'Giáo dục',
        'slug': 'giao-duc',
        'icon': 'education',
        'order_display': 5,
        'parent_id': None,
    },
    {
        'name': 'Sức khỏe',
        'slug': 'suc-khoe',
        'icon': 'health',
        'order_display': 6,
        'parent_id': None,
    }
]

DEFAULT_CATEGORIES_EN = [
    {
        'name': 'Technology',
        'slug': 'technology',
        'icon': 'phone',
        'order_display': 1,
        'parent_id': None,
    },
    {
        'name': 'Kinh tế',
        'slug': 'economy',
        'icon': 'economy',
        'order_display': 2,
        'parent_id': None,
    },
    {
        'name': 'Sports',
        'slug': 'sports',
        'icon': 'sports',
        'order_display': 3,
        'parent_id': None,
    },
    {
        'name': 'Entertainment',
        'slug': 'entertainment',
        'icon': 'entertainment',
        'order_display': 4,
        'parent_id': None,
    },
    {
        'name': 'Education',
        'slug': 'education',
        'icon': 'education',
        'order_display': 5,
        'parent_id': None,
    },
    {
        'name': 'Sức khỏe',
        'slug': 'suc-khoe',
        'icon': 'health',
        'order_display': 6,
        'parent_id': None,
    }
]

class NewsStatus(enum.Enum):
    
    DRAFT = "draft"           # Bản nháp
    PENDING = "pending"       # Chờ duyệt
    PUBLISHED = "published"   # Đã xuất bản
    HIDDEN = "hidden"         # Đã ẩn
    REJECTED = "rejected"     # Đã từ chối

    def __str__(self):
        return self.value
    
    @classmethod
    def from_string(cls, value):
        """Convert string to NewsStatus enum"""
        if value is None:
            return None
        if isinstance(value, cls):
            return value
        try:
            # Try to get enum by value
            for status in cls:
                if status.value == value:
                    return status
        except (ValueError, AttributeError):
            pass
        return None


class NewsStatusType(TypeDecorator):
    """Custom type decorator for NewsStatus enum"""
    impl = String(20)
    cache_ok = True
    
    def __init__(self):
        super(NewsStatusType, self).__init__(length=20)
    
    def process_bind_param(self, value, dialect):
        """Convert enum to string when saving to database"""
        if value is None:
            return None
        if isinstance(value, NewsStatus):
            return value.value
        if isinstance(value, str):
            return value
        return str(value)
    
    def process_result_value(self, value, dialect):
        """Convert string to enum when reading from database"""
        if value is None:
            return None
        if isinstance(value, NewsStatus):
            return value
        # Convert string to enum
        if isinstance(value, str):
            # Try to find enum by value
            value_lower = value.lower()
            for status in NewsStatus:
                if status.value.lower() == value_lower:
                    return status
            # If not found, try NewsStatus.from_string
            result = NewsStatus.from_string(value)
            if result:
                return result
        # If all else fails, return None or raise error
        return None


class UserRole(enum.Enum):
    
    ADMIN = "admin"           # Quản trị viên
    EDITOR = "editor"         # Biên tập viên
    USER = "user"             # Người dùng thường

    def __str__(self):
        return self.value
    
    @classmethod
    def from_string(cls, value):
        """Convert string to UserRole enum"""
        if value is None:
            return None
        if isinstance(value, cls):
            return value
        try:
            # Try to get enum by value
            for role in cls:
                if role.value == value:
                    return role
        except (ValueError, AttributeError):
            pass
        return None


class UserRoleType(TypeDecorator):
    """Custom type decorator for UserRole enum"""
    impl = String(20)
    cache_ok = True
    
    def __init__(self):
        super(UserRoleType, self).__init__(length=20)
    
    def process_bind_param(self, value, dialect):
        """Convert enum to string when saving to database"""
        if value is None:
            return None
        if isinstance(value, UserRole):
            return value.value
        if isinstance(value, str):
            return value
        return str(value)
    
    def process_result_value(self, value, dialect):
        """Convert string to enum when reading from database"""
        if value is None:
            return None
        if isinstance(value, UserRole):
            return value
        # Convert string to enum
        if isinstance(value, str):
            # Try to find enum by value
            value_lower = value.lower()
            for role in UserRole:
                if role.value.lower() == value_lower:
                    return role
            # If not found, try UserRole.from_string
            result = UserRole.from_string(value)
            if result:
                return result
        # If all else fails, return None or raise error
        return None

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
    level = Column(Integer, default=1)  # Cấp độ menu: 1, 2, 3, 4
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
    phone = Column(String(20), nullable=True)
    avatar = Column(String(255), nullable=True)  # URL to avatar image
    role = Column(UserRoleType(), default=UserRole.USER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    created_news = relationship("News", foreign_keys="News.created_by", back_populates="creator")
    approved_news = relationship("News", foreign_keys="News.approved_by", back_populates="approver")
    saved_news = relationship("SavedNews", back_populates="user", cascade="all, delete-orphan")
    viewed_news = relationship("ViewedNews", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="user", cascade="all, delete-orphan")


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
    status = Column(NewsStatusType(), default=NewsStatus.DRAFT)
    is_featured = Column(Boolean, default=False)
    is_hot = Column(Boolean, default=False)
    is_api = Column(Boolean, default=False)  # Đánh dấu bài viết từ API
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


class SavedNews(Base):
    """Bảng tin đã lưu của người dùng"""
    __tablename__ = 'saved_news'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    news_id = Column(Integer, ForeignKey('news.id'), nullable=False)
    site = Column(String(10), default='vn')  # Phân biệt site: vn / en
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="saved_news")
    news = relationship("News")


class ViewedNews(Base):
    """Bảng tin đã xem của người dùng"""
    __tablename__ = 'viewed_news'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    news_id = Column(Integer, ForeignKey('news.id'), nullable=False)
    site = Column(String(10), default='vn')  # Phân biệt site: vn / en
    viewed_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="viewed_news")
    news = relationship("News")


class Comment(Base):
    """Bảng bình luận của người dùng"""
    __tablename__ = 'comments'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    news_id = Column(Integer, ForeignKey('news.id'), nullable=False)
    content = Column(Text, nullable=False)
    parent_id = Column(Integer, ForeignKey('comments.id'), nullable=True)  # For reply comments
    site = Column(String(10), default='vn')  # Phân biệt site: vn / en
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="comments")
    news = relationship("News")
    parent = relationship("Comment", remote_side=[id], backref="replies")


class NewsInternational(Base):
    """Bảng tin tức quốc tế"""
    __tablename__ = 'news_international'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False, unique=True)
    summary = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    thumbnail = Column(String(255), nullable=True)
    images = Column(Text, nullable=True)  # JSON array of image URLs
    category_id = Column(Integer, ForeignKey('categories_international.id'), nullable=False)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    approved_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    status = Column(NewsStatusType(), default=NewsStatus.DRAFT)
    is_featured = Column(Boolean, default=False)
    is_hot = Column(Boolean, default=False)
    is_api = Column(Boolean, default=False)  # Đánh dấu bài viết từ API
    view_count = Column(Integer, default=0)
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)
    meta_keywords = Column(String(255), nullable=True)
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    # Liên kết tới CategoryInternational (danh mục tin quốc tế)
    category = relationship("CategoryInternational", back_populates="news")
    # Quan hệ tới User (không dùng back_populates chung với News để tránh xung đột mapper)
    creator = relationship("User", foreign_keys=[created_by])
    approver = relationship("User", foreign_keys=[approved_by])


class CategoryInternational(Base):
    """Bảng danh mục tin tức quốc tế"""
    __tablename__ = 'categories_international'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    order_display = Column(Integer, default=0)
    parent_id = Column(Integer, ForeignKey('categories_international.id'), nullable=True)
    level = Column(Integer, default=1)  # Cấp độ menu: 1, 2, 3, 4
    visible = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    parent = relationship("CategoryInternational", remote_side=[id], backref="children")
    # Danh sách các bài viết quốc tế thuộc danh mục này
    news = relationship("NewsInternational", back_populates="category")


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
        _engine = create_engine(get_database_url(), echo=True, pool_size=20, max_overflow=20, pool_recycle=3600)
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

