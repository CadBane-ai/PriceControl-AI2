# 16. Error Handling Strategy
A unified strategy will be used. Backend API errors will conform to a standardized JSON structure. A global error handler will catch all exceptions, log them to Sentry, and return the structured error to the client, which will display a user-friendly message.
---