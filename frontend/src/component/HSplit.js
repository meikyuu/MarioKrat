import styled from 'styled-components';

export default styled.div`
    display: flex;
    > * {
        flex: 1 1 0;
        margin-left: 1rem;
        margin-bottom: 0 !important;
        &:first-child {
            margin-left: 0;
        }
    }
    margin-bottom: 1rem;
    &:last-child {
        margin-bottom: 0;
    }
`;
