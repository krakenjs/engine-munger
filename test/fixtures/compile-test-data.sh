#!/bin/bash

set -e

for tmpl in $( (cd test/fixtures/templates; find . -type f | grep -v invalid | sed -e 's@[.]/@@; s@.dust@@') ); do
    for lang in US/es US/en; do
        echo $lang $tmpl
        TMPF="test/fixtures/.build/$lang/$(echo $tmpl)"
        mkdir -p test/fixtures/{tmp,.build}/$lang/$(dirname $tmpl) &&
        localizr --props test/fixtures/properties/$lang/$(basename $tmpl).properties --pwd test/fixtures/templates --out test/fixtures/tmp/$lang test/fixtures/templates/$tmpl.dust &&
        dustc --pwd test/fixtures/tmp/$lang test/fixtures/tmp/$lang/$tmpl.dust > $TMPF.js.tmp &&
        mv $TMPF.js.tmp $TMPF.js
        rm -f $TMPF.js.tmp
    done

    TMPF="test/fixtures/.build/$(echo $tmpl)"
    localizr --props test/fixtures/properties/null.properties --pwd test/fixtures/templates --out test/fixtures/tmp/ test/fixtures/templates/$tmpl.dust &&
    dustc --pwd test/fixtures/tmp/ test/fixtures/tmp/$tmpl.dust > $TMPF.js.tmp &&
    mv $TMPF.js.tmp $TMPF.js
    rm -f $TMPF.js.tmp
done
