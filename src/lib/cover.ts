import { convertFileSrc, invoke } from '@tauri-apps/api/core';

export async function getCover(path: string): Promise<string | null> {
  const cover = await invoke<string | null>('plugin:cover|get_cover', {
    path,
  });

  if (cover === null) {
    return null;
  }

  return cover.startsWith('data:') ? cover : convertFileSrc(cover);
}
