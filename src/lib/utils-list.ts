import { isAltKey, isCtrlKey, isLeftClick, isRightClick } from './utils-events';

type ListItem = {
  id: string;
};

/**
 * Data agnostic super-function able to retrieve the right user-selection based
 * on a list of item, and a *mouse* event. Immutable.
 *  - shift: will select all tracks between last selection and selected item
 *  - cmd/ctrl: will toggle on/off the selected item from the selection
 */
export function listMouseSelect(
  list: Array<ListItem>,
  // The already selected IDs within the list of items
  selection: Set<string>,
  // The ID that was selected for this operation
  selectedID: string,
  // The mouse event
  event: React.MouseEvent,
): Set<string> {
  const isSelectable = !selection.has(selectedID);

  // Shortcut in case nothing needs to be changed
  if (!isSelectable && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
    return selection;
  }

  const ctrlKey = isCtrlKey(event);
  const altKey = isAltKey(event);
  const shiftKey = event.shiftKey;

  if (isLeftClick(event) || (isRightClick(event) && isSelectable)) {
    if (ctrlKey) {
      // Scenario 1. Add or remove single item via CMD/CTRL
      if (selection.has(selectedID)) {
        selection.delete(selectedID);
        return new Set(selection);
      }

      selection.add(selectedID);
      return new Set(selection);
    }

    // Scenario 2. Multi-select range
    if (shiftKey) {
      if (selection.size === 0) {
        return new Set([selectedID]);
      }

      // retrieve the first and the last element of the list
      let selectedMinIndex: null | number = null;
      let selectedMaxIndex: null | number = null;
      let clickedIndex: null | number = null;

      for (const [index, item] of list.entries()) {
        if (selectedMinIndex === null && selection.has(item.id)) {
          selectedMinIndex = index;
          selectedMaxIndex = index;
        } else if (selection.has(item.id)) {
          selectedMaxIndex = index;
        }

        if (selectedID === item.id) {
          clickedIndex = index;
        }
      }

      // type check, should not happen but still
      if (
        selectedMinIndex === null ||
        selectedMaxIndex === null ||
        clickedIndex === null
      ) {
        return selection;
      }

      // now, return all the IDs of all the indices between "min/max" and "clicked"
      const newSelection = new Set(selection);
      const min = Math.min(clickedIndex, selectedMinIndex);
      const max = Math.max(clickedIndex, selectedMaxIndex);

      for (let i = min; i <= max; i++) {
        newSelection.add(list[i].id);
      }

      return newSelection;
    }

    if (!altKey) {
      // Scenario 3. Just standard click
      return new Set([selectedID]);
    }
  }

  // Otherwise, nothing to be done
  return selection;
}

/**
 * Data agnostic super-function able to retrieve the right user-selection based
 * on a list of item, and a * keyboard * event. Immutable.
 *  - shift: will progressively add tracks to the selection as they key event is
 *           triggered.
 */
export function listKeyboardSelect(
  list: Array<ListItem>,
  // The already selected IDs within the list of items
  selection: Set<string>,
  // The mouse event
  event: KeyboardEvent,
): [Set<string>, scrollIndex: number | null] {
  const firstSelectedTrackIndex = list.findIndex((track) =>
    selection.has(track.id),
  );

  switch (event.key) {
    case 'a':
      if (isCtrlKey(event)) {
        event.preventDefault();
        // Select all tracks
        return [new Set(list.map((track) => track.id)), null];
      }
      break;

    case 'ArrowUp': {
      event.preventDefault();

      const addedIndex = Math.max(0, firstSelectedTrackIndex - 1);

      // Add to the selection if shift key is pressed
      let newSelected = selection;

      if (event.shiftKey)
        newSelected = new Set([list[addedIndex].id, ...selection]);
      // Or select only one from the first
      else newSelected = new Set([list[addedIndex].id]);

      return [newSelected, addedIndex];
    }

    case 'ArrowDown': {
      event.preventDefault();
      const lastSelectedTrackIndex = list.findLastIndex((track) =>
        selection.has(track.id),
      );

      const addedIndex = Math.min(list.length - 1, lastSelectedTrackIndex + 1);

      // Add to the selection if shift key is pressed
      let newSelected: Set<string>;
      if (event.shiftKey)
        newSelected = new Set([...selection, list[addedIndex].id]);
      // Or select only one from the last
      else newSelected = new Set([list[addedIndex].id]);

      return [newSelected, addedIndex];
    }
  }

  return [selection, null];
}
