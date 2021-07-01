

const newNoteButton = document.querySelector('nav ul li');
const gridControl = document.getElementById('grid');
const themeControl = document.getElementById('theme-control');
const closeModalButton = document.querySelector('#modal-footer li');
const selectButton = document.getElementById('select');
const modal = document.getElementById('modal');
const trash = document.getElementById('trash');
const sortBy = document.getElementById('sort');
let textArea = document.querySelector('textarea');
let index;
let thisNoteKey;
let root = document.documentElement;

const colorThemes = [

    {
        themeName: 'Light',
        mainTextColor: 'rgb(0, 0, 0)',
        mainBackgroundColor: 'rgb(255, 255, 255)',
        mainNotesColor: 'rgb(255, 232, 132)',
        mainBoxShadowColor: 'rgb(211, 211, 211)'
    },
    {
        themeName: 'Dark',
        mainTextColor: 'rgb(255, 255, 255)',
        mainBackgroundColor: 'rgb(0, 0, 0)',
        mainNotesColor: 'rgb(75, 75, 75)',
        mainBoxShadowColor: 'rgb(75, 75, 75)'
    }

];


///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// ON PAGE LOAD
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////


// Sets initial state of modal display
modal.style.display = 'none';
modal.classList.add('modal-closed');

// Pull existing notes from local storage. 
// If no preexisting notes, sets userNotes to empty array
let userNotes = JSON.parse(localStorage.getItem('notes')) || [];

// Sort notes by edited date on page load
userNotes.sort((a, b) => a.noteContent.dateEdited - b.noteContent.dateEdited);
sortBy.textContent = 'Sort: Date Edited (Descending)';

// Set initial color theme to Light
themeControl.textContent = 'Theme: Light';

// Load any preexisting notes from local storage on page load
userNotes.forEach(note => displayNotePreview(note));

// Set grid display
gridControl.textContent = 'Display: Grid';


///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// FUNCTION LAND
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////


function changeColorTheme() {
    if (this.textContent.includes(colorThemes[0].themeName)) {
        root.style.setProperty('--main-text-color', colorThemes[1].mainTextColor);
        root.style.setProperty('--main-background-color', colorThemes[1].mainBackgroundColor);
        root.style.setProperty('--main-notes-color', colorThemes[1].mainNotesColor);
        root.style.setProperty('--main-box-shadow-color', colorThemes[1].mainBoxShadowColor);
        themeControl.textContent = `Theme: ${colorThemes[1].themeName}`;
    } else {
        root.style.setProperty('--main-text-color', colorThemes[0].mainTextColor);
        root.style.setProperty('--main-background-color', colorThemes[0].mainBackgroundColor);
        root.style.setProperty('--main-notes-color', colorThemes[0].mainNotesColor);
        root.style.setProperty('--main-box-shadow-color', colorThemes[0].mainBoxShadowColor);
        themeControl.textContent = `Theme: ${colorThemes[0].themeName}`;
    }
}

function toggleModalDisplay() {

    if (modal.style.display == 'grid') {
        modal.classList.remove('modal-open');
        modal.style.display = 'none';
        sortNotes();
    } else {
        modal.style.display = 'grid';
        window.setTimeout( () => { modal.classList.add('modal-open') }, 25);
        textArea.value = userNotes[index].noteContent.text; // Sets text area to content of note
        let countedWords = document.getElementById('wordcount');
        countedWords.innerHTML = 'Words:' + ' ' + userNotes[index].noteContent.wordCount;
    }
}

function countWords(text) {
    return text.match(/\w+/g).length;
}

function createNewNote() {

    const note = {
        noteKey: Date.now(),
        noteContent: {
            text: null,
            dateCreated: new Date().toJSON(),
            dateEdited: null,
            wordCount: 0
        }
    };

    userNotes.push(note);
    localStorage.setItem('notes', JSON.stringify(userNotes));
    thisNoteKey = note.noteKey;
    getNote(thisNoteKey);
}

function saveNote() {
    const thisNote = userNotes[index].noteContent;
    thisNote.text = textArea.value;
    thisNote.dateEdited = new Date();
    thisNote.wordCount = countWords(textArea.value);
    userNotes.push();
    localStorage.setItem('notes', JSON.stringify(userNotes));
}

