
let body = document.getElementById("body")!;
let tableBody = document.getElementById("tableBody")!;
let gDate = document.getElementById("gDate")!;
let hDate = document.getElementById("hDate")!;
let adhanElements = {
    'fajr' : document.getElementById('fajrAdhan')!,
    'sunrise' : document.getElementById('sunrise')!,
    'dhuhr' : document.getElementById('dhuhrAdhan')!,
    'asr' : document.getElementById('asrAdhan')!,
    'maghrib' : document.getElementById('maghribAdhan')!,
    'isha' : document.getElementById('ishaAdhan')!,
    'jummah' : document.getElementById('jummahTimes')!
};
let iqamahElements = {
    fajr : document.getElementById('fajrIqamah')!,
    dhuhr : document.getElementById('dhuhrIqamah')!,
    asr : document.getElementById('asrIqamah')!,
    maghrib : document.getElementById('maghribIqamah')!,
    isha : document.getElementById('ishaIqamah')!,
}

let now = new Date();
let adhanTimes = {
    fajr : now,
    sunrise : now,
    dhuhr : now,
    asr : now,
    maghrib : now,
    isha : now,
    jummah : now
}
let iqamahTimes = {
    fajr : todayTime("6:20 AM"),
    dhuhr : todayTime("1:30 PM"),
    asr : todayTime("4:00 PM"),
    maghrib : now,
    isha : todayTime("7:45 PM")
}
let switchHighlightTo = {
    fajr : now,
    sunrise : now,
    dhuhr : now,
    asr : now,
    maghrib : now,
    isha : now
}

let tableRows = {
    'fajr' : document.getElementById('fajrRow')!,
    'sunrise' : document.getElementById('sunriseRow')!,
    'dhuhr' : document.getElementById('dhuhrRow')!,
    'asr' : document.getElementById('asrRow')!,
    'maghrib' : document.getElementById('maghribRow')!,
    'isha' : document.getElementById('ishaRow')!
}

let adhanUpdateTimeout = -1;

// let fajrDate : Date,
//     sunriseDate : Date,
//     dhuhrDate : Date,
//     asrDate : Date,
//     maghribDate : Date,
//     ishaDate : Date;

/**
 * Returns a Date object for today's date at the specified time.
 * @param time Time string in 24 hour format or 12 hour format
 */
function todayTime(time: string){
    return new Date(new Date().toLocaleDateString() + " " + time);
}

/**
 * Returns the input date object rounded down to the nearest minute.
 * @param date A Date object
 */
function truncateSeconds(date: Date){
    return todayTime(date.getHours() + ':' + date.getMinutes());
}

function setDate(){
    let now = new Date();
    let updateInterval = 
        new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 0).valueOf() - now.valueOf();

    clearTimeout(adhanUpdateTimeout);
    adhanUpdateTimeout = setTimeout(reloadPage, updateInterval + 300000);

    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    gDate.innerText = now.toLocaleDateString(undefined, options);

    // Modify this so it fetches from the iqamah server to save time
    fetch('https://api.aladhan.com/v1/timings?latitude=40.68&longitude=-74.11')
        .then(response => (response.ok) ? response.json() : Promise.reject())
        .then(json => setHijriDate(json.data))
        .then(() => fetch('https://cors-anywhere.herokuapp.com/https://www.islamicfinder.org/prayer-widget/5095445/shafi/5/0/15.0/15.0'))
        .then(response => (response.ok) ? response.text() : Promise.reject())
        .then(islamicFinderAdhan)
        .catch(() => {
            errorMode("Failed getting Adhan times or AH date");
            setTimeout(setDate, 5000);
        });
}

function reloadPage(){
    // TODO change this when deploying new app probably
    fetch('https://bmclock2020.xyz')
        .then(res => (res.ok) ? location.reload() : Promise.reject())
        .catch(() => {
            errorMode("Failed trying to reload page.");
            setTimeout(reloadPage, 5000);
        });
}

/**
 * Converts a 24-hour format string to 12-hour format with AM/PM
 * @param time 24-hour format string
 */
