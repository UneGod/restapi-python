from fastapi import FastAPI
from events.router import router as event_router
from users.router import router as user_router
from admin.admin import router as admin_router
from reference.router import router as ref_router
from fastapi.middleware.cors import CORSMiddleware

import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_headers=["*"],
    allow_methods=["*"],
    allow_credentials=True,
)

app.include_router(router=event_router)
app.include_router(router=user_router)
app.include_router(router=admin_router)
app.include_router(router=ref_router)


if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)