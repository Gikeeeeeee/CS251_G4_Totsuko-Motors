## Getting Started
1. Install dependencies
```bash
npm install
```
2. Setup environment variables
Change file name .env.example -> .env

```bash
#Example
DB_HOST=localhost 
DB_USER=root 
DB_PASSWORD=password 
DB_NAME=app_db 
PORT=3001
```

3. Run
```bash
npm run dev
```

## Database
Run MySQL on Docker
```bash
docker-compose up -d
```