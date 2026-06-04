var storyPanel = document.getElementById('storyPanel');

function openStory(id) {
  storyPanel.classList.add('open');
  storyPanel.focus();
  if (drawerOpen) toggleDrawer();
  document.getElementById('waypointAlert').classList.remove('visible');
}

function closeStory() {
  storyPanel.classList.remove('open');
  stopAudio();
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeStory();
});

var utterance = null;
var speaking = false;

var storyText = 'You are standing close to where Olaudah Equiano walked in August 1790. ' +
  'His visit to Sheffield was arranged by the Reverend Thomas Bryant, a local Methodist minister. ' +
  'Wincobank Hall, which stood not far from where you are now, was the home of Joseph and Elizabeth Read — ' +
  'radical thinkers who were among Equiano\'s most committed supporters in Sheffield. ' +
  'Their daughter, Mary Anne Rawson, went on to attend the inaugural World Anti-Slavery Convention in 1840, ' +
  'and later formed the Sheffield Ladies Association for the Universal Abolition of Slavery. ' +
  'The thread from Equiano\'s visit to this hillside in 1790 runs directly to the abolition of slavery across the British Empire in 1833.';

function toggleAudio() {
  if (speaking) {
    stopAudio();
  } else {
    startAudio();
  }
}

function startAudio() {
  if (!('speechSynthesis' in window)) {
    alert('Audio narration is not supported in this browser. Please try Chrome or Safari.');
    return;
  }
  stopAudio();
  utterance = new SpeechSynthesisUtterance(storyText);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.lang = 'en-GB';

  var voices = speechSynthesis.getVoices();
  var preferred = voices.find(function(v) { return v.lang === 'en-GB' && v.name.toLowerCase().includes('female'); })
    || voices.find(function(v) { return v.lang === 'en-GB'; })
    || voices.find(function(v) { return v.lang.startsWith('en'); });
  if (preferred) utterance.voice = preferred;

  utterance.onend = function() { speaking = false; updateAudioBtn(); };
  utterance.onerror = function() { speaking = false; updateAudioBtn(); };

  speechSynthesis.speak(utterance);
  speaking = true;
  updateAudioBtn();
}

function stopAudio() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  speaking = false;
  updateAudioBtn();
}

function updateAudioBtn() {
  var btn = document.getElementById('audioBtn');
  var txt = document.getElementById('audioBtnText');
  btn.classList.toggle('playing', speaking);
  btn.setAttribute('aria-pressed', speaking);
  txt.textContent = speaking ? 'Stop' : 'Listen';
  btn.setAttribute('aria-label', speaking ? 'Stop audio narration' : 'Listen to this story');
}

if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = function() { speechSynthesis.getVoices(); };
}
