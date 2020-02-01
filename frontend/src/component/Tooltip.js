import React, { useState } from 'react';
import styled from 'styled-components';
import theme from '../theme';

const Popup = styled.div`
    position: absolute;
    left: 50%;
    top: -0.125rem;
    width: auto;
    white-space: nowrap;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.25));

    background-color: ${theme.bgColorN1};
    padding: 0.25rem 0.375rem;
    border-radius: 0.25rem;

    transform: translate(-50%, 0) scale(0);
    opacity: 0;
    pointer-events: none;

    transition: transform 300ms ease, opacity 300ms ease;

    &:after {
        content: '';
        background-color: inherit;
        width: 0.375rem;
        height: 0.375rem;
        position: absolute;
        left: 50%;
        bottom: 0;
        transform: translate(-50%, 50%) rotate(45deg);
    }
`;

const Container = styled.span`
    position: relative;
    cursor: pointer;

    &:hover > ${Popup} {
        opacity: 1;
        pointer-events: inherit;
        transform: translate(-50%, -100%);
    }
`;

export default function Tooltip({ trigger, content, children, ...props }) {
    if (!trigger) {
        trigger = children;
    }
    if (!content) {
        content = children;
    }

    return (
        <Container>
            {trigger}
            <Popup>{content}</Popup>
        </Container>
    );
}
