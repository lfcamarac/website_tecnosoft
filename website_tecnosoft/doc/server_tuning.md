# Tecnosoft Server Tuning Guide (Odoo 18.0)

To ensure maximum performance for the Tecnosoft eCommerce theme, follow these configuration guidelines in your `odoo.conf` file.

## Performance Settings (odoo.conf)

```ini
[options]
; Workers calculation: (CPU cores * 2) + 1
; Adjust based on your server capacity (e.g., 4 cores = 9 workers)
workers = 9

; Memory limits to prevent bloat
limit_memory_hard = 2684354560
limit_memory_soft = 2147483648
limit_request = 8192
limit_time_cpu = 60
limit_time_real = 120

; Database concurrency
db_maxconn = 64

; Proxy mode (mandatory if using Nginx/Reverse Proxy)
proxy_mode = True
```

## Infrastructure Recommendations

1. **PostgreSQL**:
   - `shared_buffers`: Set to 25% of your total RAM.
   - `work_mem`: 4MB per connection.
2. **Reverse Proxy (Nginx)**:
   - Enable Gzip compression.
   - Set up SSL (Let's Encrypt).
3. **Caching**:
   - Use Redis for session management if high availability is required.
   - Ensure Odoo is converting images to WebP (Native in v18).
