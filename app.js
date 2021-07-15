

const newNoteButton = document.querySelector('#new-note');
const gridControl = document.getElementById('grid');
const themeControl = document.getElementById('theme-control');
const closeModalButton = document.querySelector('#modal-footer li');
const selectButton = document.getElementById('select');
const fileActions = document.getElementById('file-options');
const filePicker = document.getElementById('file-picker');
const importNotesButton = filePicker.querySelector('#read-button');
const modal = document.getElementById('modal');
const trash = document.getElementById('trash');
const sortBy = document.getElementById('sort');
const textCounter = document.getElementById('text-count');
let textArea = document.querySelector('textarea');
let index;
let thisNoteKey;
let root = document.documentElement;
let method;
let order;
let notesToTrash = [];


// Stores basic user preferences
let userPreferences = {
    sortMethod: 'dateEdited',
    sortOrder: 'down',
    countIndex: 0
}


const colorThemes = [

        { 
            themeName: 'Light',
            properties: {
                '--main-text-color': 'rgb(0, 0, 0)',
                '--main-background-color': 'rgb(255, 255, 255)',
                '--main-notes-color': 'rgb(255, 232, 132)',
                '--main-box-shadow-color': 'rgb(211, 211, 211)',
                '--main-note-highlight-color': 'rgb(255, 226, 95)'
            },
        },
        { 
            themeName: 'Dark',
            properties: {
                '--main-text-color': 'rgb(255, 255, 255)',
                '--main-background-color': 'rgb(0, 0, 0)',
                '--main-notes-color': 'rgb(75, 75, 75)',
                '--main-box-shadow-color': 'rgb(75, 75, 75)',
                '--main-note-highlight-color': 'rgb(100, 100, 100)'
            }
        }
];


///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// ON PAGE LOAD
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////


// Sets initial state of the file picker
filePicker.style.display = 'none';

// Sets initial state of modal display
modal.style.display = 'none';
modal.classList.add('modal-closed');

// Pull existing notes from local storage. 
// If no preexisting notes, sets userNotes to empty array
let userNotes = JSON.parse(localStorage.getItem('notes')) || [];

// Set initial color theme to Light
buildThemeDropdownMenu();

// Load any preexisting notes from local storage on page load
userNotes.forEach(note => displayNotePreview(note));

// Sort notes by edited date on page load
sortNotes();
showActiveSortDate(userPreferences.sortMethod);


///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// IMPORT / EXPORT LOCAL NOTES
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

function importOrExport(e) {
    if (e.target.selectedIndex === 1) {
        importFile();
    } else if (e.target.selectedIndex === 2) { 
        filePicker.style.display = 'none';
        exportFile(userNotes);
    } else {
        filePicker.style.display = 'none';
        return;
    }
}

function importFile() {
    filePicker.style.display = 'block';

    document.querySelector('#file-input').addEventListener('change', function() { 
        importNotesButton.classList.add('article-unroll');
        document.querySelector('#file-input').classList.add('transparent');
    });
    
    importNotesButton.addEventListener('click', function() {

        if (document.querySelector("#file-input").files.length == 0) {
            alert('Error : No file selected');
            return;
        }
    
        // file selected by user
        let file = document.querySelector("#file-input").files[0];

        // new FileReader object
        let reader = new FileReader();

        // event fired when file reading finished
        reader.addEventListener('load', function(e) {
            // contents of the file
            let text = e.target.result;
            text = JSON.parse(text);
            userNotes = text;
            localStorage.setItem('notes', JSON.stringify(userNotes));
            filePicker.style.display = 'none';
            fileActions[0].setAttribute('selected', true);
            sortNotes();
        });

        // event fired when file reading failed
        reader.addEventListener('error', function() {
            alert('Error : Failed to read file');
        });

        // read file as text file
        reader.readAsText(file);

    });
}

