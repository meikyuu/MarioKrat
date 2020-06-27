import { useState, useCallback } from 'react';

export default function useLocalState(key, defaultValue) {
    const [state, setState] = useState(() => {
        let state = localStorage.getItem(key);
        console.log('LOOKUP', key, state, defaultValue);
        if (state) {
            console.log('RES', JSON.parse(state));
            return JSON.parse(state);
        } else if (typeof defaultValue === 'function') {
            console.log('RES', defaultValue());
            return defaultValue();
        } else {
            console.log('RES', defaultValue);
            return defaultValue;
        }
    });

    const setLocalState = useCallback((value) => setState((state) => {
        state = typeof value === 'function' ? value(state) : value;
        localStorage.setItem(key, JSON.stringify(state));
        return state;
    }), [key, setState]);

    return [state, setLocalState];
}
