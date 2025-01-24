if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('src/sw.js')
    .then((registration) => {
      console.log('Service Worker registrato con successo:', registration.scope);
    })
    .catch((error) => {
      console.error('Registrazione del Service Worker fallita:', error);
    });
}

const buttonShare = document.querySelector('[data-button="share"]');

buttonShare.addEventListener("click", event => {
  event.stopImmediatePropagation();
  captureScreenshot();
});


let canvasElement; // Variabile per il riferimento al canvas
let cols, rows; // Numero di colonne e righe
let grid = []; // Griglia per memorizzare i colori
let tileSize = 30; // Dimensione di ogni casella
let currentColor; // Colore corrente durante il trascinamento
let isMoving = false; // Flag per tracciare il movimento
let initialTouch = null; // Memorizza la posizione iniziale del tocco
let touchedCell = null; // Memorizza la casella toccata
let touchStartTime = 0; // Memorizza l'ora di inizio del tocco

let allOn = false; // Flag per controllare se tutte le caselle sono "on"
let atLeastOneIsOn = false; // Flag per controllare che almeno una casella sia in "on"
let autoChangeInterval = 3000; // Intervallo di tempo per il cambio colore automatico (in ms)
let lastAutoChangeTime = 0; // Ultimo momento in cui è avvenuto il cambio colore automatico

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight); // Crea il canvas
  canvasElement = canvas.elt; // Salva il riferimento all'elemento HTML del canvas
  noStroke(); // Rimuove tutti i bordi delle caselle

  // Calcola il numero di colonne e righe in base alla larghezza e altezza disponibili
  cols = floor(width / tileSize);
  rows = floor(height / tileSize);

  // Inizializza la griglia con colori neri (spente)
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = { color: color(0), isOn: false }; // Caselle iniziano spente
    }
  }

  // Imposta il colore iniziale (un colore casuale)
  currentColor = color(random(255), random(255), random(255));
}

function draw() {
  background(0); // Sfondo nero

  // Griglia centrata con cornice vuota
  let marginX = (width - cols * tileSize) / 2;
  let marginY = (height - rows * tileSize) / 2;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      fill(grid[i][j].color);
      rect(marginX + i * tileSize, marginY + j * tileSize, tileSize, tileSize);
    }
  }

  // Verifica se tutte le caselle sono "on"
  allOn = true;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (!grid[i][j].isOn) {
        allOn = false;
        break;
      }
    }
    if (!allOn) break;
  }

  // Verifica se almeno una caselle è in "on"
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j].isOn) {
        atLeastOneIsOn = true;
        break;
      }
    }
    if (atLeastOneIsOn) break;
  }

  if(atLeastOneIsOn) {
    buttonShare.classList.add("open");
  } else {
    buttonShare.classList.remove("open");
  }

  // Se tutte le caselle sono "on", cambia colore automaticamente ogni tot secondi
  if (allOn && millis() - lastAutoChangeTime > autoChangeInterval) {
    lastAutoChangeTime = millis();
    //changeColorsWithPaths(); // Cambia colore con tracciati ramificati
    //captureScreenshot();
  }
}

function touchStarted() {
  // Memorizza la posizione iniziale del tocco
  initialTouch = createVector(mouseX, mouseY);
  touchStartTime = millis(); // Salva il tempo di inizio del tocco
  isMoving = false; // All'inizio, non stiamo muovendo il dito

  let i = floor((mouseX - (width - cols * tileSize) / 2) / tileSize);
  let j = floor((mouseY - (height - rows * tileSize) / 2) / tileSize);

  if (i >= 0 && i < cols && j >= 0 && j < rows) {
    // Memorizziamo la casella che è stata toccata
    touchedCell = { x: i, y: j };
  }

  return false; // Previene il comportamento di default del touch
}

