import multiprocessing
import os

# Gunicorn configuration
bind = "0.0.0.0:8080"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"  # Use sync workers for Flask's async support
timeout = 120
keepalive = 5
max_requests = 1000
max_requests_jitter = 50

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# SSL (if needed)
# keyfile = "path/to/keyfile"
# certfile = "path/to/certfile"

# Worker process naming
proc_name = "expertosy_backend"

# Preload app for better performance
preload_app = True

# Clean up worker processes
worker_tmp_dir = "/dev/shm" 