from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.routes.auth import get_current_user
from app.models.user import User
from app.services.ai_service import get_ai_response, generate_chart
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    chart_url: Optional[str] = None

@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        response = await get_ai_response(request.message, current_user.id, db)
        chart_url = None
        print(f"recieved resp from llm : ", response)
        # Check if chart generation is requested
        if any(keyword in request.message.lower() for keyword in ['chart', 'graph', 'plot', 'visualize']):
            chart_url = await generate_chart(request.message, current_user.id, db)
        
        return ChatResponse(response=str(response), chart_url=chart_url)
    except Exception as e:

        raise HTTPException(status_code=500, detail=str(e))