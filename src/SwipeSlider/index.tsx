import * as React from 'react';

//Hooks
import {useState, useEffect, useRef, useCallback} from 'react';

//Components
import {View, PanResponder, Animated} from 'react-native';

//Styles
import Styles from './index.styles';

//Util
import {calculateValue} from '../util';

//Types
import {
    StyleProp,
    ViewStyle,
    GestureResponderEvent,
    PanResponderGestureState,
    LayoutChangeEvent
} from 'react-native';
import {Dimensions} from '../util';

type SwipeSliderProps = {
    min: number;
    max: number;
    step?: number;

    value: number;
    onChange?: (value: number) => void;
    changeEventThrottle?: number;

    vertical?: boolean;
    backgroundColor: string;
    barColor: string;

    style?: StyleProp<ViewStyle>;
    barStyle?: StyleProp<ViewStyle>;
};

const SwipeSlider: React.FC<SwipeSliderProps> = ({
    min,
    max,
    step = 1,

    value,
    onChange,
    changeEventThrottle,

    vertical = false,
    backgroundColor,
    barColor,

    style,
    barStyle,
    
    children
}) => {
    const [dimensions, setDimensions] = useState<Dimensions>({width: 0, height: 0});
    const animation = useRef(new Animated.Value(value));
    const lastChangeEventCall = useRef(0);

    const tempValueHandler = useCallback(
        (_event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
            const tempValue = calculateValue(
                gestureState,
                dimensions,
                min,
                max,
                step,
                vertical,
                value
            );
            Animated.timing(animation.current, {
                toValue: tempValue,
                duration: 25,
                useNativeDriver: false
            }).start();

            if(!changeEventThrottle || Date.now() - lastChangeEventCall.current < changeEventThrottle) {
                return;
            }
            onChange?.(tempValue);
            lastChangeEventCall.current = Date.now();
        },
        [dimensions, min, max, step, vertical, value]
    );

    const onChangeValueHandler = useCallback(
        (_event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
            const tempValue = calculateValue(
                gestureState,
                dimensions,
                min,
                max,
                step,
                vertical,
                value
            );
            Animated.timing(animation.current, {
                toValue: tempValue,
                duration: 50,
                useNativeDriver: false
            }).start();
            onChange?.(tempValue);
        },
        [dimensions, min, max, step, vertical, value]
    );

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => false,
        onPanResponderMove: tempValueHandler,
        onPanResponderRelease: onChangeValueHandler,
        onPanResponderTerminationRequest: () => false,
        onPanResponderTerminate: onChangeValueHandler
    })

    const onLayoutHandler = useCallback(
        (event: LayoutChangeEvent) => {
            setDimensions({
                width: event.nativeEvent.layout.width,
                height: event.nativeEvent.layout.height
            });
        },
        [dimensions]
    );

    useEffect(() => {
        Animated.timing(animation.current, {
            toValue: value,
            duration: 50,
            useNativeDriver: false
        }).start();
    }, [min, max, value])

    const interpolatedValue = animation.current.interpolate({
        inputRange: [min, max],
        outputRange: [0, vertical ? dimensions.height : dimensions.width]
    });

    return (
        <View
            onLayout={onLayoutHandler}
            style={[Styles.slider, {backgroundColor}, style]}
            {...panResponder.panHandlers}
        >
            <Animated.View
                style={[
                    Styles.bar,
                    {
                        backgroundColor: barColor,
                        height: vertical ? interpolatedValue : dimensions.height,
                        width: vertical ? dimensions.width : interpolatedValue
                    },
                    barStyle
                ]}
            />

            {children}
        </View>
    );
};

export default SwipeSlider