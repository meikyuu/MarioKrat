import React from 'react';
import styled from 'styled-components';
import theme from '../../../theme';
import Slot from './Slot';
import range from '../../../helpers/range';

const Container = styled.div`
    border-radius: 0.5rem;
    background-color: ${theme.bgColorP1};
    overflow: hidden;
`;

const Header = styled.div`
    text-align: center;
    font-weight: bold;
    color: ${theme.textColorP1};
    background-color: ${theme.bgColorP2};
    padding: 0.25rem;
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    @media only screen and (min-width: 768px) {
        /* Desktop */
        flex-direction: row;
    }
    padding: 0.5rem;
`;

const Table = styled.div`
    display: grid;
    grid-gap: 0.15rem 0.35rem;
    font-size: 0.8em;

    margin-bottom: 0.5rem;
    &:last-child {
        margin-bottom: 0;
    }
    @media only screen and (min-width: 768px) {
        /* Desktop */
        flex: 1 1 auto;
        margin-bottom: 0;
        margin-right: 0.5rem;
        &:last-child {
            margin-right: 0;
        }
    }
`;

const Cup = styled(Table)`
    grid-template-columns: ${({ races }) => `1rem 1fr repeat(${races}, 1rem) 2rem`};
`;

const Total = styled(Table)`
    grid-template-columns: 1rem 1fr 2rem;
`;

const Cell = styled.div`
    grid-column: ${({ x }) => x + 1} / span ${({ width = 1 }) => width};
    grid-row: ${({ y }) => y + 1} / span ${({ height = 1 }) => height};
    text-align: center;
`;

const HeaderCell = styled(Cell)`
    background-color: ${theme.bgColor};
    color: ${theme.textColorN2};
    font-weight: bold;
    font-size: 0.6em;
    padding: 0.1rem 0rem;
    margin: 0 -0.1rem;
    border-radius: 0.2rem;
    text-align: center;
`;

export default function Game({ game }) {
    const cups = game.cups.map((cup, i) => {
        const baseY = game.cups.length > 1 ? 2 : 1;
        const races = Math.max(0, ...cup.map(({ races }) => races.length));
        return (
            <Cup races={races} key={i}>
                {game.cups.length > 1 && (
                    <HeaderCell x={0} y={0} width={3 + races}>
                        Cup {i + 1}
                    </HeaderCell>
                )}
                <HeaderCell x={0} y={baseY - 1}>#</HeaderCell>
                <HeaderCell x={1} y={baseY - 1}>Speler</HeaderCell>
                {range(races).map((i) => (
                    <HeaderCell key={i} x={2 + i} y={baseY - 1}>R{i + 1}</HeaderCell>
                ))}
                <HeaderCell x={2 + races} y={baseY - 1}>Score</HeaderCell>
                {cup.map((score, y) => (
                    <React.Fragment key={y}>
                        <Cell x={0} y={baseY + y}>
                            {score.rank}
                        </Cell>
                        <Cell x={1} y={baseY + y}>
                            <Slot slot={game.players[score.player]} />
                        </Cell>
                        {score.races.map((position, i) => (
                            <Cell key={i} x={2 + i} y={baseY + y}>
                                {position || '-'}
                            </Cell>
                        ))}
                        <Cell x={2 + races} y={baseY + y}>
                            {score.points} 
                        </Cell>
                    </React.Fragment>
                ))}
            </Cup>
        );
    });

    if (game.cups.length > 1) {
        cups.push(
            <Total key="total">
                <HeaderCell x={0} y={0} width={3}>
                    Totaal
                </HeaderCell>
                <HeaderCell x={0} y={1}>#</HeaderCell>
                <HeaderCell x={1} y={1}>Speler</HeaderCell>
                <HeaderCell x={2} y={1}>Score</HeaderCell>
                {game.total.map((score, y) => (
                    <React.Fragment key={y}>
                        <Cell x={0} y={y + 2}>
                            {score.rank}
                        </Cell>
                        <Cell x={1} y={y + 2}>
                            <Slot slot={game.players[score.player]} />
                        </Cell>
                        <Cell x={2} y={y + 2}>
                            {score.points} 
                        </Cell>
                    </React.Fragment>
                ))}
            </Total>
        );
    }

    return (
        <Container>
            <Header>Groep {game.name}</Header>
            <Content>{cups}</Content>
        </Container>
    );
}
