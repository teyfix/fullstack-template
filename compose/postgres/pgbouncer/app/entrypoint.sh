#!/usr/bin/env sh
set -eu

find "/app" -type f -name '*.gotpl' | while read -r template; do
  output="/tmp${template%.gotpl}"
  gomplate -f "$template" -o "$output"
done

exec /bin/sh /entrypoint.sh /usr/bin/pgbouncer /etc/pgbouncer/pgbouncer.ini
