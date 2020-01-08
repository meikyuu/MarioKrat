import React from 'react';
import styled from 'styled-components';
import theme from '../theme';
import Icon from './Icon';

const StyledInput = styled.input`
    display: block;
    width: 100%;

    background-color: ${theme.bgColorP1};
    color: ${theme.textColorP1};
    border: unset;
    font-size: 1rem;
    font-weight: bold;
    padding: 0.5rem;
    text-align: center;
    border-radius: 0.5rem;
    cursor: pointer;
    &:active, &:focus {
        outline: unset;
        background-color: ${theme.bgColorP2};
        color: ${theme.textColorP2};
    }
    transition: background-color 300ms ease, color 300ms ease;
`;

const Container = styled.div`
    position: relative;
    margin-bottom: 1rem;
    &:last-child {
        margin-bottom: 0;
    }
`;

const DeleteIcon = styled(Icon)`
    position: absolute;
    top: 50%;
    right: 0.5rem;
    transform: translateY(-50%);

    ${({ onClick }) => onClick ? `
        cursor: pointer;
    ` : `
        opacity: 0;
        pointer-events: none;
    `}

    color: ${theme.textColorN2};
    &:hover {
        color: ${theme.textColor};
    }
    transition: opacity 300ms ease, color 300ms ease;
`;

export default function Input({ onDelete, ...props }) {
    return (
        <Container>
            <StyledInput {...props} />
            <DeleteIcon name="trash-alt" onClick={onDelete} />
        </Container>
    );
}
