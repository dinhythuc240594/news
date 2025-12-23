"""
Model classes cho News application
Sử dụng SQLAlchemy ORM
"""
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from datetime import datetime
from typing import List, Optional
from database import (
    News,
    Category,
    User,
    Tag,
    NewsTag,
    NewsStatus,
    UserRole,
    NewsInternational,
    CategoryInternational,
)


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

    def get_by_creator(
        self,
        creator_id: int,
        limit: int | None = None,
        offset: int = 0,
        status: NewsStatus | None = None,
        search: str | None = None,
    ) -> tuple[list[News], int]:
        """
        Lấy danh sách bài viết theo người tạo (editor), hỗ trợ phân trang và tìm kiếm.

        Args:
            creator_id: ID người tạo (editor)
            limit: Số lượng bài viết mỗi trang
            offset: Vị trí bắt đầu
            status: Lọc theo trạng thái
            search: Từ khóa tìm kiếm theo tiêu đề / tóm tắt

        Returns:
            (items, total) - danh sách bài viết và tổng số bản ghi
        """
        query = self.db.query(News).filter(News.created_by == creator_id)

        if status:
            query = query.filter(News.status == status)

        if search:
            like_pattern = f"%{search}%"
            query = query.filter(
                or_(
                    News.title.ilike(like_pattern),
                    News.summary.ilike(like_pattern),
                )
            )

        # Tính tổng trước khi limit/offset
        total = query.count()

        query = query.order_by(desc(News.created_at))

        if limit:
            query = query.limit(limit).offset(offset)

        items = query.all()
        return items, total
    
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
    
    def get_by_categories(
        self,
        category_ids: list[int],
        limit: int | None = None,
        offset: int = 0,
    ) -> list[News]:
        """Lấy bài viết theo nhiều danh mục (bao gồm danh mục con)."""
        if not category_ids:
            return []

        query = (
            self.db.query(News)
            .filter(
                News.category_id.in_(category_ids),
                News.status == NewsStatus.PUBLISHED,
            )
            .order_by(desc(News.created_at))
        )

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

    def get_descendant_ids(self, parent_id: int) -> list[int]:
        """Lấy danh sách id danh mục con (mọi cấp) của parent_id."""
        categories = self.db.query(Category.id, Category.parent_id).filter(
            Category.visible == True
        ).all()

        children = []
        stack = [parent_id]
        while stack:
            current = stack.pop()
            for cat_id, cat_parent in categories:
                if cat_parent == current:
                    children.append(cat_id)
                    stack.append(cat_id)

        return children


