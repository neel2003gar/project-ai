#!/usr/bin/env python3
"""
Minimal test application for Azure deployment
"""
import os

# Simple WSGI application
def application(environ, start_response):
    status = '200 OK'
    headers = [
        ('Content-Type', 'application/json'),
        ('Access-Control-Allow-Origin', '*'),
        ('Access-Control-Allow-Headers', '*'),
        ('Access-Control-Allow-Methods', '*'),
    ]
    start_response(status, headers)

    response_data = '{"message": "Azure backend is working!", "status": "success", "timestamp": "2024-12-19"}'
    return [response_data.encode('utf-8')]

if __name__ == '__main__':
    from wsgiref.simple_server import make_server
    port = int(os.environ.get('PORT', 8000))
    server = make_server('0.0.0.0', port, application)
    print(f"Starting test server on port {port}")
    server.serve_forever()
