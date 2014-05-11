!#/bin/sh

for f in $(find input/pdf -name '*.pdf'); do pdftotext -enc UTF-8 $f; done

