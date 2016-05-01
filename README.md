## nats-exp-01 ##

Experiment with NATS.io in Front of LevelDB with Node.js Async

  * NATS.io used as message bus
  * LevelDB as key/value data store
  * Node.js v6.0.0 using Async module
  * Monitor using NATS.io > wildcard

Anticipates

  * Microservices on IoT device
  * Running in Docker containers on Raspberry Pi
  * LevelDB for IoT device configuration data
  * Message bus instead of point-to-point IPC
  * Monitor all microservice communication on message bus

### Run ###

Start NATS.io server:

    [jfathman@cloud dnld]$ ./gnatsd -a localhost
    [13859] 2016/05/01 08:03:20.071902 [INF] Starting gnatsd version 0.7.2
    [13859] 2016/05/01 08:03:20.072909 [INF] Listening for client connections on localhost:4222
    [13859] 2016/05/01 08:03:20.073404 [INF] gnatsd is ready

Start monitor:

    [jfathman@cloud nats-exp-01]$ ./monitor.js

Run app:

    [jfathman@cloud nats-exp-01]$ ./app.js 
    2016-05-01 10:43:05.935 db.open: ./mydb
    2016-05-01 10:43:05.943 tx: { subject: 'db', id: 0, cmd: 'put', key: 'key1', val: 'val1' }
    2016-05-01 10:43:05.987 rx: {"subject":"db","id":0,"err":null}
    2016-05-01 10:43:05.988 tx: { subject: 'db', id: 1, cmd: 'get', key: 'key1' }
    2016-05-01 10:43:05.991 rx: {"subject":"db","id":1,"val":"val1","err":null}
    2016-05-01 10:43:05.992 tx: { subject: 'db', id: 2, cmd: 'del', key: 'key1' }
    2016-05-01 10:43:05.998 rx: {"subject":"db","id":2,"err":null}
    2016-05-01 10:43:05.999 tx: { subject: 'db', id: 3, cmd: 'get', key: 'key1' }
    2016-05-01 10:43:06.002 rx: {"subject":"db","id":3,"val":null,"err":"NotFoundError: Key not found in database [key1]"}
    2016-05-01 10:43:06.005 db.close: ./mydb

Observe monitor output:

    [jfathman@cloud nats-exp-01]$ ./monitor.js 
    2016-05-01 10:43:05.984 [req]: {"subject":"db","id":0,"cmd":"put","key":"key1","val":"val1"}
    2016-05-01 10:43:06.010 [res]: {"subject":"db","id":0,"err":null}
    2016-05-01 10:43:06.010 [req]: {"subject":"db","id":1,"cmd":"get","key":"key1"}
    2016-05-01 10:43:06.013 [res]: {"subject":"db","id":1,"val":"val1","err":null}
    2016-05-01 10:43:06.014 [req]: {"subject":"db","id":2,"cmd":"del","key":"key1"}
    2016-05-01 10:43:06.014 [res]: {"subject":"db","id":2,"err":null}
    2016-05-01 10:43:06.015 [req]: {"subject":"db","id":3,"cmd":"get","key":"key1"}
    2016-05-01 10:43:06.015 [res]: {"subject":"db","id":3,"val":null,"err":"NotFoundError: Key not found in database [key1]"}

Inspect resulting LevelDB database files:

```
[jfathman@cloud nats-exp-01]$ ls -ltr mydb/
-rw-r--r-- 1 jfathman jfathman  0 May  1 10:43 LOCK
-rw-r--r-- 1 jfathman jfathman 50 May  1 10:43 MANIFEST-000002
-rw-r--r-- 1 jfathman jfathman 16 May  1 10:43 CURRENT
-rw-r--r-- 1 jfathman jfathman 57 May  1 10:43 LOG
-rw-r--r-- 1 jfathman jfathman 55 May  1 10:43 000003.log
```
```
[jfathman@cloud nats-exp-01]$ hexdump -C mydb/MANIFEST-000002
00000000  56 f9 b8 f8 1c 00 01 01  1a 6c 65 76 65 6c 64 62  |V........leveldb|
00000010  2e 42 79 74 65 77 69 73  65 43 6f 6d 70 61 72 61  |.BytewiseCompara|
00000020  74 6f 72 a4 9c 8b be 08  00 01 02 03 09 00 03 04  |tor.............|
00000030  04 00                                             |..|
00000032
```
```
[jfathman@cloud nats-exp-01]$ hexdump -C mydb/CURRENT
00000000  4d 41 4e 49 46 45 53 54  2d 30 30 30 30 30 32 0a  |MANIFEST-000002.|
00000010
```
```
[jfathman@cloud nats-exp-01]$ cat mydb/LOG
2016/05/01-10:43:05.926571 7f856a68a700 Delete type=3 #1
```
```
[jfathman@cloud nats-exp-01]$ hexdump -C mydb/000003.log
00000000  da fd 29 a4 17 00 01 01  00 00 00 00 00 00 00 01  |..).............|
00000010  00 00 00 01 04 6b 65 79  31 04 76 61 6c 31 82 69  |.....key1.val1.i|
00000020  b5 38 12 00 01 02 00 00  00 00 00 00 00 01 00 00  |.8..............|
00000030  00 00 04 6b 65 79 31                              |...key1|
00000037
```