function exportFile(jsonData) {

    let dataStr = JSON.stringify(jsonData);
    let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    let exportFileDefaultName = 'notes.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    fileActions[0].setAttribute('selected', true);

}


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
    thisNote.wordCount = textArea.value.match(/\w+/g).length;
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
    <div class="hidden">${note.noteKey}</div>
    <p class="content-preview">${note.noteContent.text}</p>
    <div class="dates">
        <p class="created semi-transparent">Created: ${displayCreated.toLocaleDateString(undefined, options)}</p>
        <p class="edited semi-transparent">Edited: ${displayEdited.toLocaleDateString(undefined, options)}</p>
    </div>
    `;

    article.classList.add('color-notes');
    article.classList.add('flex-column');
    article.addEventListener('click', articleActions);
    section.append(article);

    // Adds CSS class to enable animation effect
    window.setTimeout( () => { article.classList.add('article-unroll') }, 50 );
    // article.classList.add('article-unroll');

}

function selectAndDeleteNotes() {
    let articleList = document.querySelectorAll('article');
    // let notesToTrash = [];

    // Shrinks notes from the center of each note
    articleList.forEach(article => article.classList.remove('article-unroll'));
    articleList.forEach(article => article.classList.add('article-unselected'));
    articleList.forEach(article => article.style.transformOrigin = 'center');

    // Disables select menus
    // let select = document.querySelectorAll('select');
    // select.forEach(menu => menu.setAttribute('disabled', true));

    // Remove existing event listeners on articles
    articleList.forEach(article => article.removeEventListener('click', articleActions));
    // Add listener to handle selecting notes
    articleList.forEach(article => article.addEventListener('click', makeSelected));
    // Listener to delete selected notes
    selectButton.removeEventListener('click', selectAndDeleteNotes);
    selectButton.addEventListener('click', deleteSelected);

    window.setTimeout( () => { window.addEventListener('click', escapeSelectAndDelete) }, 500 )
    // window.addEventListener('click', escapeSelectAndDelete);


}

function makeSelected(e) {
    // Increases size and deepens color of a selected note
    this.classList.remove('article-unselected');
    this.classList.add('article-active');
    let article = this;
    let thisNoteKey = article.querySelector('div').textContent;
    thisNoteKey = parseInt(thisNoteKey);

    // Checks if noteKey has already been selected and deselects and removes it from 
    // the notesToTrash array. Otherwise adds noteKey to notesToTrash array
    if (notesToTrash.includes(thisNoteKey)) {
        index = notesToTrash.findIndex(note => note === thisNoteKey);
        notesToTrash.splice(index, 1);
        this.classList.remove('article-active');
    } else {
        notesToTrash.push(thisNoteKey);
    }
    selectButton.textContent = 'Delete';
}


function deleteSelected() {
    notesToTrash.forEach(noteKey => indexAndRemove(noteKey));
    selectButton.textContent = 'Select and Delete';
    refresh();
}

function indexAndRemove(noteKey) {
    getNote(noteKey);
    userNotes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(userNotes));
    selectButton.textContent = 'Select and Delete';
    selectButton.removeEventListener('click', deleteSelected);
    selectButton.addEventListener('click', selectAndDeleteNotes);
    notesToTrash = [];
}

function escapeSelectAndDelete(e) {

    let articleList = document.querySelectorAll('article');
    articleList = Array.from(articleList);
    containsArticlePath = articleList.some(article => e.path.includes(article));
    containsSelectButton = e.path.includes(selectButton);
    hasArticle();

    function hasArticle() {
        if (containsArticlePath == true) { 
            selectAndDeleteNotes();
        } else if (containsSelectButton == true) {
            deleteSelected;
        } else {
            selectButton.textContent = 'Select and Delete';
            selectButton.removeEventListener('click', deleteSelected);
            window.removeEventListener('click', escapeSelectAndDelete);
            selectButton.addEventListener('click', selectAndDeleteNotes);
            articleList.forEach(article => article.classList.remove('article-unselected'));
            articleList.forEach(article => article.classList.remove('article-active'));
            articleList.forEach(article => article.classList.add('article-unroll'));
            return;
        }
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
        userNotes.sort( (a, b) => new Date(b.noteContent[method]) - new Date(a.noteContent[method]) );
    } else if (order === 'up') {
        userNotes.sort( (a, b) => new Date(a.noteContent[method]) - new Date(b.noteContent[method]) );
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
        sortNotes();
    } else {
        modal.style.display = 'grid';
        window.setTimeout( () => { modal.classList.add('modal-open') }, 25);
        textArea.value = userNotes[index].noteContent.text; // Sets text area to content of note
        let countedItems = document.querySelector('#modal-footer label');
        countedItems.innerHTML = userNotes[index].noteContent.wordCount;
    }
}

function setTheme(e) {

    const index = e.target.selectedIndex;
    // colorThemes[index].properties.forEach(property => root.style.setProperty(property.propertyName, property.propertyValue));
    const selectedTheme = colorThemes[index].properties;
    for ( const prop in selectedTheme) { root.style.setProperty( `${prop}`, `${selectedTheme[prop]}` ) }

}

function changeGrid(e) {
    const index = e.target.selectedIndex;
    const section = document.getElementById('usernotes-viewer');
    if (index === 0) {
        section.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 2fr))';
        section.style.gridAutoRows = '150px';
    } else {
        section.style.gridTemplateColumns = '1fr';
        section.style.gridAutoRows = '80px';
    }
    refresh();
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

    // Sets a delay between drawing each new note
    userNotes.forEach( (note, i) => {
        setTimeout( () => {
            displayNotePreview(note);
            showActiveSortDate(userPreferences.sortMethod);        
        }, i * 50 );
    });

}

function showActiveSortDate(method) {
    const created = document.querySelectorAll('.created');
    const edited = document.querySelectorAll('.edited');

    if (method === 'dateEdited') {
        created.forEach(item => item.classList.add('hidden'));
        edited.forEach(item => item.classList.remove('hidden'));
    } else if (method === 'dateCreated') {
        edited.forEach(item => item.classList.add('hidden'));
        created.forEach(item => item.classList.remove('hidden'));
    }
}


function countItems() {
    let wordCount = document.querySelector('#modal-footer label');
    if (userPreferences.countIndex === 0) {
        wordCount.innerHTML = textArea.value.match(/\w+/g).length;
    } else if (userPreferences.countIndex === 1) {
        wordCount.innerHTML = textArea.value.length;
    };
}

function buildThemeDropdownMenu() {
    themeControl.innerHTML += `<select name="theme-options" id="theme-list" class="color-background color-text"></select>`;
    colorThemes.forEach(theme => themeControl.querySelector('select').innerHTML += `<option>${theme.themeName}</option>`);
}


///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// EVENT LISTENERS
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// Read in local JSON file
fileActions.addEventListener('change', importOrExport);

// Open modal window
newNoteButton.addEventListener('click', createNewNote);
newNoteButton.addEventListener('click', toggleModalDisplay);

// Close modal window
closeModalButton.addEventListener('click', toggleModalDisplay);

// Set method of counting, words or characters
textCounter.addEventListener('change', (e) => userPreferences.countIndex = e.target.selectedIndex);
textCounter.addEventListener('change', countItems);

// Count and display number of words or characters
textArea.addEventListener('input', countItems);

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