function formatTime(time: string){
    // TODO This will fail for times that have hour value of 0 - 9
    let hour = Number.parseInt(time.substring(0, 2));
    if(hour < 12){
        
        if(hour == 0){
            return "12" + time.substring(2) + " AM";
        }else{
            return hour + time.substring(2) + " AM";
        }
    }else{
        if(hour == 12){
            return "12" + time.substring(2) + " PM";
        }else{
            return (hour % 12) + time.substring(2) + " PM";
        }
    }
}

interface AdhanData{
    timings: {
        Fajr: string,
        Sunrise: string,
        Dhuhr: string,
        Asr: string,
        Maghrib: string,
        Isha: string,
    },
    date: {
        hijri: {
            day: number,
            month: {
            en: string,
            ar: string
            },
            year: number,
        }
    }
}

function setHijriDate(data: AdhanData){
    let hijri = data.date.hijri;
    hDate.innerText = hijri.month.en + " " + hijri.day + ", " + hijri.year + " AH";
}

function hightlight(tr : HTMLElement){
    tr.className = 'highlight';
}

function unhighlight(){
    for(let tr of Object.values(tableRows)){
        tr.className = '';
    }
}

function checkIfHighlightSwitch(now: Date){
    unhighlight();
    //
    if(now < switchHighlightTo['sunrise']){
        body.className = 'fajr';
        hightlight(tableRows['fajr']);
    }else if(now < switchHighlightTo['dhuhr']){
        body.className = 'sunrise';
        hightlight(tableRows['sunrise']);
    }else if(now < switchHighlightTo['asr']){
        body.className = 'dhuhr';
        hightlight(tableRows['dhuhr']);
    }else if(now < switchHighlightTo['maghrib']){
        body.className = 'asr';
        hightlight(tableRows['asr']);
    }else if(now < switchHighlightTo['isha']){
        body.className = 'maghrib';
        hightlight(tableRows['maghrib']);
    }else if(now < switchHighlightTo['fajr']){
        body.className = 'isha';
        hightlight(tableRows['isha']);
    }else{
        body.className = 'fajr';
        hightlight(tableRows['fajr']);
    }
}

function checkIfAdhan(now: Date){
    for(let adhan of Object.entries(adhanTimes)){
        // TODO This might need to be modified when implementing jummah but possibly not
        if(adhan[1].valueOf() == now.valueOf()){
            // TODO need to ensure that adhanTimes and adhanElements keep the same key values
            playAdhan(adhan[0] as keyof typeof tableRows);
        }
    }
}

function checkIfIqamah(now: Date){
    const oneMin = 60000;
    for(let time of Object.values(iqamahTimes)){
        if((now.valueOf() + oneMin) == time.valueOf()){
            setTimeout(playIqamah, 50*1000);
        }
    }
}

function minuteChecks(){
    let now = truncateSeconds(new Date());
    checkIfHighlightSwitch(now);
    checkIfAdhan(now);
    checkIfIqamah(now);
}

function playAdhan(adhanName: keyof typeof tableRows){
    let audio = new Audio('assets/audio/takbeer.mp3');
    audio.play();
    flashPrayer(adhanName, 20, 700);
}

function playIqamah(){
    let audio = new Audio('assets/audio/lasalah.mp3');
    audio.play();
}

function flashPrayer(adhanName: keyof typeof tableRows, times: number, delay: number){
    setTimeout(unhighlight, delay);
    setTimeout(hightlight.bind(null, tableRows[adhanName]), delay*1.9);
    if(times > 1){
        setTimeout(flashPrayer.bind(null, adhanName, times-1, delay), delay*2);
    }
}

