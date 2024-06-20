let soundFile, reverb, isPlaying = false, isLooping;

const Snubsart = `
    
&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
&&&&&&&&&&xxX$&&&&&&&&&&&&&&&&&&&$$XX$&&&&&&&
$&&&&&&&&&x++xx$&&&&&&&&&&&&&&&$$Xx+x$&&&&&&&
XX$X&&&&&&X+xX$&&&&&&$$&&$$&&&&&$XxxxX&&&&&&&
&&&$&&&&&&&xx$X;+&x;+Xx$X$x++&x;X$xxX&&&&&&&&
&&&&&&&&&&&X&&&&&X;;+++x++x+;x$&&&&x&&&&&&&&&
&&&&&&$&&&x;+x$&$$&++++xx+++&X&&&$x;+&&&&&&&&
&&&&&&&&XxXXXXxxx$X$x+++++X$$$++xxX$$$&&&&&&&
&&&&&&&$XX$&$xXXx;;x&&&$&&$x;++xxx&$$&$&&&&&&
&&&&&&&&++++xx++;;;::;$&x;::;;+xxxxxxX$&&&&&&
&&&&&$$$Xx+;;;x$Xx+xxxXXXxx+xXx+;;;;;x$$$&&&&
&&$$$$X+;x++;++xxxxXXXX$xX+++;;;+;++x&$$$$&&&
&&&&&$XX++xx++;;;;;;;+;;+;;;;;;;;+x$&$$&&&&&&
&$Xx++xX$X++++X$Xx+xX;;;x++++xXX&&&$xx&&&&&&&
+$Xxx$&&&&&&&&&&$$$XXxXx$xXXxXXxx+xX$&&$&&&&&
xX$&&&&&&&&&&&&&&&&&&$Xx$&&&&&&&&&&&$&&&&&&&&
&&&&&&&&&&&&&&&&&&&X$xxxxX$$$$&&$$$&&&&&&&&&&
&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
    
    `

function preload() {
  soundFormats('wav', 'mp3', 'ogg', 'm4a', 'mp4');
}

function loadAudio(example) {
  if (!example) {
    const fileInput = document.getElementById('fileInput');
    const audioUrl = document.getElementById('audioUrl').value;
    const inform = document.getElementById('inform');
    let file;

    if (fileInput.files.length > 0) {
      file = fileInput.files[0];
    } else if (audioUrl.trim() !== '') {
      file = audioUrl;
    } else {
      alert('Please select a file or enter a valid URL.');
      return;
    }

    if (soundFile) {
      soundFile.stop();
    }

    soundFile = loadSound(file, () => {
      soundFile.disconnect();
      reverb.process(soundFile, parseFloat(document.getElementById('reverbSlider').value), 0.2);
      soundFile.setVolume(parseFloat(document.getElementById('ampSlider').value));
      soundFile.rate(parseFloat(document.getElementById('rateSlider').value));
      update();
      console.log('Audio loaded');
      inform.style.color = 'green';
      inform.innerText = 'Audio loaded';
    });
  } else {
    soundFile = loadSound("https://snubby.top/audio/Japanese_Greetings.wav", () => {
      soundFile.disconnect();
      reverb.process(soundFile, parseFloat(document.getElementById('reverbSlider').value), 0.2);
      soundFile.setVolume(parseFloat(document.getElementById('ampSlider').value));
      soundFile.rate(parseFloat(document.getElementById('rateSlider').value));
      update();
      console.log('Example Audio loaded');
      inform.style.color = 'green';
      inform.innerText = 'Audio loaded';
    });
  }
}

