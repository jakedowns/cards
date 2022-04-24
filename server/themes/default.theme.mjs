// default theme

const DEFAULT_THEME_COLORS = {
    // bg: '#332B8A',
    bg: '#000000',

    card: 'rgba(124, 96, 204, 0.8)',
    text: '#ffffff'
}

export default {
    colors: DEFAULT_THEME_COLORS,
    tableTopStyle: {
        overflow: 'hidden',
        backgroundColor: DEFAULT_THEME_COLORS.bg,
        //backgroundImage: 'url("https://images.unsplash.com/photo-1498462335304-e7263fe3925a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80")',
        backgroundSize: 'cover',
        // filter: 'invert()'

    },
    cards: {
        globalStyle: {
            boxShadow: '0px 0px 5px rgba(0,0,0,0.5)',
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
            backgroundImage: 'url("https://images.unsplash.com/photo-1650647441377-715a124f6a2f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80")',
        }
    }
}