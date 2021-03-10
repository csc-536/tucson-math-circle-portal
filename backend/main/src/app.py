from fastapi import FastAPI
from backend.main.src.routers import user_router, meeting_router
from backend.connect_to_mongodb import connect_to_mongodb
import uvicorn


app = FastAPI()


app.include_router(user_router.router, prefix="/user_router", tags=["Users"])
app.include_router(meeting_router.router, prefix="/meetings_router", tags=["Meetings"])


if __name__ == "__main__":
    connect_to_mongodb()
    uvicorn.run(app, host="0.0.0.0", port=9000)