# Library Atlas

A modern full-stack library database project built with:

- React
- Tailwind CSS
- FastAPI
- PostgreSQL
- SQLAlchemy
- Docker Compose

## Features

- Add books and editions
- Prevent duplicate editions
- Delete individual editions
- Delete complete books
- Search books by title or author
- Sort by title
- Sort by author
- Display library statistics

---

## Quick Start

### Requirements

Install:

- Git
- Docker Desktop

### Clone

```bash
git clone https://github.com/WEIHAN1017/modern-library-db.git
cd modern-library-db
```

### Start

```bash
docker compose up --build
```

Open:

```text
http://localhost:5173
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

### Stop

```bash
docker compose down
```

### Delete database data too

```bash
docker compose down -v
```

---

## Development Architecture

```text
React
  |
  | REST API
  v
FastAPI
  |
  | SQLAlchemy
  v
PostgreSQL
```

## Original Project

This project modernizes a command-line C++ Library Database assignment into a full-stack web application.