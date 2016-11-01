#!/bin/bash
# Deploy hugo site.
# Stolen from https://github.com/twistedpair/lustforge.com

set -e

DISTRIBUTION_ID=E1RAYN0OXLBCSZ
BUCKET_NAME=www.mcclimon.org

hugo -v

# Copy over pages - not static js/img/css
aws s3 sync --acl "public-read" --sse "AES256" public/ s3://$BUCKET_NAME/ \
    --exclude 'img' --exclude 'js' --exclude 'css' --exclude 'about' \
    --exclude 'bio' --exclude 'cv' --exclude 'ii-V' --exclude 'projects'

# Ensure static files are set to cache forever - cache for a month --cache-control "max-age=2592000"
aws s3 sync --cache-control "max-age=2592000" --acl "public-read" --sse "AES256" \
    public/css/ s3://$BUCKET_NAME/css/
aws s3 sync --cache-control "max-age=2592000" --acl "public-read" --sse "AES256" \
    public/js/ s3://$BUCKET_NAME/js/

# Invalidate blog pages and index
# Don't do this more than 500 times a month, or it'll cost.
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths /index.html /blog/*
