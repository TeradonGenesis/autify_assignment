# Project Title

Autify assignment

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Structure](#structure)
- [Enhancement](#enhancement)
- [Usecase](#usecase)

## Installation

1. Clone the repository and cd into the folder:
   ```bash
   git clone https://github.com/TeradonGenesis/autify_assignment.git
   cd autify_assignment
   ```
2. Run this docker command, this should run the app once and install all the prerequisite items. This should install both the app and redis container
   ```bash
   docker-compose run app npm start -- --metadata http://www.wikipedia.org
   ```
3. However, if your environment already have a redis container with different settings, might want to change the docker compose variable
   ```yml
   redis:
        image: redis:latest
        container_name: my-redis
        ports:
            - "6379:6379"  # Expose Redis port
        networks:
            - my-network

    app:
        # other configuration
        depends_on:
            - redis
        environment:
            REDIS_HOST: my-redis  # Use the Redis container name as the host
            REDIS_PORT: 6379
        # other configuration
    ```
    Then change your .env.sample file to reflect your own settings
    ```bash
    REDIS_URL=redis://redis:6379
    ```

## Usage

1. Downloading the html file without metadata
    ```bash
    docker-compose run app npm start -- http://www.wikipedia.org
    ```
2. Print out the metadata. Metadata will be cached, previous cache will be refreshed
    ```bash
    docker-compose run app npm start -- --metadata http://www.wikipedia.org
    ```
3. Print out the metadata with more details. Metadata will be cached, previous cache will be refreshed
    ```bash
    docker-compose run app npm start -- --metadata --verbose http://www.wikipedia.org
    ```

4. Print out the cached metadata
    ```bash
    docker-compose run app npm start -- --metadata --cache http://www.wikipedia.org
    ```

5. Print out the cached metadata with more details
    ```bash
    docker-compose run app npm start -- --metadata --verbose --cache http://www.wikipedia.org
    ```

6. List out the files downloaded
    ```bash
    docker-compose run app npm start -- --list
    ```

## Structure

1. Based on Domain Driven Design folder structure
2. Use redis cache for faster retrieval
3. Using Time To Live caching strategy
3. Using .env file for more flexible configuration
4. Based on functional programming rather than class based
5. Using concurrent proccessing with Process.All
6. Modular design so it is easier to add validation, change extraction logic, add more items to be extracted

## Enhancement

1. Apply rate limiting to the API calls
2. Using messaging queue rather than Promise.All for concurrent processing
3. Use messaging queue to feed websites to the app rather than passing arguments
4. Maybe a better caching stratgey than TTL like LRU but depends on what is the use case
5. Add retry API call mechanism in the even there is a temporary network error when calling the website
6. Add duplicate website checking to make sure websites that is feed into the app like www.google.com and https:google.com is treated as one website rather than proccessed as two separate website
7. Add a --help command to know what commands are available 
8. Add checking to print out error if an invalid argument is given
9. Can set up the app as a lambda in AWS
10. Change the .env to use secrets manager in AWS instead for easier configuration and management
11. Add more url specific validation and add more normalization of urls

## Usecase

1. As a QA pipeline to make the website is working well (link validation, etc)
2. SEO analysis 
3. Can integrate with an LLM for self-healing
4. Can integrate with LLM to summarize what the website is about
5. Can integrate with LLM to create possible test cases


