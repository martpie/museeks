import { i18n } from '@lingui/core';

export async function loadTranslation(language: string) {
  const { messages } = await import(`../translations/${language}.po`);

  i18n.load(language, messages);
  i18n.activate(language);
}
