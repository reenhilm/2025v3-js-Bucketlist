// Globals
let _activities = [];
var modal = document.getElementById("myModal");
let previousYESEventHandler;

function setupModalHide()
{
    modal.hide = () => {       
        modal.style.display = "none";
    }
    const cancelElements = [document.querySelector(".close"), document.querySelector("#modal-no"), document.querySelector("#modal-cancel")];

    cancelElements.forEach(el => {    
        if (el) {
            el.addEventListener('click', () => { modal.hide(); });
        }
    });

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.hide();
        }
    }
}

function addFormSubmitEvent()
{
    document.getElementById('bucketForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const form = event.target;
        if (form.reportValidity())   
            form.reset();
    });
}

function addBucketFormButtonClickHandler() {    
    const el = document.getElementById('bucketForm').querySelector('button[type="submit"]');
    el.addEventListener('click', (e) => {
        if (e.target.form.checkValidity())
            addFromFormAndRefresh();
    });
}

function addBtnClearClickHandler() {
    const el = document.querySelector('#btn_clear');
    el.addEventListener('click', (e) => {
        const modalOK = () => { clearLocalStorage(); redrawItems() };
        modalConfirm('Really clear ALL activities? (note: refreshing page directly after a reset re-adds test-data again)', modalOK);
    });
}

function modalConfirm(title, YESFunction) {
    const modalTitleEl = document.getElementById('modal-title');
    modalTitleEl.innerHTML = title;

    const btnEl = document.getElementById('modal-button');

    //If we have opened the modal and assigned a click event before to the YES-button. We must first remove it. Else there will be multiple click events if we add another.
    if(previousYESEventHandler)
        btnEl.removeEventListener('click', previousYESEventHandler)

    const eventHandler = (e) => {
        YESFunction();
        modal.hide();
    };

    previousYESEventHandler = eventHandler;

    btnEl.addEventListener('click', eventHandler);   
    modal.style.display = "block";
}

function clearLocalStorage() {
    localStorage.clear();
    _activities = [];
}

// Used by submitbutton on click
function addFromFormAndRefresh() {
    const aName = document.getElementById('activityName').value.trim();
    const aCat = document.getElementById("activityCategory").value;

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

    distinctCategories.sort((a, b) => {
        return a.localeCompare(b, 'sv');
    });

    distinctCategories.forEach(e => {
        createHTML(el, e, _activities.filter(a => a.category === e));
    });
}

function createHTML(parent, category, filteredActivities) {
    const sortedActivities = [...filteredActivities];
    sortedActivities.sort((a, b) => {
        return a.name.localeCompare(b.name, 'sv');
    });

    parent.appendChild((() => {
        const h2 = document.createElement('h2');
        h2.innerHTML = category;
        return h2;
    })()); // Immediately invoke the function

    const ul = parent.appendChild(document.createElement('ul'));
    ul.classList.add('flow');

    sortedActivities.forEach(a => {
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
    pDel.setAttribute("title", "Delete");
    pDel.classList.add("material-symbols-outlined");
    pDel.value = 'delete';
    pDel.addEventListener('click', () => {
        const modalOK = () => { removeActivity(activity.id); redrawItems() };
        modalConfirm(`Really delete activity? ${activity.name}`, modalOK);
    });
    
    const pEl = document.createElement('p');
    pEl.innerHTML = activity.name;
    
    pLi.appendChild(pCb);        
    pLi.appendChild(pEl);
    pLi.appendChild(pDel);    
    
    return pLi;
}

function removeActivity(id) {
    _activities.splice(_activities.findIndex(e => e.id === id), 1);

    // Save changes in localstorage
    setALocalStorage(_activities);
}

function updateActivity(id, status) {
    // Update the array in place
    _activities.forEach((a, index) => {
        if (a.id === id) {
            _activities[index] = { ...a, status: status };
        }
    });

    // Keeping this code as a comment since it's another way of doing this I like. For learning purposes if I go back to rehearse:
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

    // Save changes in localstorage
    setALocalStorage(_activities);
}

function setALocalStorage(activities) {
    localStorage.setItem('ActivitySave', JSON.stringify(activities));
}

// Main thread program
init(true);
function init(_isDevelopment) {
    addBucketFormButtonClickHandler();
    addBtnClearClickHandler();
    setupModalHide();
    addFormSubmitEvent();

    const parseActivityJSONAsActivity = function (jsonActivity) {
        const newActivity = Object.create(activityPrototype);
        Object.assign(newActivity, jsonActivity);
        return newActivity;
    }

    if (localStorage.getItem('ActivitySave') == null) {
        //If this is first time visiting this page we are here

        if (_isDevelopment) {
            addTestItems(); //This one save to setALocalStorage anyway
        }
        else {
            //This is probably just a empty array but futureproofing logic incase it isn't anyone, we don't want null there anymore
            setALocalStorage(_activities);
        }
    }
    else {
        //We are a returning visitor and want to load (Load/Parse _activities from localStorage)
        const jsonFromStorage = localStorage.getItem('ActivitySave');
        const objFromJSON = JSON.parse(jsonFromStorage);
        _activities = objFromJSON.map(parseActivityJSONAsActivity);
    }
    redrawItems();
}