import React, { useState, useEffect } from 'react';
import Input from './Input';

function serializeInt(number) {
    if (number === null) {
        return '';
    } else {
        return number.toString();
    }
}

export default function NumberInput({
    value = null,
    onChange = () => {},
    ...props
}) {
    return (
        <Input
            value={serializeInt(value)}
            onChange={(value) => {
                if (value === '') {
                    onChange(null);
                } else if (/^\d+$/.test(value)) {
                    onChange(parseInt(value));
                }
            }}
            {...props}
        />
    )
}
