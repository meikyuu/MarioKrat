import React from 'react';
import styled from 'styled-components';
import theme from '../../../theme';
import Slot from './Slot';

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

const POSITION_SCORES = {
    1: 15,
    2: 12,
    3: 10,
    4: 8,
    5: 7,
    6: 6,
    7: 5,
    8: 4,
    9: 3,
    10: 2,
    11: 1,
    12: 0,
    null: 0,
};

export default function Game({ game }) {
    const scores = game.players.map(() => 0);
    const cups = game.results.map((cup, i) => {
        // Get cup scores
        let done = true;
        const cupScores = game.players.map(() => 0);
        for (const race of cup) {
            for (let player = 0; player < game.players.length; player++) {
                cupScores[player] += POSITION_SCORES[race[player]];
                if (race[player] === null) {
                    done = false;
                }
            }
        }
        // Get ranking
        const ranking = (
            cupScores
            .map((points, player) => ({ points, player }))
            .sort((l, r) => r.points - l.points)
            .map(({ player }) => player)
        );
        // Create cup
        const baseY = game.results.length > 1 ? 2 : 1;
        return (
            <Cup races={cup.length} key={i}>
                {game.results.length > 1 && (
                    <HeaderCell x={0} y={0} width={3 + cup.length}>
                        Cup {i + 1}
                    </HeaderCell>
                )}
                <HeaderCell x={0} y={baseY - 1}>#</HeaderCell>
                <HeaderCell x={1} y={baseY - 1}>Speler</HeaderCell>
                {cup.map((_, i) => (
                    <HeaderCell key={i} x={2 + i} y={baseY - 1}>R{i + 1}</HeaderCell>
                ))}
                <HeaderCell x={2 + cup.length} y={baseY - 1}>Score</HeaderCell>
                {ranking.map((player, y) => {
                    let rank = y;
                    while (
                        game.results.length > 1 &&
                        rank > 0 &&
                        cupScores[ranking[rank]] === cupScores[ranking[rank - 1]]
                    ) {
                        rank--;
                    }

                    if (done) {
                        scores[player] += (
                            (game.players.length - rank) * (cup.length * 15) +
                            cupScores[player]
                        );
                    }

                    return (
                        <React.Fragment key={y}>
                            <Cell x={0} y={baseY + y}>
                                {rank + 1}
                            </Cell>
                            <Cell x={1} y={baseY + y}>
                                <Slot slot={game.players[player]} />
                            </Cell>
                            {cup.map((race, i) => (
                                <Cell key={i} x={2 + i} y={baseY + y}>
                                    {race[player] || '-'}
                                </Cell>
                            ))}
                            <Cell x={2 + cup.length} y={baseY + y}>
                                {cupScores[player]} 
                            </Cell>
                        </React.Fragment>
                    );
                })}
            </Cup>
        );
    });

    if (game.results.length > 1) {
        const ranking = (
            scores
            .map((points, player) => ({ points, player }))
            .sort((l, r) => r.points - l.points)
            .map(({ player }) => player)
        );

        cups.push(
            <Total key="total">
                <HeaderCell x={0} y={0} width={3}>
                    Totaal
                </HeaderCell>
                <HeaderCell x={0} y={1}>#</HeaderCell>
                <HeaderCell x={1} y={1}>Speler</HeaderCell>
                <HeaderCell x={2} y={1}>Score</HeaderCell>
                {ranking.map((player, rank) => (
                    <>
                        <Cell x={0} y={rank + 2}>
                            {rank + 1}
                        </Cell>
                        <Cell x={1} y={rank + 2}>
                            <Slot slot={game.players[player]} />
                        </Cell>
                        <Cell x={2} y={rank + 2}>
                            {scores[player]} 
                        </Cell>
                    </>
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
