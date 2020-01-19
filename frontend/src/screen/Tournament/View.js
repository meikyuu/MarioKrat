import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import api from '../../api';
import theme from '../../theme';
import Loader from '../../component/Loader';
import Icon from '../../component/Icon';
import Group from '../../component/Group';
import Game from './View/Game';
import Slot from './View/Slot';
import ShareModal from './View/ShareModal';
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

export default function ViewTournament({ token }) {
    const [tournament, setTournament] = useState(null);
    const [share, setShare] = useState(false);

    useEffect(() => {
        api.get(`tournament/${token}/`)
            .then((res) => setTournament(res.data))
            .catch((res) => {
                // TODO show errors
            });
    }, [token]);

    const rounds = useMemo(() => {
        if (tournament === null) {
            return null;
        }

        const gamesProcessed = {};
        const rounds = [];

        while (true) {
            const round = [];

            for (const game of tournament.games) {
                if (
                    !gamesProcessed[game.name] &&
                    game.players.every((slot) => (
                        slot.type === 'player' ||
                        (slot.type === 'slot' && gamesProcessed[slot.game])
                    ))
                ) {
                    round.push(game);
                }
            }

            if (round.length === 0) {
                break;
            } else {
                for (const game of round) {
                    gamesProcessed[game.name] = true;
                }
                rounds.push(round);
            }
        }

        return rounds;
    }, [tournament]);

    if (tournament === null) {
        return <Loader />;
    }

    return (
        <TournamentContext.Provider value={tournament}>
            <Container blur={share}>
                <h1>{tournament.name}</h1>
                {rounds.map((round, i) => (
                    <Group label={`Ronde ${i + 1}`}>
                        <GridContainer key={i} maxWidth={2}>
                            {round.map((game, i) => (
                                <Game key={i} game={game} players={tournament.players} />
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
                    {tournament.ranks.slice(3).map((slot, rank) => (
                        <Rank key={rank}>
                            {rank + 3}. <Slot slot={slot} />
                        </Rank>
                    ))}
                </Group>
                <ShareIcon name="share" onClick={() => setShare(true)} />
            </Container>
            <ShareModal
                open={share}
                onClose={() => setShare(false)}
            />
        </TournamentContext.Provider>
    );
}
