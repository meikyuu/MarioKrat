import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import api from '../../api';
import Loader from '../../component/Loader';
import Game from './View/Game';
import Rank from './View/Rank';
import TournamentContext from './View/Context';

const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
`;

const FlexContainer = styled.div`
    display: flex;
    margin-bottom: 1rem;
    &:last-child {
        margin-bottom: 0;
    }
`;

export default function ViewTournament({ token }) {
    const [tournament, setTournament] = useState(null);

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
            <Container>
                <h1>{tournament.name}</h1>
                {rounds.map((round, i) => (
                    <FlexContainer key={i}>
                        {round.map((game, i) => (
                            <Game key={i} game={game} players={tournament.players} />
                        ))}
                    </FlexContainer>
                ))}
                <FlexContainer>
                    {tournament.ranks.map((rank, i) => (
                        <Rank key={i} rank={rank} players={tournament.players} />
                    ))}
                </FlexContainer>
            </Container>
        </TournamentContext.Provider>
    );
}
