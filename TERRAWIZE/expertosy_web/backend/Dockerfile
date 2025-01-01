FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
ENV UVICORN_WORKERS=4
ENV UVICORN_HOST=0.0.0.0
ENV UVICORN_PORT=8080
ENV UVICORN_LOG_LEVEL=info
ENV UVICORN_LOOP=auto
ENV UVICORN_HTTP=h11

# Add health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose the port the app runs on
EXPOSE 8080

# Use uvicorn as the production server with optimized settings
CMD ["uvicorn", "app:asgi_app", \
     "--host", "0.0.0.0", \
     "--port", "8080", \
     "--workers", "4", \
     "--log-level", "info", \
     "--loop", "auto", \
     "--http", "h11", \
     "--lifespan", "on"]