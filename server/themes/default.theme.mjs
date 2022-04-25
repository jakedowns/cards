// default theme

const DEFAULT_THEME_COLORS = {
    // bg: '#332B8A',
    bg: '#000',

    card: 'rgba(124, 96, 204, 0.9)',
    text: '#ffffff'
}

export default {
    colors: DEFAULT_THEME_COLORS,
    tableTopStyle: {
        overflow: 'hidden',
        backgroundColor: DEFAULT_THEME_COLORS.bg,
        backgroundSize: 'cover',

    },
    cards: {
        globalStyle: {
            boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontSize: '1.5em',
            borderRadius: '0.5rem',
            backgroundColor: DEFAULT_THEME_COLORS.card,

            color: DEFAULT_THEME_COLORS.text
        },
        frontStyle: {
            // doesn't play nice with 3d transforms :G
            // backdropFilter: 'blur(5px)',
        },
        backStyle: {
            backgroundImage: 'url("./images/default-back.jpg")',
            backgroundSize: 'cover'
        }
    }
}