function setup() {
  var width = window.innerWidth || document.documentElement.clientWidth;
  var height = window.innerHeight || document.documentElement.clientHeight;
  createCanvas(width, height, audioVisualizer);

  // so the visualize works
  colorMode(HSB);
  angleMode(DEGREES);

  reverb = new p5.Reverb();
  reverb.amp(2);

  // create an fft to analyze the audio
  fft = new p5.FFT(0.9, 64);
  w = width / 64;

  const ampSlider = document.getElementById('ampSlider');
  const ampValue = document.getElementById('ampValue');
  ampSlider.addEventListener('input', () => {
    const volume = parseFloat(ampSlider.value);
    soundFile.setVolume(volume);
    ampValue.innerText = ampSlider.value;
  });

  const reverbSlider = document.getElementById('reverbSlider');
  const reverbValue = document.getElementById('reverbValue');
  reverbSlider.addEventListener('input', () => {
    const reverbAmount = parseFloat(reverbSlider.value);
    reverb.process(soundFile, reverbAmount, 0.2);
    reverbValue.innerText = reverbSlider.value;
  });

  const rateSlider = document.getElementById('rateSlider');
  const rateValue = document.getElementById('rateValue');
  rateSlider.addEventListener('input', () => {
    const rate = parseFloat(rateSlider.value);
    soundFile.rate(rate);
    rateValue.innerText = rateSlider.value;
  });

  const loopCheckbox = document.getElementById('loopCheckbox');
  loopCheckbox.addEventListener('input', () => {
    const loop = loopCheckbox.checked;
    isLooping = loop;
    console.log('looping = ' + isLooping);
  });

  update();
}

function draw() {
  // from this great video here https://www.youtube.com/watch?v=2O3nm0Nvbi4
  background(0);
  let spectrum = fft.analyze();
  for (let i = 0; i < spectrum.length; i++) {
    let ampl = spectrum[i];
    fill(i, 255, 255);
    let y = map(ampl, 0, 256, height, 0);
    rect(i*w, y, w, height - y);
  }
}

function togglePlay() {
  if (!soundFile) {
    console.log('Please load an audio file first.');
    return;
  }

  if (soundFile.isPlaying()) {
    soundFile.pause();
    isPlaying = false;
  } else {
    if (isLooping) {
      soundFile.loop();
    } else {
      soundFile.play();
    }
    isPlaying = true;
  }
  update();
}

function update() {
  const progressBar = document.getElementById('progressBar');
  const timeDisplay = document.getElementById('timeDisplay');

  if (soundFile && soundFile.isPlaying()) {
    const percent = (soundFile.currentTime() / soundFile.duration()) * 100;
    progressBar.style.width = percent + '%';

    const currentMinutes = Math.floor(soundFile.currentTime() / 60);
    let currentSeconds = Math.floor(soundFile.currentTime() % 60);
    if (currentSeconds < 10) {
      currentSeconds = '0' + currentSeconds;
    }

    const durationMinutes = Math.floor(soundFile.duration() / 60);
    let durationSeconds = Math.floor(soundFile.duration() % 60);
    if (durationSeconds < 10) {
      durationSeconds = '0' + durationSeconds;
    }

    timeDisplay.innerHTML = `<b>${currentMinutes}:${currentSeconds} / ${durationMinutes}:${durationSeconds}</b>`;
    console.log(`Playing.. ${percent.toFixed(1)}%`);
  }
}

function downloadAudio() { // still working on this, i want to make it where it downloads the modified version of the audio
  if (soundFile) {
    const Fname = soundFile.file.name;
    const FnameNoEx = Fname.split('.').slice(0, -1).join('.');
    const modifiedFilename = `${FnameNoEx}_modified`;

    soundFile.save(modifiedFilename);
  } else {
    console.log('No audio loaded to download.');
  }
}

// adding share link button only if there is a URL in the input
function shareLink() {
  const audioUrl = document.getElementById('audioUrl').value;
  if (audioUrl.trim() === '') {
    alert('Please load an audio URL first.');
    return;
  }

  const shareLink = document.getElementById('shareLink');
  const url = window.location.href.split('#')[0] + '#url=' + audioUrl;
  shareLink.style.display = 'block';
  shareLink.value = url;
  shareLink.select();
  navigator.clipboard.writeText(shareLink.value);
  shareLink.setSelectionRange(0, 99999); // mobile
  alert('Link copied to clipboard.');
}


window.setInterval(function () {
  update();
}, 500);

window.onload = function () {
  // checks if there is a url in the link as #url=URL
  const url = window.location.hash.substring(5);
  if (url) {
    document.getElementById('audioUrl').value = url;
  }
};

console.log(Snubsart);