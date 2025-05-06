from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from pydantic import BaseModel
from bpmn_handler import router as bpmn_router

# Constants
SECRET_KEY = "your-secret-key"  # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI(
    title="CRAFD API Gateway",
    description="""
    Демонстрационная версия системы CRAFD - комплексное решение для антифрод-проверки клиентов банка.
    
    ### Основные возможности:
    * 🔍 Идентификация и верификация клиентов
    * 📋 Проверка по спискам (черные списки, списки террористов и др.)
    * 📊 Скоринг и оценка рисков
    * 🔄 Мониторинг поведения
    * 🎯 Выявление мошеннических схем
    * 📈 Аналитика и отчетность
    
    ### Роли пользователей:
    * 👨‍💼 Фрод-аналитик: проверка и расследование подозрительных случаев
    * 👨‍💻 Администратор: настройка правил и управление системой
    """,
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include BPMN router
app.include_router(bpmn_router, prefix="/api/processes", tags=["Процессы"])

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Models with enhanced documentation
class Token(BaseModel):
    """Токен доступа для авторизации в системе"""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Данные, закодированные в токене"""
    username: Optional[str] = None
    role: Optional[str] = None

class User(BaseModel):
    """Информация о пользователе системы"""
    username: str
    role: str
    disabled: Optional[bool] = None

    class Config:
        schema_extra = {
            "example": {
                "username": "analyst",
                "role": "fraud_analyst",
                "disabled": False
            }
        }

# Mock user database with enhanced documentation
fake_users_db = {
    "analyst": {
        "username": "analyst",
        "role": "fraud_analyst",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "disabled": False
    },
    "admin": {
        "username": "admin",
        "role": "admin",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "disabled": False
    }
}

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = fake_users_db.get(token_data.username)
    if user is None:
        raise credentials_exception
    return User(**user)

@app.post("/token", response_model=Token, tags=["Авторизация"])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Получение токена доступа для работы с системой.
    
    - **username**: имя пользователя (analyst или admin)
    - **password**: пароль (для демо любой)
    """
    user = fake_users_db.get(form_data.username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=User, tags=["Пользователи"])
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Получение информации о текущем пользователе"""
    return current_user

# Service routes with enhanced documentation
@app.get("/health", tags=["Система"])
async def health_check():
    """Проверка работоспособности системы"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Proxy routes for microservices with enhanced documentation
@app.get("/api/identification/{client_id}", tags=["Проверки"])
async def get_client_identification(
    client_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Получение результатов идентификации клиента
    
    - **client_id**: Идентификатор клиента
    """
    return {
        "client_id": client_id,
        "status": "verified",
        "verification_details": {
            "document_check": "passed",
            "face_match": "passed",
            "liveness_check": "passed"
        }
    }

@app.get("/api/lists/{client_id}", tags=["Проверки"])
async def check_client_lists(
    client_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Проверка клиента по спискам
    
    - **client_id**: Идентификатор клиента
    """
    return {
        "client_id": client_id,
        "matches": [],
        "checked_lists": [
            "terrorist_list",
            "fraud_list",
            "pep_list"
        ]
    }

@app.get("/api/scoring/{client_id}", tags=["Проверки"])
async def get_client_scoring(
    client_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Получение скоринговой оценки клиента
    
    - **client_id**: Идентификатор клиента
    """
    return {
        "client_id": client_id,
        "risk_score": 0.5,
        "risk_factors": [
            "unusual_behavior",
            "recent_activity"
        ],
        "recommendation": "additional_verification"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 