# Digital Identity System

## Run backend
pip install fastapi uvicorn sqlalchemy aiosqlite pydantic openai

uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

## Run frontend
npm install
npm run dev