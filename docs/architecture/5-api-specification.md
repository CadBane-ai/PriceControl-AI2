# 5. API Specification

```yaml
openapi: 3.0.1
info:
  title: "PriceControl API"
  version: "1.0.0"
  description: "API for the PriceControl financial assistant application."

servers:
  - url: "/api"
    description: "Local development server"

paths:
  /auth/register:
    post:
      summary: "Register a new user"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        '201':
          description: "User created successfully"
        '409':
          description: "User with this email already exists"

  /auth/login:
    post:
      summary: "Log in a user and create a session"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
      responses:
        '200':
          description: "Login successful, session cookie set"
        '401':
          description: "Invalid credentials"

  /ai/chat:
    post:
      summary: "Send a message to the AI assistant"
      security:
        - cookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                messages:
                  type: array
                  items:
                    # Reference to the Message data model
                mode:
                  type: string
                  enum: [instruct, thinking]
      responses:
        '200':
          description: "A streaming text response from the AI assistant."
          content:
            text/event-stream: {}
            
  /health:
    get:
      summary: "Get the health status of the application"
      responses:
        '200':
          description: "Service is healthy"

components:
  securitySchemes:
    cookieAuth:
      type: apiKey
      in: cookie
      name: "next-auth.session-token" # Example name
```

---
