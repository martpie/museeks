import { i18n } from '@lingui/core';

export async function loadTranslation(locale: string) {
  const { messages } = await import(`../translations/${locale}.po`);

  i18n.load(locale, messages);
  i18n.activate(locale);
}
