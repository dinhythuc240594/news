"""
Script to check and insert default categories if missing
"""
from src.database import get_session, Category, DEFAULT_CATEGORIES

def main():
    db_session = get_session()
    
    try:
        # Check existing categories
        existing_cats = db_session.query(Category).all()
        print(f"Found {len(existing_cats)} existing categories:")
        for cat in existing_cats:
            print(f"  - ID: {cat.id}, Name: {cat.name}, Slug: {cat.slug}")
        
        # If no categories, insert defaults
        if len(existing_cats) == 0:
            print("\nNo categories found. Inserting defaults...")
            for cat_data in DEFAULT_CATEGORIES:
                category = Category(**cat_data)
                db_session.add(category)
            
            db_session.commit()
            print("Default categories inserted successfully!")
            
            # Show categories again
            existing_cats = db_session.query(Category).all()
            print(f"\nNow have {len(existing_cats)} categories:")
            for cat in existing_cats:
                print(f"  - ID: {cat.id}, Name: {cat.name}, Slug: {cat.slug}")
        else:
            print("\nCategories already exist. No action needed.")
            
    except Exception as e:
        print(f"Error: {e}")
        db_session.rollback()
    finally:
        db_session.close()

if __name__ == "__main__":
    main()
