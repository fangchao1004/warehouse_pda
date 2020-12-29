import React from 'react'
import { View } from 'react-native'
/**
 * pink
red
yellow
orange
cyan
green
blue
purple
geekblue
magenta
volcano
gold
lime
 * @param {*} param0 
 */
export default function Badge({ size = 8, color = '#F50', marginRight = 5 }) {
    return (
        <View style={{
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: size,
            marginRight: marginRight,
        }}>
        </View>
    )
}
