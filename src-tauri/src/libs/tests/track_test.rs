use crate::libs::track::normalize_album_artist_sort;

#[test]
fn normalize_album_artist_sort_scenarios() {
    // Strip leading "The " (case-insensitive)
    assert_eq!(normalize_album_artist_sort("The Beatles"), "Beatles");
    assert_eq!(normalize_album_artist_sort("the Kooks"), "Kooks");

    // Strip leading non-alphabetic characters
    assert_eq!(normalize_album_artist_sort("-M-"), "M-");
    assert_eq!(normalize_album_artist_sort("...Abba"), "Abba");

    // Apply both transformations in order
    assert_eq!(normalize_album_artist_sort("The -M-"), "M-");

    // Preserve trimmed original if no ASCII letter remains
    assert_eq!(normalize_album_artist_sort("---"), "---");
    assert_eq!(normalize_album_artist_sort("   ---   "), "---");

    // Leave regular names unchanged
    assert_eq!(normalize_album_artist_sort("Metallica"), "Metallica");
}
