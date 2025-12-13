"""
Model classes cho News application
Sử dụng SQLAlchemy ORM
"""
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from datetime import datetime
from typing import List, Optional
from database import News, Category, User, Tag, NewsTag, NewsStatus, UserRole


class NewsModel:
    """Model class quản lý News theo chuẩn OOP"""
    
    def __init__(self, db_session: Session):
        """
        Khởi tạo NewsModel
        
        Args:
            db_session: SQLAlchemy session
        """
        self.db = db_session
    
    def create(self, title: str, content: str, category_id: int, 
               created_by: int, summary: str = None, thumbnail: str = None,
               slug: str = None, status: NewsStatus = NewsStatus.DRAFT) -> News:
        """
        Tạo bài viết mới
        
        Args:
            title: Tiêu đề bài viết
            content: Nội dung bài viết
            category_id: ID danh mục
            created_by: ID người tạo
            summary: Tóm tắt bài viết
            thumbnail: URL ảnh đại diện
            slug: URL slug (tự động tạo nếu None)
            status: Trạng thái bài viết
            
        Returns:
            News object
        """
        if slug is None:
            slug = self._generate_slug(title)
        
        news = News(
            title=title,
            slug=slug,
            content=content,
            summary=summary,
            thumbnail=thumbnail,
            category_id=category_id,
            created_by=created_by,
            status=status
        )
        
        self.db.add(news)
        self.db.commit()
        self.db.refresh(news)
        return news
    
    def get_by_id(self, news_id: int) -> Optional[News]:
        """Lấy bài viết theo ID"""
        return self.db.query(News).filter(News.id == news_id).first()
    
    def get_by_slug(self, slug: str) -> Optional[News]:
        """Lấy bài viết theo slug"""
        return self.db.query(News).filter(News.slug == slug).first()
    
    def get_all(self, limit: int = None, offset: int = 0, 
                status: NewsStatus = None) -> List[News]:
        """
        Lấy danh sách bài viết
        
        Args:
            limit: Số lượng bài viết
            offset: Vị trí bắt đầu
            status: Lọc theo trạng thái
            
        Returns:
            List of News objects
        """
        query = self.db.query(News)
        
        if status:
            query = query.filter(News.status == status)
        
        query = query.order_by(desc(News.created_at))
        
        if limit:
            query = query.limit(limit).offset(offset)
        
        return query.all()
    
    def get_published(self, limit: int = None, offset: int = 0) -> List[News]:
        """Lấy danh sách bài viết đã xuất bản"""
        return self.get_all(
            limit=limit, 
            offset=offset, 
            status=NewsStatus.PUBLISHED
        )
    
    def get_by_category(self, category_id: int, limit: int = None, 
                       offset: int = 0) -> List[News]:
        """Lấy bài viết theo danh mục"""
        query = self.db.query(News).filter(
            News.category_id == category_id,
            News.status == NewsStatus.PUBLISHED
        ).order_by(desc(News.created_at))
        
        if limit:
            query = query.limit(limit).offset(offset)
        
        return query.all()
    
    def get_featured(self, limit: int = 10) -> List[News]:
        """Lấy bài viết nổi bật"""
        return self.db.query(News).filter(
            News.is_featured == True,
            News.status == NewsStatus.PUBLISHED
        ).order_by(desc(News.created_at)).limit(limit).all()
    
    def get_hot(self, limit: int = 10) -> List[News]:
        """Lấy tin nóng"""
        return self.db.query(News).filter(
            News.is_hot == True,
            News.status == NewsStatus.PUBLISHED
        ).order_by(desc(News.view_count)).limit(limit).all()
    
    def search(self, keyword: str, limit: int = 20) -> List[News]:
        """Tìm kiếm bài viết"""
        return self.db.query(News).filter(
            or_(
                News.title.ilike(f'%{keyword}%'),
                News.content.ilike(f'%{keyword}%'),
                News.summary.ilike(f'%{keyword}%')
            ),
            News.status == NewsStatus.PUBLISHED
        ).order_by(desc(News.created_at)).limit(limit).all()
    
    def update(self, news_id: int, **kwargs) -> Optional[News]:
        """
        Cập nhật bài viết
        
        Args:
            news_id: ID bài viết
            **kwargs: Các trường cần cập nhật
            
        Returns:
            Updated News object hoặc None
        """
        news = self.get_by_id(news_id)
        if not news:
            return None
        
        for key, value in kwargs.items():
            if hasattr(news, key):
                setattr(news, key, value)
        
        news.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(news)
        return news
    
    def approve(self, news_id: int, approved_by: int) -> Optional[News]:
        """Duyệt bài viết"""
        return self.update(
            news_id, 
            status=NewsStatus.PUBLISHED,
            approved_by=approved_by,
            published_at=datetime.utcnow()
        )
    
    def reject(self, news_id: int, approved_by: int) -> Optional[News]:
        """Từ chối bài viết"""
        return self.update(
            news_id,
            status=NewsStatus.REJECTED,
            approved_by=approved_by
        )
    
    def delete(self, news_id: int) -> bool:
        """Xóa bài viết"""
        news = self.get_by_id(news_id)
        if not news:
            return False
        
        self.db.delete(news)
        self.db.commit()
        return True
    
    def increment_view(self, news_id: int) -> None:
        """Tăng số lượt xem"""
        news = self.get_by_id(news_id)
        if news:
            news.view_count += 1
            self.db.commit()
    
    def _generate_slug(self, title: str) -> str:
        """Tạo slug từ tiêu đề"""
        import re
        slug = title.lower()
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug.strip('-')


class CategoryModel:
    """Model class quản lý Category"""
    
    def __init__(self, db_session: Session):
        self.db = db_session
    
    def create(self, name: str, slug: str, parent_id: int = None, 
               description: str = None, icon: str = None) -> Category:
        """Tạo danh mục mới"""
        category = Category(
            name=name,
            slug=slug,
            parent_id=parent_id,
            description=description,
            icon=icon
        )
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category
    
    def get_all(self) -> List[Category]:
        """Lấy tất cả danh mục"""
        return self.db.query(Category).filter(
            Category.visible == True
        ).order_by(Category.order_display).all()
    
    def get_by_id(self, category_id: int) -> Optional[Category]:
        """Lấy danh mục theo ID"""
        return self.db.query(Category).filter(Category.id == category_id).first()
    
    def get_by_slug(self, slug: str) -> Optional[Category]:
        """Lấy danh mục theo slug"""
        return self.db.query(Category).filter(Category.slug == slug).first()


class UserModel:
    """Model class quản lý User"""
    
    def __init__(self, db_session: Session):
        self.db = db_session
    
    def get_by_username(self, username: str) -> Optional[User]:
        """Lấy user theo username"""
        return self.db.query(User).filter(User.username == username).first()
    
    def get_by_id(self, user_id: int) -> Optional[User]:
        """Lấy user theo ID"""
        return self.db.query(User).filter(User.id == user_id).first()

