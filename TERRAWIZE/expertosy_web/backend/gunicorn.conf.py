import os

# Basic Configuration
bind = f"0.0.0.0:{os.getenv('PORT', '8080')}"
workers = 4  # Fixed number of workers instead of dynamic
worker_class = 'sync'
threads = 4

# Worker Configuration
worker_connections = 1000
timeout = 300
keepalive = 2

# Logging
accesslog = None  # Disable access log as Railway handles this
errorlog = '-'  # Log errors to stderr
loglevel = 'info'

# Performance Tuning
max_requests = 100
max_requests_jitter = 10
graceful_timeout = 30
preload_app = False  # Disable preloading to avoid memory issues

# Process Naming
proc_name = 'expertosy_backend'

# Development Mode
reload = False
daemon = False 