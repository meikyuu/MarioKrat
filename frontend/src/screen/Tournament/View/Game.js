import React from 'react';
import styled from 'styled-components';
import theme from '../../../theme';
import Slot from './Slot';

const Container = styled.div`
    flex: 1 1;
    margin-left: 1rem;
    &:first-child {
        margin-left: 0;
    }
    
    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 0.5rem;
    background-color: ${theme.bgColorP1};
    min-height: 8rem;
`;

export default function Game({ game }) {
    return (
        <Container>
            <b>{game.name}:&nbsp;</b>
            {game.players.map((slot, i) => (
                <React.Fragment key={i}>
                    {i !== 0 && ', '}
                    <Slot slot={slot} />
                </React.Fragment>
            ))}
        </Container>
    );
}
