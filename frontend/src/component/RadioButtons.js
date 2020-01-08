import React from 'react';
import theme from '../theme';
import styled from 'styled-components';

const Container = styled.div`
    margin-bottom: 1rem;
    &:last-child {
        margin-bottom: 0;
    }

    background-color: ${theme.bgColorN1};
    text-align: center;
    border-radius: 0.75rem;

    display: flex;
    position: relative;
`;

const Highlight = styled.div`
    position: absolute;
    left: calc(${({ active, options }) => 100 * active / options}% + 0.25rem);
    top: 0.25rem;
    width: calc(${({ options }) => 100 / options}% - 0.5rem);
    height: calc(100% - 0.5rem);
    background-color: ${theme.primaryColor};
    border-radius: 0.5rem;
    transition: left 300ms ease;
`;

const Button = styled.div`
    flex: 1 1 0;
    position: relative;

    cursor: pointer;
    margin: 0.25rem;
    padding: 0.5rem;
    outline: none;
    background-color: transparent;
    color: ${({ active }) => active ? theme.textColorP1 : theme.textColorN2};
    font-size: 1rem;
    font-weight: bold;
    text-align: center;
    transition: color 300ms ease;
`;

export default function RadioButtons({ value, onChange, options }) {
    const active = options.findIndex((option) => option.value === value);
    return (
        <Container>
            {active !== -1 && (
                <Highlight active={active} options={options.length} />
            )}
            {options.map(({ value, content }, i) => (
                <Button
                    key={i}
                    active={i === active}
                    onClick={() => onChange(value)}
                >
                    {content}
                </Button>
            ))}
        </Container>
    );
}
