const logFilter = (data) => {
  const blocked = [
    'Closing stale open session',
    'Closing session:',
    'Opening new session for incoming prekey',
    'Creating new session for',
    'Using existing session for'
	'Removing old closed session:'
  ];

  return !blocked.some(bad => data.includes(bad));
};

// Backup original write method
const origStdoutWrite = process.stdout.write.bind(process.stdout);
const origStderrWrite = process.stderr.write.bind(process.stderr);

// Replace write method
process.stdout.write = (chunk, encoding, callback) => {
  if (typeof chunk === 'string') {
    if (logFilter(chunk)) {
      origStdoutWrite(chunk, encoding, callback);
    }
  } else {
    origStdoutWrite(chunk, encoding, callback);
  }
};

process.stderr.write = (chunk, encoding, callback) => {
  if (typeof chunk === 'string') {
    if (logFilter(chunk)) {
      origStderrWrite(chunk, encoding, callback);
    }
  } else {
    origStderrWrite(chunk, encoding, callback);
  }
};

// Jalankan bot
require('./index.js');
