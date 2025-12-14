import httpx
from abc import ABC, abstractmethod
from typing import Optional
from app.core.config import settings

class LLMProvider(ABC):
    @abstractmethod
    async def generate_response(self, prompt: str) -> str:
        pass

class OllamaProvider(LLMProvider):
    async def generate_response(self, prompt: str) -> str:
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{settings.OLLAMA_BASE_URL}/api/generate",
                    json={
                        "model": "gemma3:1b",
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.0,
                            "num_ctx": 8192,
                            "num_predict": 600,
                            "repeat_penalty": 1.2,
                        }
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get("response", "").strip()
                else:
                    return "AI service temporarily unavailable."
        except Exception as e:
            print(f"Ollama error: {e}")
            return "Connection issues. Please try again."

class OpenAIProvider(LLMProvider):
    async def generate_response(self, prompt: str) -> str:
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-3.5-turbo",
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": 500,
                        "temperature": 0.1
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result["choices"][0]["message"]["content"].strip()
                else:
                    return "OpenAI service unavailable."
        except Exception as e:
            print(f"OpenAI error: {e}")
            return "Connection issues. Please try again."

class GeminiProvider(LLMProvider):
    async def generate_response(self, prompt: str) -> str:
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={settings.GEMINI_API_KEY}",
                    headers={"Content-Type": "application/json"},
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "temperature": 0.1,
                            "maxOutputTokens": 500
                        }
                    }
                )
                
                print(f"Gemini response status: {response.status_code}")
                print(f"Gemini response: {response.text[:200]}")
                
                if response.status_code == 200:
                    result = response.json()
                    if "candidates" in result and len(result["candidates"]) > 0:
                        return result["candidates"][0]["content"]["parts"][0]["text"].strip()
                    else:
                        print(f"No candidates in response: {result}")
                        return "No response generated."
                else:
                    print(f"Gemini API error: {response.status_code} - {response.text}")
                    return "Gemini service unavailable."
        except Exception as e:
            print(f"Gemini error: {e}")
            import traceback
            traceback.print_exc()
            return "Connection issues. Please try again."

def get_llm_provider() -> LLMProvider:
    if settings.LLM_PROVIDER == "openai":
        return OpenAIProvider()
    elif settings.LLM_PROVIDER == "gemini":
        return GeminiProvider()
    else:
        return OllamaProvider()