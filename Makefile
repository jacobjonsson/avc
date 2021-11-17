build/backend:
	@echo "Building backend"
	(cd server && npm install && npm run build && npm run migrate up)

build/local/backend:
	@echo "Building backend"
	(cd server && npm run build)

start/backend:
	@echo "Starting backend"
	(cd server && npm run start)

build/client:
	@echo "Building client"
	(cd client && npm install && npm run build)

build/local/client:
	@echo "Building client"
	(cd client && npm run build)
