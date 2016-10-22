#!/bin/sh
rtl_fm -f 104.0M -f 112.0M -f 120.5M -M wbfm -s 170k -A std -l 10 -E deemp -r 48k | aplay -r 48000 -f S16_LE
