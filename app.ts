
let body = document.getElementById("body")!;
let tableBody = document.getElementById("tableBody")!;
let gDate = document.getElementById("gDate")!;
let hDate = document.getElementById("hDate")!;
let adhanElements = {
    fajr : document.getElementById('fajrAdhan')!,
    sunrise : document.getElementById('sunrise')!,
    dhuhr : document.getElementById('dhuhrAdhan')!,
    asr : document.getElementById('asrAdhan')!,
    maghrib : document.getElementById('maghribAdhan')!,
    maghribIqamah : document.getElementById('maghribIqamah')!,
    isha : document.getElementById('ishaAdhan')!
};
let tableRows = {
    'fajr' : document.getElementById('fajrRow')!,
    'sunrise' : document.getElementById('sunriseRow')!,
    'dhuhr' : document.getElementById('dhuhrRow')!,
    'asr' : document.getElementById('asrRow')!,
    'maghrib' : document.getElementById('maghribRow')!,
    'isha' : document.getElementById('ishaRow')!
}

let adhanUpdateTimeout = -1;

let fajrDate : Date,
    sunriseDate : Date,
    dhuhrDate : Date,
    asrDate : Date,
    maghribDate : Date,
    ishaDate : Date;

function setDate(){
    let now = new Date();
    let updateInterval = 
        new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 0).valueOf() - now.valueOf();

    clearTimeout(adhanUpdateTimeout);
    adhanUpdateTimeout = setTimeout(reloadPage, updateInterval + 300000);

    let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    gDate.innerText = now.toLocaleDateString(undefined, options);

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
    fetch('http://bayonnemuslimsclock.com.s3-website-us-east-1.amazonaws.com/')
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

function checkIfAdhan(){
    let now = new Date();
    for(let tr of Object.values(tableRows)){
        tr.className = '';
    }
    if(now < fajrDate){
        body.className = 'isha';
        hightlight(tableRows['isha']);
    }else if(now < sunriseDate){
        body.className = 'fajr';
        hightlight(tableRows['fajr']);
    }else if(now < dhuhrDate){
        body.className = 'sunrise';
        hightlight(tableRows['sunrise']);
    }else if(now < asrDate){
        body.className = 'dhuhr';
        hightlight(tableRows['dhuhr']);
    }else if(now < maghribDate){
        body.className = 'asr';
        hightlight(tableRows['asr']);
    }else if(now < ishaDate){
        body.className = 'maghrib';
        hightlight(tableRows['maghrib']);
    }else{
        body.className = 'isha';
        hightlight(tableRows['isha']);
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
        fajrDate = new Date(today + " " + fajr);
        sunriseDate = new Date(today + " " + sunrise);
        dhuhrDate = new Date(today + " " + dhuhr);
        asrDate = new Date(today + " " + asr);
        maghribDate = new Date(today + " " + maghrib);
        ishaDate = new Date(today + " " + isha);

        let maghribIqamah = new Date(maghribDate.getTime() + 5*60000);
        // TODO fix this so the function is more robust and these extra sanitation steps dont have to happen here
        let mHour = (maghribIqamah.getHours() < 10) ?  "0" + maghribIqamah.getHours() : "" + maghribIqamah.getHours();
        let mMin = (maghribIqamah.getMinutes() < 10) ? "0" + maghribIqamah.getMinutes() : "" + maghribIqamah.getMinutes();
        adhanElements['maghribIqamah'].innerText = formatTime(mHour + ':' + mMin);
        // console.log(fajrDate);
        // console.log(sunriseDate);
        // console.log(dhuhrDate);
        // console.log(asrDate);
        // console.log(maghribDate);
        // console.log(ishaDate);

        checkIfAdhan();
        
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
window.addEventListener('minutePassed', checkIfAdhan);
