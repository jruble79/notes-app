

const newNoteButton = document.querySelector('header ul li');
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
let method;
let order;

// Set up basic user preferences
let userPreferences = {
    sortMethod: 'dateEdited',
    sortOrder: 'down'
}


const colorThemes = [

    // New colorThemes objects must follow the following structure to be read by setTheme(): 
    //
    //      Object with two key-value pairs: 
    //          A key of 'themeName' and value of the name of the theme
    //          A key of 'properties' and a value initiating a new Array
    //              Inside the new Array are objects describing theme properties and values
    //                  A key of 'propertyName' and value of a CSS variable name
    //                  A key of 'propertyValue' and a value of the CSS variable's desired color value
    //
    //      Current propertyName values are:
    //          --main-text-color
    //          --main-background-color
    //          --main-notes-color
    //          --main-box-shadow-color
    //          --main-note-highlight-color

        { 
            themeName: 'Light',
            properties: new Array (
                { 
                    propertyName: '--main-text-color',
                    propertyValue: 'rgb(0, 0, 0)' 
                },
                {
                    propertyName: '--main-background-color',
                    propertyValue: 'rgb(255, 255, 255)'
                },
                {
                    propertyName: '--main-notes-color',
                    propertyValue: 'rgb(255, 232, 132)'
                },
                {
                    propertyName: '--main-box-shadow-color',
                    propertyValue: 'rgb(211, 211, 211)'
                },
                {
                    propertyName: '--main-note-highlight-color',
                    propertyValue: 'rgb(255, 226, 95)'
                }
            )
        },
        { 
            themeName: 'Dark',
            properties: new Array (
                { 
                    propertyName: '--main-text-color',
                    propertyValue: 'rgb(255, 255, 255)'
                },
                {
                    propertyName: '--main-background-color',
                    propertyValue: 'rgb(0, 0, 0)'
                },
                {
                    propertyName: '--main-notes-color',
                    propertyValue: 'rgb(75, 75, 75)'
                },
                {
                    propertyName: '--main-box-shadow-color',
                    propertyValue: 'rgb(75, 75, 75)'
                },
                {
                    propertyName: '--main-note-highlight-color',
                    propertyValue: 'rgb(100, 100, 100)'
                }
            )
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
userNotes.sort((a, b) => new Date(a.noteContent.dateEdited) - new Date(b.noteContent.dateEdited));

// Set initial color theme to Light
buildThemeDropdownMenu();

// Load any preexisting notes from local storage on page load
userNotes.forEach(note => displayNotePreview(note));

// Set grid display
// gridControl.textContent = 'Display: Grid';


///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// NOTE BASIC ACTIONS
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////


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

function deleteNote() {
    userNotes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(userNotes));
    toggleModalDisplay();
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


///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// NOTE REORDERING
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////


// Sorts notes array and redraws the usernotes-viewer
function sortNotes(method = userPreferences.sortMethod, order = userPreferences.sortOrder) {

    if (order === 'down') {
        userNotes.sort( (a, b) => new Date(a.noteContent[method]) - new Date(b.noteContent[method]) );
    } else if (order === 'up') {
        userNotes.sort( (a, b) => new Date(b.noteContent[method]) - new Date(a.noteContent[method]) );
    };

    localStorage.setItem('notes', JSON.stringify(userNotes));
    refresh();  
    
}

function getSortMethod(e) {
    const selectedOption = sortBy.querySelector('#method');
    const index = e.target.selectedIndex
    method = selectedOption[index].dataset.method;
    userPreferences.sortMethod = method;
    sortNotes(method, order);
}

function getSortOrder(e) {
    const selectedOption = sortBy.querySelector('#order');
    const index = e.target.selectedIndex
    order = selectedOption[index].dataset.order;
    userPreferences.sortOrder = order;
    sortNotes(method, order);
}


///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// VISUAL CHANGES
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////


function toggleModalDisplay() {

    if (modal.style.display == 'grid') {
        modal.classList.remove('modal-open');
        modal.style.display = 'none';
        refresh();
    } else {
        modal.style.display = 'grid';
        window.setTimeout( () => { modal.classList.add('modal-open') }, 25);
        textArea.value = userNotes[index].noteContent.text; // Sets text area to content of note
        let countedWords = document.getElementById('wordcount');
        countedWords.innerHTML = 'Words:' + ' ' + userNotes[index].noteContent.wordCount;
    }
}

function setTheme(e) {

    // Requires any new colorThemes objects to follow a nested structure as follows: 
    //
    //      Object with two key-value pairs: 
    //          A key of 'themeName' and value of the name of the theme
    //          A key of 'properties' and a value initiating a new Array
    //              Inside the new Array are objects describing theme properties and values
    //                  A key of 'propertyName' and value of a CSS variable name
    //                  A key of 'propertyValue' and a value of the CSS variable's desired color value
    //
    //      Current propertyName values are:
    //          --main-text-color
    //          --main-background-color
    //          --main-notes-color
    //          --main-box-shadow-color
    //          --main-note-highlight-color

    const index = e.target.selectedIndex;
    colorThemes[index].properties.forEach(property => root.style.setProperty(property.propertyName, property.propertyValue));
}

function changeGrid(e) {
    const index = e.target.selectedIndex;
    const section = document.getElementById('usernotes-viewer');
    if (index === 0) {
        section.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 2fr))';
    } else {
        section.style.gridTemplateColumns = '1fr';
    }
}



///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// UTILITIES
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// Enable an article to be opened from the main display
// Requires getNote() to identify note object
function articleActions() {
    let article = this; // 'this' is linked to the article element
    let thisNoteKey = article.querySelector('div').textContent;
    thisNoteKey = parseInt(thisNoteKey);
    getNote(thisNoteKey);
    toggleModalDisplay();
}

// Find index value of object containing the 
// supplied noteKey provided by articleActions()
function getNote(key) {
    index = userNotes.findIndex(note => note.noteKey === key);
    return index;
}

// Clear the user-notes viewer. Calls displayNotePreview() 
// to redraw and relink event listeners to notes
function refresh() {
    const section = document.getElementById('usernotes-viewer');
    section.innerHTML = '';
    userNotes.forEach(note => displayNotePreview(note));
}

function countWords(text) {
    return text.match(/\w+/g).length;
}

function buildThemeDropdownMenu() {
    themeControl.innerHTML += `<select id="theme-list"></select>`;
    colorThemes.forEach(theme => themeControl.querySelector('select').innerHTML += `<option>${theme.themeName}</option>`);
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
themeControl.querySelector('#theme-list').addEventListener('change', setTheme);

// Change grid display
gridControl.addEventListener('change', changeGrid);

// Delete an existing note
trash.addEventListener('click', deleteNote);

// Sort the notes by creation date and edit date
sortBy.querySelector('#method').addEventListener('change', getSortMethod);
sortBy.querySelector('#order').addEventListener('change', getSortOrder);

// Select multiple notes
selectButton.addEventListener('click', selectAndDeleteNotes);