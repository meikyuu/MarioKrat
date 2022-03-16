import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import api from '../../api';
import theme from '../../theme';
import Loader from '../../component/Loader';
import Icon from '../../component/Icon';
import Group from '../../component/Group';
import Game from './View/Game';
import Slot from './View/Slot';
import ShareModal from './View/ShareModal';
import ResultModal from './View/ResultModal';
import TournamentContext from './View/Context';

const Container = styled.div`
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    ${({ blur }) => blur ? `
        filter: blur(8px);
    ` : ``}
`;

const GridContainer = styled.div`
    display: grid;

    grid-template-columns: 1fr;
    @media only screen and (min-width: 1200px) {
        /* Desktop */
        grid-template-columns: repeat(${({ children, maxWidth }) => Math.min(children.length, maxWidth)}, 1fr);
    }
    grid-gap: 1rem;

    margin-bottom: 1rem;
    &:last-child {
        margin-bottom: 0;
    }
`;

const ShareIcon = styled(Icon)`
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.25rem;
    cursor: pointer;
    color: ${theme.textColor};
    &:hover {
        color: ${theme.textColorP1};
    }
    transition: color 300ms ease;
`;

const Bars = styled.div`
    display: flex;
    justify-content: center;
    align-items: flex-end;
    margin-top: 0.5rem;
`;

const BarContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    color: ${({ color }) => color};
    font-weight: bold;
    margin-right: 0.5rem;
    &:last-child {
        margin-right: 0;
    }
`;

const Bar = styled.div`
    width: 6rem;
    height: ${({ size = 1 }) => 6 * size}rem;
    background-color: ${theme.bgColorN2};
    border-radius: 0.5rem;
    margin-top: 0.25rem;
    font-size: 2.5rem;
    text-align: center;
    line-height: 4rem;
`;

const Rank = styled.div`
    margin-top: 0.5rem;
    text-align: center;
    color: ${theme.textColorN2};
    font-weight: bold;
`;

const PROTOCOL_MAP = {
    'http:': 'ws:',
    'https:': 'wss:',
};

function applyChange(data, [path, value]) {
    console.log('CHANGE', data, path, value);
    if (path.length === 0) {
        return value;
    }

    const [head, ...tail] = path;

    if (Array.isArray(data)) {
        return [
            ...data.slice(0, head),
            applyChange(data[head], [tail, value]),
            ...data.slice(head + 1),
        ];
    } else if (typeof data === 'object') {
        return {
            ...data,
            [head]: applyChange(data[head], [tail, value]),
        };
    } else {
        throw new Error(`unknown key: ${head}`);
    }
}

function applyChanges(data, changes) {
    for (const change of changes) {
        data = applyChange(data, change);
    }
    return data;
}

export default function ViewTournament({ token }) {
    const [tournament, setTournament] = useState(null);
    const [share, setShare] = useState(false);
    const [result, setResult] = useState(null);
    const socketRef = useRef(null);

    const currentResult = (
        tournament !== null &&
        tournament.admin_token !== undefined &&
        tournament.next_races.length > 0 &&
        result !== null &&
        tournament.next_races.some((next_race) => (
            result.game === next_race.game &&
            result.cup === next_race.cup &&
            result.race === next_race.race
        ))
    );

    useEffect(() => {
        api.get(`tournament/${token}/`)
            .then((res) => setTournament(res.data))
            .catch((res) => {
                // TODO show errors
            });

        if (socketRef.current) {
            socketRef.current.close();
        }

        socketRef.current = new WebSocket(`${PROTOCOL_MAP[window.location.protocol]}//${window.location.host}/api/tournament/${token}/`);
    }, [token]);

    useEffect(() => {
        socketRef.current.onmessage = (e) => setTournament(applyChanges(tournament, JSON.parse(e.data)));
    }, [token, tournament]);

    const rounds = useMemo(() => {
        if (tournament === null) {
            return null;
        }

        const rounds = {};
        for (const game of tournament.games) {
            if (rounds[game.round] === undefined) {
                rounds[game.round] = [];
            }
            rounds[game.round].push(game);
        }

        return (
            Object.entries(rounds)
            .sort(([lround, lgames], [rround, rgames]) => lround - rround)
            .map(([round, games]) => games)
        );
    }, [tournament]);

    if (tournament === null) {
        return <Loader />;
    }

    return (
        <TournamentContext.Provider value={tournament}>
            <Container blur={share || currentResult}>
                <h1>{tournament.name}</h1>
                {rounds.map((round, i) => (
                    <Group label={`Ronde ${i + 1}`}>
                        <GridContainer key={i} maxWidth={2} data-test={`grid-container ${i + 1}`}>
                            {round.map((game, i) => (
                                <Game
                                    key={i}
                                    game={game}
                                    players={tournament.players}
                                    onClickNextRace={() => setResult(tournament.next_races.find((next_race) => next_race.game === game.name) || null)}
                                />
                            ))}
                        </GridContainer>
                    </Group>
                ))}
                <Group label="Uitslag">
                    <Bars>
                        <BarContainer color="#B8C0C8">
                            {tournament.ranks.length >= 2 && (
                                <Slot slot={tournament.ranks[1]} />
                            )}
                            <Bar size={1}>2</Bar>
                        </BarContainer>
                        <BarContainer color="#D0B040">
                            {tournament.ranks.length >= 1 && (
                                <Slot slot={tournament.ranks[0]} />
                            )}
                            <Bar size={1.4}>1</Bar>
                        </BarContainer>
                        <BarContainer color="#A07840">
                            {tournament.ranks.length >= 3 && (
                                <Slot slot={tournament.ranks[2]} />
                            )}
                            <Bar size={0.8}>3</Bar>
                        </BarContainer>
                    </Bars>
                    {tournament.ranks.slice(3).map(({ rank, ...slot }) => (
                        <Rank key={rank}>
                            {rank}. <Slot slot={slot} />
                        </Rank>
                    ))}
                </Group>
                <ShareIcon name="share" onClick={() => setShare(true)} />
            </Container>
            <ShareModal
                open={share}
                onClose={() => setShare(false)}
            />
            {result && (
                <ResultModal
                    open={currentResult}
                    next_race={result}
                    onClose={() => setResult(null)}
                    onChangeTournament={setTournament}
                />
            )}
        </TournamentContext.Provider>
    );
}
