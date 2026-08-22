fetch('http://localhost:3000')
  .then(res => res.text())
  .then(text => {
    const matches = text.match(/src="([^"]*storage\.googleapis\.com[^"]*)"/g);
    console.log(matches);
  })
  .catch(console.error);
