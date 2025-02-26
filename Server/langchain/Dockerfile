FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies (con actualización forzada para evitar problemas de compatibilidad)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir langchain-community>=0.0.10 langchain-redis>=0.0.1

# Copy the rest of the application
COPY . .

# Set the port for the API server
EXPOSE 5000

# Start the API server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5000"]
