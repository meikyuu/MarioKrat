import React, { useContext } from 'react';
import styled from 'styled-components';
import theme from '../../../theme';
import range from '../../../helpers/range';
import Slot from './Slot';
import TournamentContext from './Context';
import Scrollbars from 'react-custom-scrollbars';
import Rainbow from '../../../image/Rainbow.svg';

const Container = styled.div`
    border-radius: 0.5rem;
    background-color: ${theme.bgColorP1};
    overflow: hidden;
`;

const HEADER_BG_COLOR = {
    waiting: theme.bgColorP2,
    active: theme.primaryColor,
    done: theme.bgColorN1,
};

const HEADER_FG_COLOR = {
    waiting: theme.textColorP1,
    active: theme.textColorP2,
    done: theme.textColorN2,
};

const Header = styled.div`
    text-align: center;
    font-weight: bold;
    color: ${({ state }) => HEADER_FG_COLOR[state]};
    background-color: ${({ state }) => HEADER_BG_COLOR[state]};
    padding: 0.25rem;
`;

const Content = styled.div`
    /* Content div of scrollbars */
    > div > div:first-child {
        display: flex;
        flex-direction: column;
        @media only screen and (min-width: 600px) {
            /* Desktop */
            flex-direction: row;
        }
    }
`;

const Table = styled.div`
    display: grid;
    grid-gap: 0.15rem 0.35rem;
    flex: 1 1 auto;
    margin: 0.5rem;
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
    text-align: ${({ textAlign = 'center' }) => textAlign};
    ${({ active }) => active ? `
        pointer-events: none;
    ` : ``}
`;

const HeaderCell = styled(Cell)`
    background-color: ${({ active }) => active ? theme.primaryColor : theme.bgColor};
    color: ${({ active }) => active ? theme.textColorP2 : theme.textColorN2};
    font-weight: bold;
    font-size: 0.6em;
    padding: 0.1rem 0rem;
    margin: 0 -0.1rem;
    border-radius: 0.2rem;
    text-align: center;
`;

const ActiveCell = styled(Cell)`
    background-color: ${theme.bgColorP2};
    cursor: pointer;
    padding: 0.1rem 0rem;
    margin: 0 -0.1rem;
    border-radius: 0.2rem;
`;

const InlineImg = styled.img`
    height: 1em;
    position: relative;
    top: 0.2em;
    margin: 0 0.1em;
`;

export default function Game({ game, onClickNextRace }) {
    const { next_race } = useContext(TournamentContext);

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
                {range(races).map((j) => (
                    <HeaderCell
                        key={j}
                        x={2 + j}
                        y={baseY - 1}
                        active={
                            next_race &&
                            next_race.game === game.name &&
                            next_race.cup === i + 1 &&
                            next_race.race === j + 1
                        }
                    >
                        R{j + 1}
                    </HeaderCell>
                ))}
                <HeaderCell x={2 + races} y={baseY - 1}>Score</HeaderCell>
                {next_race && next_race.game === game.name && next_race.cup === i + 1 && (
                    <ActiveCell
                        x={1 + next_race.race}
                        y={baseY}
                        height={game.players.length}
                        onClick={onClickNextRace}
                    />
                )}
                {cup.map((score, y) => (
                    <React.Fragment key={y}>
                        <Cell x={0} y={baseY + y}>
                            {score.rank}
                        </Cell>
                        <Cell x={1} y={baseY + y} textAlign="left">
                            <Slot slot={game.players[score.player]} />
                            {score.fag && (
                                <>{' '}<InlineImg src={Rainbow} /></>
                            )}
                        </Cell>
                        {score.races.map((position, j) => (
                            <Cell
                                key={j}
                                x={2 + j}
                                y={baseY + y}
                                active={
                                    next_race &&
                                    next_race.game === game.name &&
                                    next_race.cup === i + 1 &&
                                    next_race.race === j + 1
                                }
                            >
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
                    Eindklassement
                </HeaderCell>
                <HeaderCell x={0} y={1}>#</HeaderCell>
                <HeaderCell x={1} y={1}>Speler</HeaderCell>
                <HeaderCell x={2} y={1}>Score</HeaderCell>
                {game.total.map((score, y) => (
                    <React.Fragment key={y}>
                        <Cell x={0} y={y + 2}>
                            {score.rank}
                        </Cell>
                        <Cell x={1} y={y + 2} textAlign="left">
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
            <Header state={game.state}>Groep {game.name}</Header>
            <Content>
                <Scrollbars autoHeight autoHeightMax={99999}>
                    {cups}
                </Scrollbars>
            </Content>
        </Container>
    );
}
