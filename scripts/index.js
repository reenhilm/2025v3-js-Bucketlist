let i = 0;
//Representera varje aktivitet som ett objekt egenskaper som namn och status.

let _activities = [];
const _isDevelopment = true;

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

//Used by submitbutton on click
function addFromFormAndRefresh() {
    const aName = document.getElementById('activityName').value.trim();
    const aCat = document.getElementById("activityCategory").value;
    //const aCat = selectEl.options[selectEl.selectedIndex].value;

    addActivity(createActivity(aName, aCat, false));

    redrawItems();
}

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
    return { id: guidGenerator(), name: name, category: category, status: status };
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
    pLi = document.createElement('li');
    
    pCb = document.createElement('input');
    pCb.setAttribute("type", "checkbox");
    pCb.checked = activity.status;
    pCb.addEventListener('change', (e) => { updateActivity(activity.id, e.target.checked); }); //no redraw needed

    pDel = document.createElement('input');
    pDel.setAttribute("type", "button");
    pDel.value = '🗙';
    pDel.addEventListener('click', () => { removeActivity(activity.id); redrawItems(); });
    
    pEl = document.createElement('p');
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

//GuidGenerator code stolen with brutal force from: https://stackoverflow.com/questions/6860853/generate-random-string-for-div-id
function guidGenerator() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

//Main thread program
addBucketFormButtonClickHandler();

console.log('localStorage är just nu:')
console.log(localStorage.getItem('ActivitySave'));

if (localStorage.getItem('ActivitySave') == null) {
    //If this is first time visiting this page we are here
    console.log('first time visiting');

    if (_isDevelopment)
    {
        console.log('adding test items');
        addTestItems(); //This one save to setALocalStorage anyway
    }
    else {
        //This is probably just a empty array but futureproofing logic incase it isn't anyone, we don't want null there anymore
        setALocalStorage(_activities);
    }
}
else
{
    console.log('welcome back');
    //We are a returning visitor and want to load
    //Load/Parse _activities from localStorage, special handling for booleans

    console.log('get JSON from localStorage');
    let jsonFromStorage = localStorage.getItem('ActivitySave');
    console.log(jsonFromStorage);

    console.log('parse JSON from localStorage');
    let objFromJSON = JSON.parse(jsonFromStorage);
    objFromJSON.forEach(e => console.log(typeof(e.status)));
    console.log(objFromJSON);

    //Maybe not necessary step
    console.log('convert status-strings to bools in obj');
    let objWithBools = objFromJSON.forEach(e => e.status = Boolean(e.status));
    console.log(objWithBools);

    console.log('save to let');
    _activities = objFromJSON;
    console.log(_activities);
}

function setALocalStorage(activities) {
    console.log('sparar i localStorage');
    localStorage.setItem('ActivitySave', JSON.stringify(activities));
}

redrawItems();