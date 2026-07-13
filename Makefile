PORT ?= 8000

.PHONY: setup start install-backend install-frontend db-init dev-backend dev-frontend

# Install dependencies for both backend and frontend
setup: install-backend install-frontend db-init
	@echo "Setup complete! You can now run 'make start' to run the application."

install-backend:
	npm --prefix backend install

install-frontend:
	npm --prefix frontend install

# Initialize the database schema via migrations
db-init:
	npm --prefix backend run migrate:up

# Start both frontend and backend in development mode concurrently
start:
	npx -y concurrently "npm --prefix backend run dev" "npm --prefix frontend run dev"

dev-backend:
	npm --prefix backend run dev

dev-frontend:
	npm --prefix frontend run dev

test:
	npm --prefix backend test

lint:
	npm --prefix backend run lint

format:
	npm --prefix backend run format

register:
	http POST :$(PORT)/api/auth/register \
	name=madmax \
	email=madmax@gmail.com \
	password=123123

login:
	http POST :$(PORT)/api/auth/login \
	email=madmax@gmail.com \
	password=123123

me:
	http GET :$(PORT)/api/auth/me \
	Authorization:"Bearer $(TOKEN)"
