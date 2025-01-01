FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
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
ENV GUNICORN_CMD_ARGS="--access-logfile=- --error-logfile=- --log-level=info"

# Add health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose the port the app runs on
EXPOSE 8080

# Use gunicorn as the production server with gevent worker
CMD gunicorn --bind "0.0.0.0:8080" \
    --workers 4 \
    --worker-class gevent \
    --timeout 120 \
    --keep-alive 65 \
    --log-file=- \
    --access-logfile=- \
    --error-logfile=- \
    --log-level=info \
    app:app