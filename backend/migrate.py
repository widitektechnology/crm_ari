"""
Database Migration Script
Creates the initial database schema for the ERP system
"""
import sys
import os

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from infrastructure.database.connection import create_tables, drop_tables, engine
from infrastructure.database.models import Base
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_database():
    """Initialize the database with all tables"""
    try:
        logger.info("Creating database tables...")
        create_tables()
        logger.info("Database initialization completed successfully!")
        
        # Print created tables
        logger.info("Created tables:")
        for table_name in Base.metadata.tables.keys():
            logger.info(f"  - {table_name}")
            
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
        raise


def reset_database():
    """Reset the database by dropping and recreating all tables"""
    try:
        logger.info("Dropping existing tables...")
        drop_tables()
        
        logger.info("Creating database tables...")
        create_tables()
        
        logger.info("Database reset completed successfully!")
        
    except Exception as e:
        logger.error(f"Database reset failed: {str(e)}")
        raise


def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        if command == "init":
            init_database()
        elif command == "reset":
            reset_database()
        else:
            print("Usage: python migrate.py [init|reset]")
            print("  init  - Create all tables")
            print("  reset - Drop and recreate all tables")
    else:
        init_database()


if __name__ == "__main__":
    main()