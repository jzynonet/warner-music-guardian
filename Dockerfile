FROM python:3.10-slim

WORKDIR /app

COPY backend/requirements.txt /app/backend/requirements.txt

RUN cd backend && pip install --no-cache-dir -r requirements.txt

COPY . /app

WORKDIR /app/backend

CMD ["python", "app.py"]
