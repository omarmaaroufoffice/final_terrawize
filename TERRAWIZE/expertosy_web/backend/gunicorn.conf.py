import multiprocessing
import os

# Gunicorn configuration
bind = f"0.0.0.0:{os.getenv('PORT', '8080')}"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = 'sync'  # Using sync workers instead of uvicorn
timeout = 120
keepalive = 5
max_requests = 1000
max_requests_jitter = 50
reload = False  # Disable auto-reload in production
preload_app = True
daemon = False
accesslog = '-'
errorlog = '-'
loglevel = 'info'

# SSL Configuration (if needed)
# keyfile = '/path/to/keyfile'
# certfile = '/path/to/certfile'

# Process Naming
proc_name = 'expertosy_backend'

# Server Mechanics
graceful_timeout = 30 