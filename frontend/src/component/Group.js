import React from 'react';
import styled from 'styled-components';
import theme from '../theme';

const GroupContainer = styled.section`
    margin-bottom: 1rem;
    &:last-child {
        margin-bottom: 0;
    }
    > label {
        font-size: 0.9rem;
        text-align: center;
        display: block;
        margin-bottom: 0.25rem;
        color: ${theme.textColorN2};
    }
`;

export default function Group({ label, children, innerRef, ...props }) {
    return (
        <GroupContainer ref={innerRef} {...props}>
            <label>{label}</label>
            {children}
        </GroupContainer>
    );
}
