let i = 0;
//Representera varje aktivitet som ett objekt egenskaper som namn och status.

let _activities = [];
const _isDevelopment = true;

// Get the modal
var modal = document.getElementById("myModal");

const cancelElements = [document.querySelector(".close"), document.querySelector("#modal-no"), document.querySelector("#modal-cancel")];
// When the user clicks on element, close the modal
const hideModal = () => {
    modal.style.display = "none";
}
cancelElements.forEach(el => {
    
    if (el) {
        el.addEventListener('click', () => { hideModal(); });
    }
});

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        hideModal();
    }
}

document.getElementById('bucketForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const form = event.target;
    if (form.reportValidity())   
        form.reset();
});

function addBucketFormButtonClickHandler() {    
    const el = document.getElementById('bucketForm').querySelector('button[type="submit"]');
    el.addEventListener('click', (e) => { addFromFormAndRefresh(); });
}

function addBtnClearClickHandler() {
    const el = document.querySelector('#btn_clear');
    el.addEventListener('click', (e) => {
        const modalOK = () => { clearLocalStorage(); redrawItems() };
        modalConfirm('Really clear ALL activities? (note: refreshing page directly after a reset re-adds test-data again)', modalOK);
    });
}

let previousEventHandler;

function modalConfirm(title, okFunction) {
    const modalTitleEl = document.getElementById('modal-title');
    modalTitleEl.innerHTML = title;

    const btnEl = document.getElementById('modal-button');
    if(previousEventHandler)
        btnEl.removeEventListener('click', previousEventHandler)

    const eventHandler = (e) => {
        okFunction();
        hideModal();
    };

    previousEventHandler = eventHandler;

    btnEl.addEventListener('click', eventHandler);   
    modal.style.display = "block";
}


function clearLocalStorage() {
    localStorage.clear();
    _activities = [];
}


//Used by submitbutton on click
function addFromFormAndRefresh() {
    const aName = document.getElementById('activityName').value.trim();
    const aCat = document.getElementById("activityCategory").value;
    //const aCat = selectEl.options[selectEl.selectedIndex].value;

    addActivity(createActivity(aName, aCat, false));

    redrawItems();
}

const activityPrototype = {
    id: '',
    name: '',
    category: 'Ingen kategori',
    status: false
};

function addTestItems() {
    addActivity(createActivity('Japan', 'Resor', false));
    addActivity(createActivity('USA', 'Resor', false));
    addActivity(createActivity('England', 'Resor', false));
    addActivity(createActivity('Lexicon frontend React', 'Lärande', false));
    addActivity(createActivity('Lexicon .NET påbyggnad', 'Lärande', true));
}

function getActivities() {
    return _activities;
}

function createActivity(name, category, status) {
    const activity = Object.create(activityPrototype);
    const id = self.crypto.randomUUID();
    activity.id = id;
    activity.name = name;
    activity.category = category;
    activity.status = status;
    return activity;
}

function redrawItems() {   
    const el = document.getElementById('bucketLists');
    el.innerHTML = '';

    const distinctCategories = [...new Set(_activities.map(e => e.category))];

    distinctCategories.forEach(e => {
        createHTML(el, e, _activities.filter(a => a.category === e));
    });
}

function createHTML(parent, category, filteredActivities) {
    parent.appendChild((() => {
        const h2 = document.createElement('h2');
        h2.innerHTML = category;
        return h2;
    })()); //Immediately invoke the function

    const ul = parent.appendChild(document.createElement('ul'));

    filteredActivities.forEach(a => {
        ul.appendChild(createHTMLActivity(a));
    });
}

function createHTMLActivity(activity) {
    const pLi = document.createElement('li');
    
    const pCb = document.createElement('input');
    pCb.setAttribute("type", "checkbox");
    pCb.checked = activity.status;
    pCb.addEventListener('change', (e) => { updateActivity(activity.id, e.target.checked); }); //no redraw needed

    const pDel = document.createElement('input');
    pDel.setAttribute("type", "button");
    pDel.value = '🗙';
    pDel.addEventListener('click', () => {
        const modalOK = () => { removeActivity(activity.id); redrawItems() };
        modalConfirm(`Really delete activity? ${activity.name}`, modalOK);
    });
    
    const pEl = document.createElement('p');
    pEl.innerHTML = activity.name;
    //pEl.innerHTML = `id: ${activity.id} ${activity.name}`;
    
    
    pLi.appendChild(pEl);
    pLi.appendChild(pCb);    
    pLi.appendChild(pDel);    
    
    return pLi;
}

function removeActivity(id) {
    _activities.splice(_activities.findIndex(e => e.id === id), 1);

    //Save changes in localstorage
    setALocalStorage(_activities);
}

function updateActivity(id, status) {
    //Update the array in place
    _activities.forEach((a, index) => {
        if (a.id === id) {
            _activities[index] = { ...a, status: status };
        }
    });

    //Can't do this since using const:
    // _activities = _activities.map(a =>
    //     a.id === id
    //         ? { ...a, status: status }
    //         : a
    // );

    //Save changes in localstorage
    setALocalStorage(_activities);
}

function addActivity(activity) {
    _activities.push(activity);

    //Save changes in localstorage
    setALocalStorage(_activities);
}

//Main thread program
addBucketFormButtonClickHandler();
addBtnClearClickHandler();

const parseActivityJSONAsActivity = function (jsonActivity)
{
    const newActivity = Object.create(activityPrototype);
    Object.assign(newActivity, jsonActivity);
    return newActivity;
}

if (localStorage.getItem('ActivitySave') == null) {
    //If this is first time visiting this page we are here

    if (_isDevelopment)
    {
        addTestItems(); //This one save to setALocalStorage anyway
    }
    else {
        //This is probably just a empty array but futureproofing logic incase it isn't anyone, we don't want null there anymore
        setALocalStorage(_activities);
    }
}
else
{
    //We are a returning visitor and want to load

    //Load/Parse _activities from localStorage
    const jsonFromStorage = localStorage.getItem('ActivitySave');
    const objFromJSON = JSON.parse(jsonFromStorage);
    _activities = objFromJSON.map(parseActivityJSONAsActivity);
}

function setALocalStorage(activities) {
    localStorage.setItem('ActivitySave', JSON.stringify(activities));
}

redrawItems();