class UserModel:
    """Model class quản lý User"""
    
    def __init__(self, db_session: Session):
        self.db = db_session
    
    def get_by_username(self, username: str) -> Optional[User]:
        """Lấy user theo username"""
        return self.db.query(User).filter(User.username == username).first()
    
    def get_by_email(self, email: str) -> Optional[User]:
        """Lấy user theo email"""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_by_id(self, user_id: int) -> Optional[User]:
        """Lấy user theo ID"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def create(self, username: str, email: str, password: str, 
               full_name: str = None, phone: str = None, 
               role: UserRole = UserRole.USER) -> User:
        """
        Tạo user mới
        
        Args:
            username: Tên đăng nhập
            email: Email
            password: Mật khẩu (sẽ được hash)
            full_name: Họ tên đầy đủ
            phone: Số điện thoại
            role: Vai trò (mặc định là USER)
            
        Returns:
            User object
        """
        from auth_utils import hash_password
        
        user = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
            full_name=full_name,
            phone=phone,
            role=role
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def authenticate(self, username: str, password: str) -> Optional[User]:
        """
        Xác thực user với username và password
        
        Args:
            username: Tên đăng nhập hoặc email
            password: Mật khẩu
            
        Returns:
            User object nếu đúng, None nếu sai
        """
        from auth_utils import verify_password
        
        # Try username first
        user = self.get_by_username(username)
        
        # If not found, try email
        if not user:
            user = self.get_by_email(username)
        
        if user and user.is_active and verify_password(user.password_hash, password):
            return user
        
        return None


class InternationalNewsModel:
    """Model class quản lý NewsInternational (tin quốc tế tiếng Anh)"""

    def __init__(self, db_session: Session):
        self.db = db_session

    def get_by_id(self, news_id: int) -> Optional[NewsInternational]:
        """Lấy bài viết quốc tế theo ID"""
        return (
            self.db.query(NewsInternational)
            .filter(NewsInternational.id == news_id)
            .first()
        )

    def get_by_slug(self, slug: str) -> Optional[NewsInternational]:
        """Lấy bài viết quốc tế theo slug"""
        return (
            self.db.query(NewsInternational)
            .filter(NewsInternational.slug == slug)
            .first()
        )

    def get_all(
        self,
        limit: int | None = None,
        offset: int = 0,
        status: NewsStatus | None = None,
    ) -> list[NewsInternational]:
        """Lấy danh sách bài viết quốc tế"""
        query = self.db.query(NewsInternational)

        if status:
            query = query.filter(NewsInternational.status == status)

        query = query.order_by(NewsInternational.created_at.desc())

        if limit:
            query = query.limit(limit).offset(offset)

        return query.all()

    def get_published(
        self, limit: int | None = None, offset: int = 0
    ) -> list[NewsInternational]:
        """Lấy danh sách bài viết quốc tế đã xuất bản"""
        return self.get_all(
            limit=limit,
            offset=offset,
            status=NewsStatus.PUBLISHED,
        )

    def get_featured(self, limit: int = 10) -> list[NewsInternational]:
        """Lấy bài viết quốc tế nổi bật"""
        return (
            self.db.query(NewsInternational)
            .filter(
                NewsInternational.is_featured.is_(True),
                NewsInternational.status == NewsStatus.PUBLISHED,
            )
            .order_by(NewsInternational.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_hot(self, limit: int = 10) -> list[NewsInternational]:
        """Lấy tin quốc tế nóng nhất"""
        return (
            self.db.query(NewsInternational)
            .filter(
                NewsInternational.is_hot.is_(True),
                NewsInternational.status == NewsStatus.PUBLISHED,
            )
            .order_by(NewsInternational.view_count.desc())
            .limit(limit)
            .all()
        )

    def get_by_category(
        self, category_id: int, limit: int | None = None, offset: int = 0
    ) -> list[NewsInternational]:
        """Lấy bài viết quốc tế theo danh mục"""
        query = (
            self.db.query(NewsInternational)
            .filter(
                NewsInternational.category_id == category_id,
                NewsInternational.status == NewsStatus.PUBLISHED,
            )
            .order_by(NewsInternational.created_at.desc())
        )

        if limit:
            query = query.limit(limit).offset(offset)

        return query.all()

    def update(self, news_id: int, **kwargs) -> Optional[NewsInternational]:
        """
        Cập nhật bài viết quốc tế
        
        Args:
            news_id: ID bài viết
            **kwargs: Các trường cần cập nhật
            
        Returns:
            Updated NewsInternational object hoặc None
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

    def approve(self, news_id: int, approved_by: int) -> Optional[NewsInternational]:
        """Duyệt bài viết quốc tế"""
        return self.update(
            news_id, 
            status=NewsStatus.PUBLISHED,
            approved_by=approved_by,
            published_at=datetime.utcnow()
        )
    
    def reject(self, news_id: int, approved_by: int) -> Optional[NewsInternational]:
        """Từ chối bài viết quốc tế"""
        return self.update(
            news_id,
            status=NewsStatus.REJECTED,
            approved_by=approved_by
        )


class InternationalCategoryModel:
    """Model class quản lý CategoryInternational (danh mục tin quốc tế)"""

    def __init__(self, db_session: Session):
        self.db = db_session

    def get_all(self) -> list[CategoryInternational]:
        """Lấy tất cả danh mục quốc tế đang hiển thị"""
        return (
            self.db.query(CategoryInternational)
            .filter(CategoryInternational.visible.is_(True))
            .order_by(CategoryInternational.order_display)
            .all()
        )

    def get_by_id(self, category_id: int) -> Optional[CategoryInternational]:
        """Lấy danh mục quốc tế theo ID"""
        return (
            self.db.query(CategoryInternational)
            .filter(CategoryInternational.id == category_id)
            .first()
        )

    def get_by_slug(self, slug: str) -> Optional[CategoryInternational]:
        """Lấy danh mục quốc tế theo slug"""
        return (
            self.db.query(CategoryInternational)
            .filter(CategoryInternational.slug == slug)
            .first()
        )

