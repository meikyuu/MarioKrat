# MarioKrat
This is an application that provides an interface for hosting MarioKrat
tournaments.

## Development
Running the application locally requires you to have Docker Compose installed.

You can run the application with:
```
docker-compose up
```

The application should then be available at `localhost:8080`, this port can
optionally be altered by passing a `PORT` environment variable to this command.

On first run you should also migrate the database.
```
docker-compose exec backend ./manage.py migrate
```

## Deployment
TODO
