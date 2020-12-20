//Types
import {PanResponderGestureState} from 'react-native';

export type Dimensions = {
    width: number;
    height: number;
};

export const calculateValue = (
    gestureState: PanResponderGestureState,
    dimensions: Dimensions,
    min: number,
    max: number,
    step: number,
    vertical: boolean,
    prevValue: number
): number => {
    const ratio = vertical
        ? dimensions.height
            ? -gestureState.dy / dimensions.height
            : 0
        : dimensions.width
        ? gestureState.dx / dimensions.width
        : 0;
    const diff = max - min;
    return Math.max(min, Math.min(max, prevValue + Math.round((ratio * diff) / step) * step));
};
