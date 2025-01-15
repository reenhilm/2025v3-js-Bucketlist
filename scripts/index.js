let i = 0;
console.log('hejsan');
//Representera varje aktivitet som ett objekt egenskaper som namn och status.

//Add click event handler
const _activities = [];

addBucketFormButtonClickHandler();
addTestItems();
redrawItems();

function addBucketFormButtonClickHandler() {    
    const el = document.getElementById('bucketForm').querySelector('button[type="submit"]');
    el.addEventListener('click', (e) => { addFromFormAndRefresh(); e.preventDefault(); });
}

function addFromFormAndRefresh()
{
    const aName = document.getElementById('activityName').value;
   
    const selectEl = document.getElementById("activityCategory");
    const aCat = selectEl.options[selectEl.selectedIndex].value;

    addActivity(createActivity(aName, aCat, false));
    document.getElementById("bucketForm").reset();
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
    const ul = el.appendChild(document.createElement('ul'));

    _activities.forEach(a => {
        ul.appendChild(createHTMLActivity(a));
    });
}

function createHTMLActivity(activity) {
    pLi = document.createElement('li');
    
    pCb = document.createElement('input');
    pCb.setAttribute("type", "checkbox");
    pCb.checked = activity.status;

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
}

function addActivity(activity) {
    _activities.push(activity);
}

//guidGenerator code stolen with brutal force from: https://stackoverflow.com/questions/6860853/generate-random-string-for-div-id
function guidGenerator() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}