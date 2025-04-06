# DEPLOYMENT

- Develop a new feature

- Build a new image:

```javascript
docker build -t bit2me-trading-bot:latest .
```

- Tag the image:

```javascript
docker tag bit2me-trading-bot:latest registry.digitalocean.com/monteagudo/bit2me-trading-bot:latest
```

- Test the image in local:

```javascript
docker run -p 8081:8080 registry.digitalocean.com/monteagudo/bit2me-trading-bot:latest
```

- Push the image in Digital Ocean Registry:

```javascript
docker push registry.digitalocean.com/monteagudo/bit2me-trading-bot:latest
```