function touchMoved() {
  let i = floor((mouseX - (width - cols * tileSize) / 2) / tileSize);
  let j = floor((mouseY - (height - rows * tileSize) / 2) / tileSize);

  // Verifica se il movimento è significativo per distinguere un "click" da un "trascinamento"
  let movementThreshold = 10; // Tolleranza di movimento (in pixel)
  let distance = dist(initialTouch.x, initialTouch.y, mouseX, mouseY);

  if (distance > movementThreshold) {
    isMoving = true; // È un movimento, non un click

    if (i >= 0 && i < cols && j >= 0 && j < rows) {
      // Se la casella è accesa, cambia solo colore, mantenendo lo stato "on"
      if (grid[i][j].isOn) {
        grid[i][j].color = currentColor; // Applica il colore durante il trascinamento
      } else {
        grid[i][j].color = currentColor; // Applica il colore
        grid[i][j].isOn = true; // Accende la casella
      }
    }
  }

  return false; // Previene il comportamento di default del touch
}

function touchEnded() {
  let i = floor((mouseX - (width - cols * tileSize) / 2) / tileSize);
  let j = floor((mouseY - (height - rows * tileSize) / 2) / tileSize);

  // Se è stato un semplice click e non un movimento, cambia il colore e lo stato della casella
  let clickDuration = millis() - touchStartTime;

  // Controllo se il click è stato troppo breve per essere considerato un movimento
  if (!isMoving && clickDuration < 300) {
    // Se la casella toccata è quella giusta, cambia il suo stato
    if (touchedCell && i === touchedCell.x && j === touchedCell.y) {
      // Cambia stato solo se non è stato già cambiato
      if (!grid[i][j].isOn) {
        grid[i][j].color = currentColor;
        grid[i][j].isOn = true; // Accende la casella
      } else {
        grid[i][j].color = color(0); // Torna a nero
        grid[i][j].isOn = false; // Spegne la casella
      }
      touchedCell = null; // Reset della casella toccata
    }
  }

  // Imposta un nuovo colore per il prossimo click o movimento
  currentColor = color(random(255), random(255), random(255));

  return false; // Previene il comportamento di default del touch
}

// Funzione per cambiare i colori con tracciati ramificati
function changeColorsWithPaths() {
  let numPaths = 5; // Numero di tracciati da generare
  let maxPathLength = 5; // Lunghezza massima di ogni percorso (in caselle)

  // Per ogni tracciato, genera una posizione di partenza e una direzione
  for (let i = 0; i < numPaths; i++) {
    let startX = floor(random(cols));
    let startY = floor(random(rows));
    let pathColor = color(random(255), random(255), random(255));

    let x = startX;
    let y = startY;
    let pathLength = floor(random(2, maxPathLength)); // Lunghezza casuale per il percorso

    // Genera un percorso ramificato
    for (let j = 0; j < pathLength; j++) {
      grid[x][y].color = pathColor;
      grid[x][y].isOn = true;

      // Aggiungi una leggera randomizzazione nella direzione del movimento
      let direction = floor(random(4)); // 0: destra, 1: sinistra, 2: su, 3: giù

      if (direction === 0 && x < cols - 1) x++; // Destra
      else if (direction === 1 && x > 0) x--; // Sinistra
      else if (direction === 2 && y > 0) y--; // Su
      else if (direction === 3 && y < rows - 1) y++; // Giù
    }
  }
}

// Funzione per catturare e condividere lo screenshot
function captureScreenshot() {
   if (!canvasElement) {
    console.error("Il canvas non è stato trovato!");
    return;
  }
  
  // Cattura il canvas come immagine
  const dataURL = canvasElement.toDataURL('image/png');
  
  // Controlla se il browser supporta l'API di condivisione
  if (navigator.canShare) {
    const blob = dataURLToBlob(dataURL);
    const file = new File([blob], "screenshot.png", { type: "image/png" });
    
    navigator.share({
      title: "Condividi la tua Pixel Art",
      text: "Questa è Pixel Art!",
      files: [file]
    }).catch(console.error);
  } else {
    // Fallback: apri l'immagine in una nuova scheda
    const newWindow = window.open();
    newWindow.document.write(`<img src="${dataURL}" alt="Canvas Screenshot"/>`);
  }
}

// Helper per convertire base64 in Blob
function dataURLToBlob(dataURL) {
  const byteString = atob(dataURL.split(',')[1]);
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}