// Create article element containing note information
// Add event handler on article element
// Inserts article element into the usernotes-viewer section
function displayNotePreview(note) {
    
    const section = document.getElementById('usernotes-viewer');
    const article = document.createElement('article');

    const creationDate = note.noteContent.dateCreated;
    const displayCreated = new Date(creationDate);

    const editDate = note.noteContent.dateEdited;
    const displayEdited = new Date(editDate);

    const options = { year: 'numeric', month: 'long', day: 'numeric' };

    article.innerHTML = `
    <div class="note-key">${note.noteKey}</div>
    <p class="content-preview">${note.noteContent.text}</p>
    <div class="dates">
        <p class="created">Created: ${displayCreated.toLocaleDateString(undefined, options)}</p>
        <p class="edited">Edited: ${displayEdited.toLocaleDateString(undefined, options)}</p>
    </div>
    `;

    article.addEventListener('click', articleActions);
    section.prepend(article);

}

function articleActions(e) {
    let article = e.target;
    let thisNoteKey = article.querySelector('div').textContent;
    thisNoteKey = parseInt(thisNoteKey);
    getNote(thisNoteKey);
    toggleModalDisplay();
}

function selectAndDeleteNotes() {
    let article = document.querySelectorAll('article');
    let notesToTrash = [];

    // Remove existing event listeners on articles
    article.forEach(article => article.removeEventListener('click', articleActions));
    // Add listener to handle selecting notes
    article.forEach(article => article.addEventListener('click', makeSelected));
    // Listener to delete selected notes
    selectButton.removeEventListener('click', selectAndDeleteNotes);
    selectButton.addEventListener('click', deleteSelected);

    function makeSelected(e) {
        e.target.classList.add('article-active');

        let article = e.target;
        let thisNoteKey = article.querySelector('div').textContent;
        thisNoteKey = parseInt(thisNoteKey);
    
        // Adds noteKey to notesToTrash array
        notesToTrash.push(thisNoteKey);

        selectButton.textContent = 'Trash';
    }

    function deleteSelected() {
        notesToTrash.forEach(noteKey => indexAndRemove(noteKey));
        refresh();
    }

    function indexAndRemove(noteKey) {
        getNote(noteKey);
        userNotes.splice(index, 1);
        localStorage.setItem('notes', JSON.stringify(userNotes));
        selectButton.textContent = 'Select';
        selectButton.removeEventListener('click', deleteSelected);
        selectButton.addEventListener('click', selectAndDeleteNotes);
    }
}


function deleteNote() {
    userNotes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(userNotes));
    toggleModalDisplay();
}


// Sorts notes array and redraws the usernotes-viewer
function sortNotes() {

    let sortingLabel = sortBy.textContent;
    if (sortingLabel.includes('Date Edited (Descending)')) {
        userNotes.sort((a, b) => a.noteContent.dateEdited - b.noteContent.dateEdited).reverse();
        sortBy.textContent = 'Sort: Date Edited (Ascending)';
    } else if (sortingLabel.includes('Sort: Date Edited (Ascending)')) {
        userNotes.sort((a, b) => a.noteContent.dateCreated - b.noteContent.dateCreated);
        sortBy.textContent = 'Sort: Date Created (Descending)';
    } else if (sortingLabel.includes('Sort: Date Created (Descending)')) {
        userNotes.sort((a, b) => a.noteContent.dateCreated - b.noteContent.dateCreated).reverse();
        sortBy.textContent = 'Sort: Date Created (Ascending)';
    } else if (sortingLabel.includes('Sort: Date Created (Ascending)')) {
        userNotes.sort((a, b) => a.noteContent.dateEdited - b.noteContent.dateEdited);
        sortBy.textContent = 'Sort: Date Edited (Descending)';
    }

    // Save newly re-ordered array to Local Storage
    localStorage.setItem('notes', JSON.stringify(userNotes));
    refresh();  

}



function changeGrid() {
    const section = document.getElementById('usernotes-viewer');
    if (gridControl.textContent.includes('Grid')) {
        section.style.gridTemplateColumns = '1fr';
        gridControl.textContent = 'Display: List';
    } else {
        section.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 2fr))';
        gridControl.textContent = 'Display: Grid';
    }
}

// Utility to find index value of object containing 
// the supplied noteKey provided by displayNotePreview
function getNote(key) {
    index = userNotes.findIndex(note => note.noteKey === key);
    return index;
}

// Utility to clear the user-notes viewer. Calls displayNotePreview 
// to redraw and relink event listeners to notes
function refresh() {
    const section = document.getElementById('usernotes-viewer');
    section.innerHTML = '';
    userNotes.forEach(note => displayNotePreview(note));
}


///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// EVENT LISTENERS
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////


// Open modal window
newNoteButton.addEventListener('click', createNewNote);
newNoteButton.addEventListener('click', toggleModalDisplay);

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

// Select multiple notes
selectButton.addEventListener('click', selectAndDeleteNotes);