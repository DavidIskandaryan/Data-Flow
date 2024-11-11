# Data flow

Data Flow leverages AI and machine learning to to analyze inefficiencies in your business and suggest improvements to maximize profit in a simple, easy to understand way. Starting with removing those overpriced consultancy fees you are paying to get information that could be just a few clicks away with us.

## How to Run it

You first need to configure the environment, by creating a text file called `.env` in the project directory (that's the directory that contains `compose.yml`). It should contain a MongoDB connection string as the variable `MDB_URI`:

```text
export MONGODB_URI='mongodb+srv://YOURUSERNAME:YOURPASSWORDHERE@sandbox.ABCDEF.mongodb.net/todo_list_app?retryWrites=true&w=majority&appName=farm_stack_webinar'
```

You'll need to set it to _your_ MongoDB connection string, though, not mine.

Then you will need to install dependencies:

```text
cd backend
pip install -r requirements-dev.txt
```

## If You Have Just Installed

If you have the [Just] task runner installed, then you should be able to get up-and-running with:

```shell
just dependencies
just load-fixtures
just run
```

## Without Just

If you have [Docker] installed already, you can change to the project directory in your favourite terminal, and run the following to install the Node dependencies:

```shell
# Install all Node dependencies within the Docker environment:
docker compose run frontend npm install
# Install Python dependencies into container:
docker compose build
```

Once you've followed these steps, you can spin up the entire development environment with:

```shell
# Start the development cluster:
docker compose up
```

Now you can visit your site at: http://localhost:8000/


[FastAPI]: https://fastapi.tiangolo.com/
[React]: https://react.dev/
[MongoDB]: https://www.mongodb.com/
[Docker Compose]: https://docs.docker.com/compose/
[Just]: https://just.systems/man/en/
[PyTest]: https://docs.pytest.org/