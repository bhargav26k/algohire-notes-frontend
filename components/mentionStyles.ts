const mentionStyle = {
  control: {
    backgroundColor: '#fff',
    fontSize: 14,
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    position: 'relative', 
  },
  highlighter: {
    overflow: 'hidden',
  },
  input: {
  margin: 0,
  padding: '0.5rem 0.75rem', // Tailwind: py-2 px-3
  minHeight: '2.5rem',       // consistent height
  fontSize: '0.875rem',      // text-sm
  backgroundColor: 'transparent',
  color: 'inherit',
  border: 'none',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
},
  suggestions: {
    list: {
      backgroundColor: 'white',
      border: '1px solid #ccc',
      fontSize: 14,
      position: 'absolute',
      bottom: '100%', // move above input
      marginBottom: '0.25rem',
      zIndex: 100,

    },
    item: {
      padding: '5px 15px',
      borderBottom: '1px solid #eee',
      '&focused': {
        backgroundColor: '#f4f4f4',
      },
    },
  },
}

export default mentionStyle