function islamicFinderAdhan(res : string){
    try {
        errorFixed();
        let fajr = res.match(`<p>\\s*?Fajr\\s*?<p>\\s*?<p>\\s*?\\d*?:\\d*?\\s*?\\w*?\\s*?<`)![0].match('\\d*:\\d*\\s*\\w*')![0];
        let sunrise = res.match(`<p>\\s*?Sunrise\\s*?<p>\\s*?<p>\\s*?\\d*?:\\d*?\\s*?\\w*?\\s*?<`)![0].match('\\d*:\\d*\\s*\\w*')![0];
        let dhuhr = res.match(`<p>\\s*?Dhuhr\\s*?<p>\\s*?<p>\\s*?\\d*?:\\d*?\\s*?\\w*?\\s*?<`)![0].match('\\d*:\\d*\\s*\\w*')![0];
        let asr = res.match(`<p>\\s*?Asr\\s*?<p>\\s*?<p>\\s*?\\d*?:\\d*?\\s*?\\w*?\\s*?<`)![0].match('\\d*:\\d*\\s*\\w*')![0];
        let maghrib = res.match(`<p>\\s*?Maghrib\\s*?<p>\\s*?<p>\\s*?\\d*?:\\d*?\\s*?\\w*?\\s*?<`)![0].match('\\d*:\\d*\\s*\\w*')![0];
        let isha = res.match(`<p>\\s*?Isha\\s*?<p>\\s*?<p>\\s*?\\d*?:\\d*?\\s*?\\w*?\\s*?<`)![0].match('\\d*:\\d*\\s*\\w*')![0];

        let removeStart0 = (time : string) => (time[0] == '0') ? time.substring(1) : time; 

        adhanElements['fajr'].innerText = removeStart0(fajr);
        adhanElements['sunrise'].innerText = removeStart0(sunrise);
        adhanElements['dhuhr'].innerText = removeStart0(dhuhr);
        adhanElements['asr'].innerText = removeStart0(asr);
        adhanElements['maghrib'].innerText = removeStart0(maghrib);
        adhanElements['isha'].innerText = removeStart0(isha);

        let today = new Date().toLocaleDateString();
        adhanTimes['fajr'] = new Date(today + " " + fajr);
        adhanTimes['sunrise'] = new Date(today + " " + sunrise);
        adhanTimes['dhuhr'] = new Date(today + " " + dhuhr);
        adhanTimes['asr'] = new Date(today + " " + asr);
        adhanTimes['maghrib'] = new Date(today + " " + maghrib);
        adhanTimes['isha'] = new Date(today + " " + isha);

        iqamahTimes['maghrib'] = new Date(adhanTimes['maghrib'].getTime() + 5*60000);
        let mIqamah = iqamahTimes['maghrib'];
        // TODO fix this so the function is more robust and these extra sanitation steps dont have to happen here
        let mHour = (mIqamah.getHours() < 10) ?  "0" + mIqamah.getHours() : "" + mIqamah.getHours();
        let mMin = (mIqamah.getMinutes() < 10) ? "0" + mIqamah.getMinutes() : "" + mIqamah.getMinutes();
        iqamahElements['maghrib'].innerText = formatTime(mHour + ':' + mMin);
        
        // TODO fix this so if you end up adding to a time after midnight it still works
        switchHighlightTo['fajr'] = new Date(iqamahTimes['isha'].valueOf() + 20*60000);
        switchHighlightTo['sunrise'] = new Date(iqamahTimes['fajr'].valueOf() + 20*60000);
        // Deal with special case of jummah
        switchHighlightTo['dhuhr'] = new Date(adhanTimes['sunrise'].valueOf() + 20*60000);
        switchHighlightTo['asr'] = new Date(iqamahTimes['dhuhr'].valueOf() + 20*60000);

        switchHighlightTo['maghrib'] = new Date(iqamahTimes['asr'].valueOf() + 20*60000);
        switchHighlightTo['isha'] = new Date(iqamahTimes['maghrib'].valueOf() + 20*60000);

        checkIfHighlightSwitch(new Date());
        
    } catch (error) {
        errorMode('Failed setting Adhan times');
    }
}

function errorMode(errorMessage: string){
    console.error(errorMessage);
    let jummahLabel = document.getElementsByClassName('topBorder');
    for(let element of jummahLabel){
        element.classList.remove('topBorder');
        element.classList.add('errorTopBorder');
    }
}

function errorFixed(){
    let jummahLabel = document.getElementsByClassName('errorTopBorder');
    for(let element of jummahLabel){
        element.classList.remove('errorTopBorder');
        element.classList.add('topBorder');
    }
}

setDate();
clockApp();
window.addEventListener('minutePassed', minuteChecks);
