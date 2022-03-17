import React, { useState } from 'react';
import Icon from './Icon';
import styled from 'styled-components';
import theme from '../theme';

const CollapsibleContainer = styled.section`
    margin-bottom: 1rem;
    &:last-child {
        margin-bottom: 0;
    }
    > label {
        font-size: 0.9rem;
        text-align: center;
        display: block;
        font-weight: bold;
        cursor: pointer;
        margin-bottom: ${({ open }) => open ? 0.75 : 0}rem;
        position: relative;
        color: ${theme.textColorN2};
        > i:last-child {
            position: absolute;
            right: 0.5rem;
            top: 50%;
            transform: translateY(-50%);
        }
    }
`;

export default function Collapsible({ label, children, ...props }) {
    const [open, setOpen] = useState(false);
    return (
        <CollapsibleContainer data-test={`collapsible`} open={open}>
            <label onClick={() => setOpen(!open)}>
                {label}
                <Icon name={`chevron-${open ? 'up' : 'down'}`} />
            </label>
            {open && children}
        </CollapsibleContainer>
    )
}
