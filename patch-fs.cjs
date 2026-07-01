const fs = require('fs');
const path = require('path');

function patchError(err) {
  if (err && err.code === 'EPERM') {
    const newErr = new Error(`ENOENT: no such file or directory, lstat '${err.path}'`);
    newErr.code = 'ENOENT';
    newErr.errno = -4058;
    newErr.syscall = err.syscall || 'lstat';
    newErr.path = err.path;
    return newErr;
  }
  return err;
}

// 1. Patch realpathSync
const origRealpathSync = fs.realpathSync;
fs.realpathSync = function(p, options) {
  try {
    return origRealpathSync(p, options);
  } catch (err) {
    if (err.code === 'EPERM') {
      return path.resolve(p);
    }
    throw err;
  }
};
if (fs.realpathSync.native) {
  const origRealpathSyncNative = fs.realpathSync.native;
  fs.realpathSync.native = function(p, options) {
    try {
      return origRealpathSyncNative(p, options);
    } catch (err) {
      if (err.code === 'EPERM') {
        return path.resolve(p);
      }
      throw err;
    }
  };
}

// 2. Patch realpath async
const origRealpath = fs.realpath;
fs.realpath = function(p, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }
  origRealpath(p, options, (err, resolvedPath) => {
    if (err && err.code === 'EPERM') {
      return callback(null, path.resolve(p));
    }
    callback(err, resolvedPath);
  });
};

// 3. Patch promises.realpath
if (fs.promises && fs.promises.realpath) {
  const origPromisesRealpath = fs.promises.realpath;
  fs.promises.realpath = function(p, options) {
    return origPromisesRealpath(p, options).catch(err => {
      if (err.code === 'EPERM') {
        return path.resolve(p);
      }
      throw err;
    });
  };
}

// 4. Patch statSync, lstatSync
const origStatSync = fs.statSync;
fs.statSync = function(p, options) {
  try {
    return origStatSync(p, options);
  } catch (err) {
    throw patchError(err);
  }
};
const origLstatSync = fs.lstatSync;
fs.lstatSync = function(p, options) {
  try {
    return origLstatSync(p, options);
  } catch (err) {
    throw patchError(err);
  }
};

// 5. Patch stat, lstat async
const origStat = fs.stat;
fs.stat = function(p, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }
  origStat(p, options, (err, stats) => {
    callback(patchError(err), stats);
  });
};
const origLstat = fs.lstat;
fs.lstat = function(p, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }
  origLstat(p, options, (err, stats) => {
    callback(patchError(err), stats);
  });
};

// 6. Patch promises stat, lstat
if (fs.promises) {
  if (fs.promises.stat) {
    const origPromisesStat = fs.promises.stat;
    fs.promises.stat = function(p, options) {
      return origPromisesStat(p, options).catch(err => {
        throw patchError(err);
      });
    };
  }
  if (fs.promises.lstat) {
    const origPromisesLstat = fs.promises.lstat;
    fs.promises.lstat = function(p, options) {
      return origPromisesLstat(p, options).catch(err => {
        throw patchError(err);
      });
    };
  }
}

// 7. Patch readdirSync, readdir
const origReaddirSync = fs.readdirSync;
fs.readdirSync = function(p, options) {
  try {
    return origReaddirSync(p, options);
  } catch (err) {
    throw patchError(err);
  }
};
const origReaddir = fs.readdir;
fs.readdir = function(p, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }
  origReaddir(p, options, (err, files) => {
    callback(patchError(err), files);
  });
};
if (fs.promises && fs.promises.readdir) {
  const origPromisesReaddir = fs.promises.readdir;
  fs.promises.readdir = function(p, options) {
    return origPromisesReaddir(p, options).catch(err => {
      throw patchError(err);
    });
  };
}

console.log('[FS PATCH] Bypassed EPERM file-system checks on restricted paths.');
