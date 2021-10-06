var Delta = Quill.import('delta');
var quill = new Quill('#editor-container', {
  modules: {
    toolbar: [
      ['bold', 'italic'],
      ['link', 'blockquote', 'code-block', 'image'],
      [{ list: 'ordered' }, { list: 'bullet' }],
    ]
  },
  placeholder: 'Compose an epic...',
  theme: 'snow'
});

var form = document.querySelector('form');

// Initialize localstorage
var storage = window.localStorage;

// Set existing data from the storage
if (storage.getItem('noteData') != null) {
  quill.setContents(JSON.parse(storage.getItem('noteData')));
  $('#createNoteId').hide();
} else {
  $('#noteGroupId').hide();
  $('#deleteNoteId').hide();
  $('#saveNoteId').hide();

  $('#createNoteId').show();
}

// Create note
$('#createNoteId').click(function () {
  $('#createNoteId').hide();

  $('#noteGroupId').show();
  $('#deleteNoteId').show();
  $('#saveNoteId').show();
});

// Delete note
$('#deleteNoteId').click(function () {
  storage.removeItem('noteData');
  window.location.reload();
});

form.onsubmit = function () {
  // Populate hidden form on submit
  var about = document.querySelector('input[name=about]');
  about.value = JSON.stringify(quill.getContents());

  // Save data to storage
  onSave(quill);

  //console.log("Submitted", $(form).serialize(), $(form).serializeArray());

  // No back end to actually submit to!
  alert('Open the console to see the submit data!')
  return false;
};

// Store accumulated changes
var change = new Delta();
quill.on('text-change', function (delta) {
  change = change.compose(delta);
});

// Save periodically
setInterval(function () {
  if (change.length() > 0) {
    console.log('Saving changes', change);
    /* 
    Send partial changes
    $.post('/your-endpoint', { 
      partial: JSON.stringify(change) 
    });
    
    Send entire document
    $.post('/your-endpoint', { 
      doc: JSON.stringify(quill.getContents())
    });
    */

    // Save data to storage
    onSave(quill);
    change = new Delta();
  }
}, 2 * 1000);

function onSave(quill) {
  storage.setItem('noteData', JSON.stringify(quill.getContents()));
}

// Check for unsaved data
window.onbeforeunload = function () {
  if (change.length() > 0) {
    return 'There are unsaved changes. Are you sure you want to leave?';
  }
}
