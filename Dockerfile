FROM ubuntu:xenial
MAINTAINER james@jamieduerden.co.uk

RUN apt-get -qq update \
	&& DEBIAN_FRONTEND=noninteractive apt-get -qq install -y --no-install-recommends git ca-certificates hugo \
	&& rm -rf /var/lib/apt/lists/*

# Create working directory
RUN mkdir /usr/share/blog
WORKDIR /usr/share/blog

# Expose default hugo port
EXPOSE 1313

# Automatically build site
COPY site/ /usr/share/blog
ONBUILD RUN hugo -d /usr/share/nginx/html/

# By default, serve site
ENV HUGO_BASE_URL http://jamieduerden.me
CMD hugo server -b ${HUGO_BASE_URL} --appendPort=false --bind=0.0.0.0
