import { createStitches } from '@stitches/react'

export const { 
    config,
    styled,
    css,
    globalCss,
    keyframes,
    getCssText,
    theme,
    createTheme,
} = createStitches({
    theme: {
        colors: {
            white: '#fff',
            
            gray900: '#121214',
            gray800: '#420551',
            gray300: '#f9f9f9',
            gray100: '#e1e1e6',

            green500: '#139b50',
            green300: '#00b381'
        },

        fontSizes: {
            md: '1.125rem',
            lg: '1.25rem',
            xl: '1.5rem',
            '2xl': '2rem',
        }
    }
})