from app.db import engine, Base
from app.models.interaction import Interaction

print("Creating tables...")
Base.metadata.create_all(bind=engine)
print("Done.")

