(function() {
  const extract = window['handlebars-variables-extract'].default;
  const textarea = document.getElementById('code');

  update(textarea.textContent);
  init();

  function init(){
    const editor = CodeMirror.fromTextArea(document.getElementById('code'), {
      mode: {name: "handlebars", base: "text/html"},
    });

    editor.on('change', function(e) {
      update(e.getValue());
    })

    textarea.addEventListener('input', (e) => {
      console.log(e);
      template = e.target.textContent;
      update(template);
    })
  }

  function update(template) {
    let result;
    try {
      result = extract(template);
    } catch (error) {
      console.error(error)
      result = error.message.replace(/\n/g, '<br />');
    }
    document.getElementById('view').innerHTML = JSON.stringify(result, null, 2);
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightBlock(block);
    });
  }
})()

