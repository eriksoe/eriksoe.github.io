#!/bin/bash

# Colors:
# Dark gray BG: #323232
# Dark green: #326432
# //Mediumgreen: #326432 ?
# Light green: #64FF64
bg='#323232'
reticule='#326432'
reticule2='#32cc32'
lightup1='#32ff32'
#lightup2='#32ff32'

function makeRadarImage() {
    local radius=$1 ret=$2 light=$3 outfile=$4
    convert -size 200x200 xc:$light \
        -strokewidth 0 -stroke none -fill "$bg" \
        -draw "translate 100,100 circle 0,0 $radius,0" \
        -strokewidth 2 -stroke "$ret" -fill none \
        -draw 'translate 100,100 circle 0,0 120,0' \
        -draw 'translate 100,100 circle 0,0 102,0' \
        -draw 'translate 100,100 circle 0,0 70,0' \
        -draw 'translate 100,100 circle 0,0 30,0' \
        "$outfile"
}

makeRadarImage 0   "$reticule2" "$lightup1" radar0.png
makeRadarImage 30  "$reticule" "$lightup1" radar1.png
makeRadarImage 70  "$reticule" "$lightup1" radar2.png
makeRadarImage 102 "$reticule" "$lightup1" radar3.png
makeRadarImage 120 "$reticule" "$lightup1" radar4.png
