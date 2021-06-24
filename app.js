
function toggleModalDisplay() {
    
    const modal = document.getElementById('modal');

    if (modal.style.display == 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
    }

}

// Notes from local storage. If empty, sets notes to empty array
let userNotes = JSON.parse(localStorage.getItem('notes')) || [];

function addNote() {

    const text = document.querySelector('textarea').value;
    const dateCreated = new Date();
    const note = {
        text,
        dateCreated
    }

    // Add note to top of notes array
    userNotes.push(note);

    // Save new note to local storage
    localStorage.setItem('notes', JSON.stringify(userNotes));

    // Add new note to display
    displayNote(note);
}

function displayNote(note) {

    const section = document.getElementById('usernotes-viewer');
    const article = document.createElement('article');    

    article.innerHTML = `
    <p>${note.text}</p>
    `;
    section.prepend(article);
    
}

// Loads any preexisting notes from local storage on page load
userNotes.forEach(note => displayNote(note));


