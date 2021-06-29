

const newNoteButton = document.querySelector('nav ul li');
const gridControl = document.getElementById('grid');
const themeControl = document.getElementById('theme-control');
const closeModalButton = document.querySelector('#modal-footer li');
const modal = document.getElementById('modal');
const trash = document.getElementById('trash');
const sortBy = document.getElementById('sort');
let textArea = document.querySelector('textarea');
let index;
let thisNoteKey;

let root = document.documentElement;

// Sets initial state of modal display
modal.style.display = 'none';

// Pull existing notes from local storage. 
// If no preexisting notes, sets userNotes to empty array
let userNotes = JSON.parse(localStorage.getItem('notes')) || [];

// Sort notes by edited date on page load
userNotes.sort((a, b) => a.noteContent.dateEdited - b.noteContent.dateEdited);

// Load any preexisting notes from local storage on page load
userNotes.forEach(note => displayNotePreview(note));

const colorThemes = [

    {
        themeName: 'Light',
        mainTextColor: 'rgb(0, 0, 0)',
        mainBackgroundColor: 'rgb(255, 255, 255)',
        mainNotesColor: 'rgb(211, 211, 211)',
    },
    {
        themeName: 'Dark',
        mainTextColor: 'rgb(255, 255, 255)',
        mainBackgroundColor: 'rgb(0, 0, 0)',
        mainNotesColor: 'rgb(75, 75, 75)',    
    }

];


function changeColorTheme() {
    if (this.textContent.includes(colorThemes[0].themeName)) {
        root.style.setProperty('--main-text-color', colorThemes[1].mainTextColor);
        root.style.setProperty('--main-background-color', colorThemes[1].mainBackgroundColor);
        root.style.setProperty('--main-notes-color', colorThemes[1].mainNotesColor);
        themeControl.textContent = `Theme: ${colorThemes[1].themeName}`;
    } else {
        root.style.setProperty('--main-text-color', colorThemes[0].mainTextColor);
        root.style.setProperty('--main-background-color', colorThemes[0].mainBackgroundColor);
        root.style.setProperty('--main-notes-color', colorThemes[0].mainNotesColor);
        themeControl.textContent = `Theme: ${colorThemes[0].themeName}`;
    }
}

function toggleModalDisplay() {
    
    if (modal.style.display == 'grid') {
        modal.style.display = 'none';
        refresh();
    } else {
        modal.style.display = 'grid';
        textArea.textContent = userNotes[index].noteContent.text;
    }
}

function countWords(text) {
    return text.match(/\w+/g).length;
}

function addNote() {

    const note = {
        noteKey: Date.now(),
        noteContent: {
            text: null,
            dateCreated: Date.now(),
            dateEdited: null,
            wordCount: 0
        }
    };

    userNotes.push(note);
    localStorage.setItem('notes', JSON.stringify(userNotes));
    thisNoteKey = note.noteKey;
    getNote(thisNoteKey);
}

function saveNote(note) {
    const thisNote = userNotes[index].noteContent;
    thisNote.text = textArea.value;
    thisNote.dateEdited = Date.now();
    thisNote.wordCount = countWords(textArea.value);
    userNotes.push();
    localStorage.setItem('notes', JSON.stringify(userNotes));
}

function displayNotePreview(note) {

    const section = document.getElementById('usernotes-viewer');
    const article = document.createElement('article');    

    article.innerHTML = `
    <p>${note.noteKey}</p>
    <p>${note.noteContent.text}</p>
    <p>${note.noteContent.dateCreated}</p>
    `;
    section.prepend(article);

    article.addEventListener('click', () => {
        let thisNoteKey = article.querySelector('p').textContent;
        thisNoteKey = parseInt(thisNoteKey);
        getNote(thisNoteKey); // returns index value of this note
        toggleModalDisplay(userNotes[index].noteContent.text);
    }
    );

}

function getNote(key) {
    index = userNotes.findIndex(note => note.noteKey === key);
    return index;
}

function deleteNote() {
    userNotes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(userNotes));
    toggleModalDisplay();
}

function changeGrid() {
    const section = document.getElementById('usernotes-viewer');
    if (section.style.gridTemplateColumns == 'repeat(auto-fill, minmax(150px, 2fr))') {
        section.style.gridTemplateColumns = '1fr';
    } else {
        section.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 2fr))';
    }
}

function sortNotes() {

    const section = document.getElementById('usernotes-viewer');
    const article = document.querySelectorAll('article'); 

    article.forEach(article => {
        let thisNoteKey = article.querySelector('p').textContent;
        thisNoteKey = parseInt(thisNoteKey);
        getNote(thisNoteKey);
        const thisNote = userNotes[index].noteContent;
    });

    if (sortBy.textContent.includes('Created')) {
        sortBy.textContent = "Sort: Date Edited";
        // Sort by recently edited
        userNotes.sort((a, b) => a.noteContent.dateEdited - b.noteContent.dateEdited);
    } else {
        sortBy.textContent = "Sort: Date Created";
        // Sort by creation date
        userNotes.sort((a, b) => a.noteContent.dateCreated - b.noteContent.dateCreated);
    }

    localStorage.setItem('notes', JSON.stringify(userNotes));
    refresh();  

}

// Refresh user-notes viewer content
function refresh() {
    const section = document.getElementById('usernotes-viewer');
    section.innerHTML = '';
    userNotes.forEach(note => displayNotePreview(note));
}


// Open modal window
newNoteButton.addEventListener('click', toggleModalDisplay);
newNoteButton.addEventListener('click', addNote);

// Close modal window
closeModalButton.addEventListener('click', toggleModalDisplay);

// Count and display number of words as user types
textArea.addEventListener('input', () => {
    let wordCount = document.getElementById('wordcount');
    wordCount.innerHTML = 'Words:' + ' ' + countWords(textArea.value);
});

// Save the note with every character stroke
textArea.addEventListener('input', saveNote);

// Change color theme
themeControl.addEventListener('click', changeColorTheme);

// Change grid display
gridControl.addEventListener('click', changeGrid);

// Delete an existing note
trash.addEventListener('click', deleteNote);

// Sort the notes by creation date and edit date
sortBy.addEventListener('click', sortNotes);