FROM tiangolo/uvicorn-gunicorn-fastapi:python3.10

COPY requirements.txt .

RUN pip install -r requirements.txt

WORKDIR /app

COPY . .

RUN pip install fastapi uvicorn

CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]