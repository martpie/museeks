/**
 * Parse an int to a more readable string
 */
export const parseDuration = (duration: number | null): string => {
  if (duration !== null) {
    const hours = Math.trunc(duration / 3600);
    const minutes = Math.trunc(duration / 60) % 60;
    const seconds = Math.trunc(duration) % 60;

    const hoursStringified = hours < 10 ? `0${hours}` : hours;
    const minutesStringified = minutes < 10 ? `0${minutes}` : minutes;
    const secondsStringified = seconds < 10 ? `0${seconds}` : seconds;

    let result = hours > 0 ? `${hoursStringified}:` : '';
    result += `${minutesStringified}:${secondsStringified}`;

    return result;
  }

  return '00:00';
};

/**
 * Remove duplicates (realpath) and useless children folders
 */
export const removeUselessFolders = (folders: string[]): string[] => {
  // Remove duplicates
  let filteredFolders = folders.filter(
    (elem, index) => folders.indexOf(elem) === index,
  );

  const foldersToBeRemoved: string[] = [];

  filteredFolders.forEach((folder, i) => {
    filteredFolders.forEach((subfolder, j) => {
      if (
        subfolder.includes(folder) &&
        i !== j &&
        !foldersToBeRemoved.includes(folder)
      ) {
        foldersToBeRemoved.push(subfolder);
      }
    });
  });

  filteredFolders = filteredFolders.filter(
    (elem) => !foldersToBeRemoved.includes(elem),
  );

  return filteredFolders;
};

// export const getAudioDuration = (trackPath: string): Promise<number> => {
//   const audio = new Audio();

//   return new Promise((resolve, reject) => {
//     audio.addEventListener('loadedmetadata', () => {
//       resolve(audio.duration);
//     });

//     audio.addEventListener('error', (e) => {
//       // eslint-disable-next-line
//       // @ts-ignore error event typing is wrong
//       const message = `Error getting audio duration: (${e.currentTarget.error.code}) ${trackPath}`;
//       reject(new Error(message));
//     });

//     audio.preload = 'metadata';
//     // HACK no idea what other caracters could fuck things up
//     audio.src = encodeURI(trackPath).replace('#', '%23');
//   });
// };
