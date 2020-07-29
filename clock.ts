
let canvas = <HTMLCanvasElement> document.getElementById('canvas');
let context = canvas.getContext('2d')!;

let clockImage = new Image();
let clockImageLoaded = false;
clockImage.onload = () => clockImageLoaded = true;
clockImage.src = './clock_face.png';

let time = document.getElementById('time')!;

/* Initializing date with a random start date so it is forced to get
set on the first call to update the time. */
let date = new Date(1234567890);

const minutePassedEvent = new Event('minutePassed');

function addBackgroundImage() {
    /* Draws the background image, aligning the top left corner of the
    image to the top left corner of the canvas. */
    context.drawImage(
        clockImage,
        canvas.width/2 * -1,
        canvas.height/2 * -1,
        canvas.width,
        canvas.height);
}

function drawCenterCircle(){
    context.beginPath();
    context.arc(0, 0, 10, 0, Math.PI * 2);
    context.fill();
}

function rads(degrees : number){
    return (Math.PI / 180) * degrees;
}

function drawHand(color : string, thickness : number, length : number){
    context.shadowColor = '#555';
    context.shadowBlur = 7;
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;

    context.fillStyle = color;
    context.fillRect(thickness/2 * -1, 0, thickness, length * -1);
}

function drawHourHand(date : Date) {
    let hour = date.getHours() % 12;
    let minutes = date.getMinutes();
    let angle = (hour * 30) + (minutes / 2);
    context.save();
    context.rotate(rads(angle));
    drawHand('black', 15, 130);
    context.restore();
}

function drawMinuteHand(date : Date) {
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let angle = (minutes * 6) + seconds/10;
    context.save();
    context.rotate(rads(angle));
    drawHand('black', 10, 210);
    context.restore();
}

function drawSecondHand(date : Date) {
    let seconds = date.getSeconds();
    let angle = seconds * 6;
    context.save();
    context.rotate(rads(angle));
    drawHand('red', 3, 210);
    context.restore();
}

function createClock() {
    addBackgroundImage();
    
    let newDate = new Date();
    drawCenterCircle();
    drawHourHand(newDate);
    drawMinuteHand(newDate);
    drawSecondHand(newDate);
    
    if(newDate.getMinutes() == date.getMinutes()
        && newDate.getHours() == date.getHours()){

            return;
    }
    
    window.dispatchEvent(minutePassedEvent);

    date = newDate;
    let hour = date.getHours();
    let minute =
        date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();

    if(hour < 12){
        if(hour == 0){
            time.innerText = 12 + ":" + minute + " AM";
        }else{
            time.innerText = hour + ":" + minute + " AM";
        }
    }else{
        if(hour == 12){
            time.innerText = 12 + ":" + minute + " PM";
        }else{
            time.innerText = hour%12 + ":" + minute + " PM";
        }
    }
}

function clockApp() {
    if(!clockImageLoaded){
        setTimeout('clockApp()', 100);
        return;
    }
    /* Translates the origin of the canvas to its center. This is
    necessary because this is the point around which the clock hands will
    rotate. */
    context.translate(canvas.width/2, canvas.height/2);
    createClock();
    setInterval(createClock, 1000);
}

