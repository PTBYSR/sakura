PS C:\WINDOWS\system32> docker run --name sakura-redis -p 6379:6379 redis:7-alpine
Unable to find image 'redis:7-alpine' locally
7-alpine: Pulling from library/redis
f637881d1138: Pull complete
d75b3becd998: Pull complete
c70aae7b5e0d: Pull complete
380e8aa8b1fd: Pull complete
232f7549c9b0: Pull complete
4f4fb700ef54: Pull complete
fc4343b4accd: Pull complete
60c57c0072ef: Pull complete
Digest: sha256:ee64a64eaab618d88051c3ade8f6352d11531fcf79d9a4818b9b183d8c1d18ba
Status: Downloaded newer image for redis:7-alpine
1:C 08 Nov 2025 19:53:16.441 * oO0OoO0OoO0Oo Redis is starting oO0OoO0OoO0Oo
1:C 08 Nov 2025 19:53:16.441 * Redis version=7.4.7, bits=64, commit=00000000, modified=0, pid=1, just started
1:C 08 Nov 2025 19:53:16.441 # Warning: no config file specified, using the default config. In order to specify a config file use redis-server /path/to/redis.conf
1:M 08 Nov 2025 19:53:16.443 * monotonic clock: POSIX clock_gettime
1:M 08 Nov 2025 19:53:16.446 * Running mode=standalone, port=6379.
1:M 08 Nov 2025 19:53:16.448 * Server initialized
1:M 08 Nov 2025 19:53:16.449 * Ready to accept connections tcp

