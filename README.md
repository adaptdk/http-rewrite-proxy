## Simple HTTP proxy

Following commands will proxy example.com on localhost:8080

    $ npm install http-rewrite-proxy -g
    $ http-rewrite-proxy --host localhost \
      --port 8080 \
      --target-host example.com \
      --target-port 80
