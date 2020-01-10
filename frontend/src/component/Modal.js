import React from 'react';
import styled from 'styled-components';
import theme from '../theme';
import Icon from './Icon';

const OuterContainer = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    ${({ open }) => open ? `` : `
        pointer-events: none;   
    `}
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Background = styled.div`
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    opacity: ${({ open }) => open ? 1 : 0};
    transition: opacity 600ms ease;
`;

const InnerContainer = styled.div`
    position: relative;
    margin: 1rem;
    width: 100%;
    max-width: ${({ size }) => size};
    max-height: calc(100% - 2rem);
    background-color: ${theme.bgColor};
    border-radius: 0.5rem;
    box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.25);
    padding: 1rem;

    ${({ open }) => open ? `
        opacity: 1;
    ` : `
        opacity: 0;
        transform: translateY(100vh) scale(0.5);
    `}
    transition: opacity 600ms ease, transform 600ms ease;
    
    h3 {
        margin: 0 0 1rem;
        &:last-child {
            margin-bottom: 0;
        }
    }
`;

const CloseIcon = styled(Icon)`
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.25rem;
    cursor: pointer;
    color: ${theme.bgColorP2};
    &:hover {
        color: ${theme.textColorN2};
    }
    transition: color 300ms ease;
`;

export default function Modal({
    title,
    open = true,
    size = '600px',
    onClose = () => {},
    children = null,
    ...props
}) {
    return (
        <OuterContainer open={open}>
            <Background open={open} onClick={onClose} />
            <InnerContainer open={open} size={size} {...props}>
                <CloseIcon name="times" onClick={onClose} />
                <h3>{title}</h3>
                {children}
            </InnerContainer>
        </OuterContainer>
    );
}
