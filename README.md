# conf.d

Nginx

## Config

```
cd /etc/nginx;

git clone git@github.com:mazeyqian/mazey.net.nginx.conf.d.git;

include /etc/nginx/mazey.net.nginx.conf.d/config/*.conf;
```

## Update

```
cd /etc/nginx/mazey.net.nginx.conf.d && git pull && service nginx restart;
```

## File Type

All

```
gif;png;bmp;jpeg;jpg;html;htm;shtml;xml;json;mp3;wma;flv;mp4;wmv;ogg;avi;doc;docx;xls;xlsx;ppt;pptx;txt;pdf;zip;exe;tat;ico;css;js;swf;apk;m3u8;ts
```

Image

```
png|jpeg|jpg|gif|ico|webp|mp3|mp4|webm|wma|bmp|swf|flv|wmv|avi|apk|m3u8|doc|docx|xls|xlsx|ppt|pptx|txt|pdf|zip|exe
```

Web

```
html|css|js|json|htm|shtml|xml|ts
```

## Refer

https://nginx.org/en/docs/example.html
