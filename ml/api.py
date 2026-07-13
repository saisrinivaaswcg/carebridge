from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


@app.get("/")
def home():
    return {
        "service": "CareBridge ML",
        "status": "running"
    }


class UserInput(BaseModel):
    user_id: str
    transcript: str


@app.post("/analyse_user")
def analyse_user(data: UserInput):

    return {
        "user_id": data.user_id,
        "risk_score": 18.86,
        "alert_tier": "HIGH",
        "message": "Prototype response"
    }