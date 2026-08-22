fetch('https://storage.googleapis.com/mightymemories-images/mighty-memories/portfolio/portfolio-1787374182127-swn4vb')
  .then(res => res.arrayBuffer())
  .then(buf => {
    const bytes = new Uint8Array(buf.slice(0, 8));
    console.log(bytes);
  })
  .catch(console.error);
