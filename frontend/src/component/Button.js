import styled from 'styled-components';
import theme from '../theme';

export default styled.button`
    display: block;
    width: 100%;
    margin-bottom: 1rem;
    &:last-child {
        margin-bottom: 0;
    }

    background-color: ${({ primary }) => primary ? theme.primaryColor : theme.bgColorN1};
    color: ${({ primary }) => primary ? theme.textColor : theme.textColorN1};
    border: unset;
    font-size: 1rem;
    font-weight: bold;
    padding: 0.5rem;
    text-align: center;
    border-radius: 0.5rem;
    cursor: pointer;
    &:hover, &:active, &:focus {
        background-color: ${({ primary }) => primary ? theme.primaryColorP1 : theme.bgColorN2};
        color: ${({ primary }) => primary ? theme.textColorP1 : theme.textColorN2};
    }
    transition: background-color 300ms ease, color 300ms ease;
`;
