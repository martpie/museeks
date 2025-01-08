import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

export default function useDndSensors() {
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });

  return useSensors(pointerSensor, useSensor(KeyboardSensor));
}
