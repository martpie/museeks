import { TrackDoc } from "../generated/typings";
import { TrackSearchableFields } from "../types/museeks";

/**
 * Strip accent from String. From https://jsperf.com/strip-accents
 */
export const stripAccents = (str: string): string => {
  const accents =
    "ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž";
  const fixes =
    "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
  const split = accents.split("").join("|");
  const reg = new RegExp(`(${split})`, "g");

  function replacement(a: string) {
    return fixes[accents.indexOf(a)] || "";
  }

  return str.replace(reg, replacement).toLowerCase();
};

/**
 * Take a track a returns its lowered metadata (used for search)
 */
export const getLoweredMeta = (track: TrackDoc): TrackSearchableFields => ({
  artists: track.doc.artists.map((v) => stripAccents(v.toLowerCase())),
  album: stripAccents(track.doc.album.toLowerCase()),
  title: stripAccents(track.doc.title.toLowerCase()),
  genres: track.doc.genres.map((v) => stripAccents(v.toLowerCase())),
});
