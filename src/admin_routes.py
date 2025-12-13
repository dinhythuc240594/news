
from flask import Blueprint, render_template, request, jsonify, redirect, url_for, flash, session
# from sqlalchemy.orm import Session
# from functools import wraps
# from typing import Optional
# from database import get_session, NewsStatus, UserRole
# from models import NewsModel, CategoryModel, UserModel
import controller
from controller import AdminController

# Tạo Blueprint cho admin để chỉ đường dẫn file tĩnh trong dự án
admin_bp = Blueprint('admin', __name__,
                    url_prefix='/admin',
                    template_folder='templates/admin')


# Khởi tạo admin controller
admin_controller = AdminController()

@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    """Trang đăng nhập"""
    return admin_controller.login()


@admin_bp.route('/logout')
def logout():
    """Đăng xuất"""
    return admin_controller.logout()


@admin_bp.route('/dashboard')
@controller.admin_required
def dashboard():
    """Dashboard admin"""
    return admin_controller.dashboard()


@admin_bp.route('/editor-dashboard')
@controller.editor_required
def editor_dashboard():
    """Dashboard editor"""
    return admin_controller.editor_dashboard()


@admin_bp.route('/news')
@controller.editor_required
def news_list():
    """Danh sách bài viết"""
    return admin_controller.news_list()


@admin_bp.route('/news/create', methods=['GET', 'POST'])
@controller.editor_required
def news_create():
    """Tạo bài viết mới"""
    return admin_controller.news_create()


@admin_bp.route('/news/<int:news_id>/edit', methods=['GET', 'POST'])
@controller.editor_required
def news_edit(news_id: int):
    """Chỉnh sửa bài viết"""
    return admin_controller.news_edit(news_id)


@admin_bp.route('/news/<int:news_id>/approve', methods=['POST'])
@controller.admin_required
def news_approve(news_id: int):
    """Duyệt bài viết"""
    return admin_controller.news_approve(news_id)


@admin_bp.route('/news/<int:news_id>/reject', methods=['POST'])
@controller.admin_required
def news_reject(news_id: int):
    """Từ chối bài viết"""
    return admin_controller.news_reject(news_id)


@admin_bp.route('/news/<int:news_id>/delete', methods=['POST'])
@controller.editor_required
def news_delete(news_id: int):
    """Xóa bài viết"""
    return admin_controller.news_delete(news_id)


# API Routes
@admin_bp.route('/api/news')
@controller.editor_required
def api_news_list():
    """API lấy danh sách bài viết"""
    return admin_controller.api_news_list()

