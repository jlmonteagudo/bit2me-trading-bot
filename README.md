# DEPLOYMENT

- Develop a new feature

- Build a new image:

```javascript
docker build -t bit2me-trading-bot:1.0.0 .
```

- Tag the image:

```javascript
docker tag bit2me-trading-bot:1.0.0 registry.digitalocean.com/monteagudo/bit2me-trading-bot:1.0.0
```

- Test the image in local:

```javascript
docker run -p 8081:8080 registry.digitalocean.com/monteagudo/bit2me-trading-bot:1.0.0
```

- Push the image in Digital Ocean Registry:

```javascript
docker push registry.digitalocean.com/monteagudo/bit2me-trading-bot:1.0.0
```
