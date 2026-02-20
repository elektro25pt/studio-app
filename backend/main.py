from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates (page router style)
templates = Jinja2Templates(directory="templates")


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        "pages/index.html",
        {"request": request, "title": "Home", "active": "home"}
    )


@app.get("/about", response_class=HTMLResponse)
async def about(request: Request):
    return templates.TemplateResponse(
        "pages/about.html",
        {"request": request, "title": "About Us", "active": "about"}
    )


@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    # You can add auth check here later
    user = {"name": "Alex", "role": "admin"}  # mock
    return templates.TemplateResponse(
        "pages/dashboard.html",
        {
            "request": request,
            "title": "Dashboard",
            "active": "dashboard",
            "user": user
        }
    )


# Catch-all for 404
@app.exception_handler(404)
async def not_found(request: Request, exc: HTTPException):
    return templates.TemplateResponse(
        "pages/404.html",
        {"request": request, "title": "Page Not Found"},
        status_code=404
    )


# Optional: API endpoint example (for HTMX / fetch calls)
@app.get("/api/hello")
async def api_hello():
    return {"message": "Hello from FastAPI!", "time": "2026"}